import { NextResponse } from 'next/server';
import { classifyOpinionWithGemini } from '@/lib/gemini';
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
    const trimmedContent = typeof content === 'string' ? content.trim() : '';

    if (!trimmedContent) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (supabase && isPublicDatabaseConfigured()) {
      const classification = await classifyOpinionWithGemini(trimmedContent, {
        category,
        hashtags,
      });

      const { error } = await supabase
        .from('opinions')
        .insert([
          {
            content: trimmedContent,
            category: classification.category,
            hashtags: classification.hashtags,
            status: 'pending',
          },
        ]);

      if (error) throw error;
      return NextResponse.json(
        { success: true, classification },
        { status: 201 },
      );
    }

    return NextResponse.json(
      { error: '데이터베이스가 아직 연결되지 않았습니다.' },
      { status: 503 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
