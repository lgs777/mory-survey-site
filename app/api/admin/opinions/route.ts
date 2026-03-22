import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { isAdminDatabaseConfigured, supabaseAdmin } from '@/lib/supabase-admin';

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function ensureAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSession(token);
}

export async function GET(request: NextRequest) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  if (!supabaseAdmin || !isAdminDatabaseConfigured()) {
    return NextResponse.json(
      { error: '데이터베이스가 아직 연결되지 않았습니다.' },
      { status: 503 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from('opinions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const { content, category, hashtags, status } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (!supabaseAdmin || !isAdminDatabaseConfigured()) {
      return NextResponse.json(
        { error: '데이터베이스가 아직 연결되지 않았습니다.' },
        { status: 503 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from('opinions')
      .insert([
        {
          content,
          category: category || '관리자 리서치',
          hashtags: hashtags || [],
          status: status || 'approved',
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });

    if (!supabaseAdmin || !isAdminDatabaseConfigured()) {
      return NextResponse.json(
        { error: '데이터베이스가 아직 연결되지 않았습니다.' },
        { status: 503 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from('opinions')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
