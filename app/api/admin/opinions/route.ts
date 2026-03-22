import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (supabase) {
    const { data, error } = await supabase
      .from('opinions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    // If mock, we just return empty array for admin, as we only mock GET for approved
    return NextResponse.json([], { status: 200 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });

    if (supabase) {
      const { data, error } = await supabase
        .from('opinions')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) throw error;
      return NextResponse.json(data[0]);
    }
    return NextResponse.json({ success: true, mocked: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
