import { createHmac } from 'crypto';

/**
 * JWT-like token structure (simplified)
 */
interface TokenPayload {
  username: string;
  iat: number; // issued at (timestamp in seconds)
  exp: number; // expiration (timestamp in seconds)
}

/**
 * Token verification result
 */
export interface TokenVerification {
  valid: boolean;
  username?: string;
  error?: string;
}

/**
 * Generate a signing key from the password
 */
function getSigningKey(): string {
  const password = process.env.AUTH_PASSWORD || 'default_insecure_key';
  return password;
}

/**
 * Validate user credentials against environment variables
 */
export function validateCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedPassword = process.env.AUTH_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    console.warn('AUTH_USERNAME or AUTH_PASSWORD not configured');
    return false;
  }

  return username === expectedUsername && password === expectedPassword;
}

/**
 * Generate an authentication token for a user
 */
export function generateAuthToken(username: string): string {
  const now = Math.floor(Date.now() / 1000);
  const expiration = now + 86400; // 24 hours

  const payload: TokenPayload = {
    username,
    iat: now,
    exp: expiration,
  };

  // Encode payload as base64
  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadJson).toString('base64url');

  // Generate HMAC signature
  const signingKey = getSigningKey();
  const hmac = createHmac('sha256', signingKey);
  hmac.update(payloadBase64);
  const signature = hmac.digest('base64url');

  // Combine payload and signature
  return `${payloadBase64}.${signature}`;
}

/**
 * Verify an authentication token
 */
export function verifyAuthToken(token: string): TokenVerification {
  try {
    // Split token into payload and signature
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [payloadBase64, signature] = parts;

    // Verify signature
    const signingKey = getSigningKey();
    const hmac = createHmac('sha256', signingKey);
    hmac.update(payloadBase64);
    const expectedSignature = hmac.digest('base64url');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Decode payload
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload: TokenPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false, error: 'Token expired' };
    }

    return {
      valid: true,
      username: payload.username,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { valid: false, error: 'Token verification failed' };
  }
}

