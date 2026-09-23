import { createHmac } from 'node:crypto';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  iat: number;
}

function base64urlEncode(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8');
}

function computeSignature(header: string, payload: string, secret: string): string {
  return createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
}

export function createJwt(data: Omit<JwtPayload, 'iat'>): string {
  const secret = process.env['JWT_SECRET'] ?? '';
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64urlEncode(
    JSON.stringify({ ...data, iat: Math.floor(Date.now() / 1000) }),
  );
  const signature = computeSignature(header, payload, secret);
  return `${header}.${payload}.${signature}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts as [string, string, string];
  const secret = process.env['JWT_SECRET'] ?? '';
  const expected = computeSignature(header, payload, secret);
  if (signature !== expected) return null;

  try {
    return JSON.parse(base64urlDecode(payload)) as JwtPayload;
  } catch {
    return null;
  }
}
