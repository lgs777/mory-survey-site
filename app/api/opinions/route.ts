import { NextResponse } from 'next/server';
import { isPublicDatabaseConfigured } from '@/lib/supabase-admin';
import { supabase, mockOpinions } from '@/lib/supabase';

export async function GET() {
  if (supabase) {
    const { data, error } = await supabase
      .from('opinions')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    // Return mock data for local testing
    return NextResponse.json(mockOpinions);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, category, hashtags } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (supabase && isPublicDatabaseConfigured()) {
      const { error } = await supabase
        .from('opinions')
        .insert([{ content, category: category || '기타', hashtags: hashtags || [], status: 'pending' }])
        ;

      if (error) throw error;
      return NextResponse.json({ success: true }, { status: 201 });
    }

    return NextResponse.json(
      { error: '데이터베이스가 아직 연결되지 않았습니다.' },
      { status: 503 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
