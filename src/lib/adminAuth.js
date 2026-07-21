// Helper for signing/verifying the session cookie.
// Uses the Web Crypto API (crypto.subtle) — this works in both Node.js and
// Edge runtimes, so the same helper can be used by proxy.js (which runs on
// the Node runtime in Next.js 16) and the API routes.

const COOKIE_NAME = 'ff_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.JWT_SECRET || 'fallback-secret-change-me';
  return new TextEncoder().encode(secret);
}

async function hmacSign(data) {
  const key = await crypto.subtle.importKey(
    'raw',
    getSecret(),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Buffer.from(signature).toString('base64url');
}

// Creates a session token — encodes both userId and isAdmin, so at login time
// it's already known where to redirect the user
export async function createSessionToken({ userId, name, email, isAdmin }) {
  const payload = JSON.stringify({
    userId,
    name,
    email,
    isAdmin: !!isAdmin,
    exp: Date.now() + SESSION_DURATION_MS,
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = await hmacSign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

// Verifies a session token — checks both the signature and the expiry
export async function verifySessionToken(token) {
  if (!token || !token.includes('.')) return null;

  const [encodedPayload, signature] = token.split('.');
  const expectedSignature = await hmacSign(encodedPayload);

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
