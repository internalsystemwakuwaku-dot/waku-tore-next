import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ========================================
// Better Auth Tables
// ========================================
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ========================================
// App-specific Tables
// ========================================

// Card assignments (replaces Google Sheet data)
export const cardAssignments = sqliteTable('card_assignments', {
  id: text('id').primaryKey(), // Trello Card ID
  kochikuUserId: text('kochiku_user_id'),
  systemUserId: text('system_user_id'),
  shodanUserId: text('shodan_user_id'),
  mtgUserId: text('mtg_user_id'),
  systemType: text('system_type'),
  link: text('link'),
  memo1: text('memo1'),
  memo2: text('memo2'),
  memo3: text('memo3'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Memos (personal, shared, and card-attached)
export const memos = sqliteTable('memos', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'personal' | 'shared' | 'card'
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  cardId: text('card_id'), // For card memos
  deadline: integer('deadline', { mode: 'timestamp' }),
  relatedUsers: text('related_users'), // JSON array of user IDs
  isFinished: integer('is_finished', { mode: 'boolean' }).default(false),
  trelloCommentId: text('trello_comment_id'), // For Trello sync
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Operation logs
export const operationLogs = sqliteTable('operation_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'move', 'assign', 'update_due', etc.
  cardId: text('card_id'),
  details: text('details'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Game data
export const gameData = sqliteTable('game_data', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  xp: integer('xp').default(0),
  level: integer('level').default(1),
  money: integer('money').default(1000),
  totalClicks: integer('total_clicks').default(0),
  autoClickers: integer('auto_clickers').default(0),
  purchasedItems: text('purchased_items'), // JSON array
  settings: text('settings'), // JSON
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Keiba (horse racing) results
export const keibaResults = sqliteTable('keiba_results', {
  raceId: text('race_id').primaryKey(), // YYYYMMDD-RaceNumber
  result: text('result').notNull(), // JSON [1st, 2nd, 3rd, 4th, 5th, 6th]
  allBets: text('all_bets'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Keiba transactions
export const keibaTransactions = sqliteTable('keiba_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'bet' | 'payout' | 'refund'
  amount: integer('amount').notNull(),
  description: text('description'),
  balanceAfter: integer('balance_after'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Gacha history
export const gachaHistory = sqliteTable('gacha_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  itemId: text('item_id').notNull(),
  itemName: text('item_name').notNull(),
  rarity: text('rarity').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Member settings
export const memberSettings = sqliteTable('member_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  role: text('role').notNull(), // 'kochiku' | 'system' | 'shodan' | 'mtg'
  displayName: text('display_name').notNull(),
  userId: text('user_id').references(() => users.id),
  sortOrder: integer('sort_order').default(0),
});

// Type exports for Drizzle
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type CardAssignment = typeof cardAssignments.$inferSelect;
export type Memo = typeof memos.$inferSelect;
export type OperationLog = typeof operationLogs.$inferSelect;
export type GameDataRecord = typeof gameData.$inferSelect;
