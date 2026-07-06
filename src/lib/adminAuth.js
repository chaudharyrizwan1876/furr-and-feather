// Session cookie ko sign/verify karne ke liye helper.
// Web Crypto API (crypto.subtle) use karte hain — yeh Node.js aur Edge
// dono runtimes mein kaam karta hai, isliye proxy.js (jo Node runtime
// par chalta hai Next.js 16 mein) aur API routes dono ke liye ek hi
// helper use ho sakta hai.

const COOKIE_NAME = 'ff_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 din

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

// Session token banata hai — userId aur isAdmin dono encode karta hai,
// taake login ke waqt hi pata chal jaye user ko kahan redirect karna hai
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

// Session token verify karta hai — signature aur expiry dono check karta hai
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
