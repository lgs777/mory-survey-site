import 'server-only';

import { createHash, timingSafeEqual } from 'crypto';

export const ADMIN_SESSION_COOKIE = 'mory_admin_session';

const DEFAULT_ADMIN_PASSWORD = 'mory1234!';
const DEFAULT_SESSION_SECRET = 'mory-admin-session-v1';

function sha256(value: string) {
  return createHash('sha256').update(value).digest();
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;
}

export function isValidAdminPassword(input: string) {
  return safeCompare(
    sha256(input).toString('hex'),
    sha256(getAdminPassword()).toString('hex'),
  );
}

export function createAdminSessionToken() {
  return createHash('sha256')
    .update(`${getAdminPassword()}:${getSessionSecret()}`)
    .digest('hex');
}

export function isValidAdminSession(token?: string) {
  if (!token) {
    return false;
  }

  return safeCompare(token, createAdminSessionToken());
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 12,
};
