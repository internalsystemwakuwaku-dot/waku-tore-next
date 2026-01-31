'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { cardAssignments, operationLogs, memos } from '@/lib/db/schema';
import { trello } from './client';
import { eq } from 'drizzle-orm';
import type { TrelloBoardData, ExtendedCard, CardAssignment } from '@/types/trello';

// Helper to get current session
async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

// ========================================
// Read Operations
// ========================================

export async function getTrelloData(): Promise<TrelloBoardData> {
  await getSession();
  const boardId = process.env.TRELLO_BOARD_ID!;
  return trello.getBoardData(boardId);
}

export async function getCardsWithAssignments(): Promise<ExtendedCard[]> {
  await getSession();

  const boardId = process.env.TRELLO_BOARD_ID!;
  const [boardData, assignments] = await Promise.all([
    trello.getBoardData(boardId),
    db.select().from(cardAssignments),
  ]);

  const assignmentMap = new Map(
    assignments.map((a) => [a.id, a])
  );

  return boardData.cards.map((card) => ({
    ...card,
    assignment: assignmentMap.get(card.id) || undefined,
  }));
}

export async function getCardAssignment(cardId: string): Promise<CardAssignment | null> {
  await getSession();

  const result = await db
    .select()
    .from(cardAssignments)
    .where(eq(cardAssignments.id, cardId))
    .limit(1);

  return result[0] || null;
}

// ========================================
// Write Operations
// ========================================

export async function moveCard(cardId: string, listId: string, listName?: string) {
  const session = await getSession();

  await trello.moveCard(cardId, listId);

  // Log the operation
  await db.insert(operationLogs).values({
    userId: session.user.id,
    action: 'move',
    cardId,
    details: JSON.stringify({ listId, listName }),
  });

  revalidatePath('/');
  return { success: true };
}

export async function updateCardDue(cardId: string, due: string | null) {
  const session = await getSession();

  await trello.updateCardDue(cardId, due);

  await db.insert(operationLogs).values({
    userId: session.user.id,
    action: 'update_due',
    cardId,
    details: JSON.stringify({ due }),
  });

  revalidatePath('/');
  return { success: true };
}

export async function saveCardAssignment(
  cardId: string,
  data: Partial<Omit<CardAssignment, 'id' | 'updatedAt'>>
) {
  const session = await getSession();

  const existing = await db
    .select()
    .from(cardAssignments)
    .where(eq(cardAssignments.id, cardId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cardAssignments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cardAssignments.id, cardId));
  } else {
    await db.insert(cardAssignments).values({
      id: cardId,
      ...data,
      updatedAt: new Date(),
    });
  }

  await db.insert(operationLogs).values({
    userId: session.user.id,
    action: 'assign',
    cardId,
    details: JSON.stringify(data),
  });

  revalidatePath('/');
  return { success: true };
}

export async function toggleCardPin(cardId: string, isPinned: boolean) {
  await getSession();

  const existing = await db
    .select()
    .from(cardAssignments)
    .where(eq(cardAssignments.id, cardId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cardAssignments)
      .set({ isPinned, updatedAt: new Date() })
      .where(eq(cardAssignments.id, cardId));
  } else {
    await db.insert(cardAssignments).values({
      id: cardId,
      isPinned,
      updatedAt: new Date(),
    });
  }

  revalidatePath('/');
  return { success: true };
}

// ========================================
// Comment / Memo Operations
// ========================================

export async function addTrelloComment(cardId: string, text: string) {
  const session = await getSession();

  const comment = await trello.addComment(cardId, text);

  await db.insert(operationLogs).values({
    userId: session.user.id,
    action: 'add_comment',
    cardId,
    details: JSON.stringify({ commentId: comment.id, text }),
  });

  revalidatePath('/');
  return { success: true, commentId: comment.id };
}

export async function deleteTrelloComment(commentId: string, cardId?: string) {
  const session = await getSession();

  await trello.deleteComment(commentId);

  await db.insert(operationLogs).values({
    userId: session.user.id,
    action: 'delete_comment',
    cardId: cardId || null,
    details: JSON.stringify({ commentId }),
  });

  revalidatePath('/');
  return { success: true };
}

// ========================================
// Bulk Operations
// ========================================

export async function bulkMoveCards(cardIds: string[], listId: string, listName?: string) {
  const session = await getSession();

  const results = await Promise.allSettled(
    cardIds.map((cardId) => trello.moveCard(cardId, listId))
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  await db.insert(operationLogs).values({
    userId: session.user.id,
    action: 'bulk_move',
    cardId: null,
    details: JSON.stringify({ cardIds, listId, listName, successful, failed }),
  });

  revalidatePath('/');
  return { success: true, successful, failed };
}

export async function bulkUpdateAssignments(
  cardIds: string[],
  data: Partial<Omit<CardAssignment, 'id' | 'updatedAt'>>
) {
  const session = await getSession();

  for (const cardId of cardIds) {
    const existing = await db
      .select()
      .from(cardAssignments)
      .where(eq(cardAssignments.id, cardId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cardAssignments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(cardAssignments.id, cardId));
    } else {
      await db.insert(cardAssignments).values({
        id: cardId,
        ...data,
        updatedAt: new Date(),
      });
    }
  }

  await db.insert(operationLogs).values({
    userId: session.user.id,
    action: 'bulk_assign',
    cardId: null,
    details: JSON.stringify({ cardIds, data }),
  });

  revalidatePath('/');
  return { success: true };
}

// ========================================
// Log Operations
// ========================================

export async function getCardLogs(cardId: string) {
  await getSession();

  const logs = await db
    .select()
    .from(operationLogs)
    .where(eq(operationLogs.cardId, cardId))
    .orderBy(operationLogs.createdAt);

  return logs.map((log) => ({
    ...log,
    details: log.details ? JSON.parse(log.details) : null,
  }));
}
