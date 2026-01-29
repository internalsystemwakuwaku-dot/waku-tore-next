import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// Root page - redirects based on auth status
// The actual dashboard is rendered by (dashboard)/page.tsx
export default async function RootPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  // If authenticated, the (dashboard) layout will handle rendering
  // This component won't actually render because (dashboard)/page.tsx
  // takes precedence for the "/" route
  return null;
}
