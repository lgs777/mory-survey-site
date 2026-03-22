import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { isAdminDatabaseConfigured, supabaseAdmin } from '@/lib/supabase-admin';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function ensureAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSession(token);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!ensureAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Make sure we only update provided fields
    const updates: any = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.category !== undefined) updates.category = body.category;
    if (body.hashtags !== undefined) updates.hashtags = body.hashtags;
    if (body.content !== undefined) updates.content = body.content;

    if (!supabaseAdmin || !isAdminDatabaseConfigured()) {
      return NextResponse.json(
        { error: '데이터베이스가 아직 연결되지 않았습니다.' },
        { status: 503 },
      );
    }

    const { data, error } = await supabaseAdmin
        .from('opinions')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!ensureAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    if (!supabaseAdmin || !isAdminDatabaseConfigured()) {
      return NextResponse.json(
        { error: '데이터베이스가 아직 연결되지 않았습니다.' },
        { status: 503 },
      );
    }

    const { error } = await supabaseAdmin.from('opinions').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
