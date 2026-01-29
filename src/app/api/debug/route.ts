import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbStatus = await checkDatabaseConnection();

    return NextResponse.json({
      status: 'ok',
      database: dbStatus,
      env: {
        hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
        hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
        hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
        betterAuthUrl: process.env.BETTER_AUTH_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
