import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const headersList = await headers();

    // Log all cookies for debugging
    const cookieHeader = headersList.get('cookie');

    const session = await auth.api.getSession({
      headers: headersList,
    });

    return NextResponse.json({
      status: 'ok',
      hasSession: !!session,
      session: session ? {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
      } : null,
      cookies: cookieHeader ? cookieHeader.split(';').map(c => c.trim().split('=')[0]) : [],
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
