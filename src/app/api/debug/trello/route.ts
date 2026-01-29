import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = process.env.TRELLO_API_KEY;
    const apiToken = process.env.TRELLO_API_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;

    if (!apiKey || !apiToken || !boardId) {
      return NextResponse.json({
        status: 'error',
        error: 'Missing Trello credentials',
        hasApiKey: !!apiKey,
        hasApiToken: !!apiToken,
        hasBoardId: !!boardId,
      }, { status: 500 });
    }

    // Test Trello API
    const url = `https://api.trello.com/1/boards/${boardId}?key=${apiKey}&token=${apiToken}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        status: 'error',
        error: `Trello API Error: ${response.status}`,
        details: errorText,
        boardId,
      }, { status: 500 });
    }

    const board = await response.json();

    return NextResponse.json({
      status: 'ok',
      board: {
        id: board.id,
        name: board.name,
        url: board.url,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
