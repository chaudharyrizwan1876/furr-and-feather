import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/adminAuth';

// Verifies the request's session cookie belongs to a logged-in admin.
// Returns the session payload, or null if the caller isn't an admin.
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session || !session.isAdmin) return null;
  return session;
}
