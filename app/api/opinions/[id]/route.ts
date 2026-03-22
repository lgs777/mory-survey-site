import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Make sure we only update provided fields
    const updates: any = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.category !== undefined) updates.category = body.category;
    if (body.hashtags !== undefined) updates.hashtags = body.hashtags;
    if (body.content !== undefined) updates.content = body.content;

    if (supabase) {
      const { data, error } = await supabase
        .from('opinions')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return NextResponse.json(data[0]);
    }
    return NextResponse.json({ id, ...updates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (supabase) {
      const { error } = await supabase.from('opinions').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
