import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  isValidAdminPassword,
  isValidAdminSession,
} from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  return NextResponse.json({
    authenticated: isValidAdminSession(token),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || !isValidAdminPassword(password)) {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      createAdminSessionToken(),
      adminSessionCookieOptions,
    );

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    ...adminSessionCookieOptions,
    maxAge: 0,
  });

  return response;
}
