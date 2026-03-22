import { after, NextResponse } from 'next/server';
import { classifyOpinionWithGemini, isGeminiConfigured } from '@/lib/gemini';
import {
  isAdminDatabaseConfigured,
  isPublicDatabaseConfigured,
  supabaseAdmin,
} from '@/lib/supabase-admin';
import {
  normalizeOpinionCategory,
  normalizeOpinionHashtags,
} from '@/lib/opinion-taxonomy';
import { supabase, mockOpinions } from '@/lib/supabase';

export const maxDuration = 30;

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
    const opinionId = crypto.randomUUID();
    const initialClassification = {
      category: normalizeOpinionCategory(
        typeof category === 'string' ? category : undefined,
      ),
      hashtags: normalizeOpinionHashtags(hashtags),
    };

    if (!trimmedContent) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (supabase && isPublicDatabaseConfigured()) {
      const { error } = await supabase
        .from('opinions')
        .insert([
          {
            id: opinionId,
            content: trimmedContent,
            category: initialClassification.category,
            hashtags: initialClassification.hashtags,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      const adminClient = supabaseAdmin;

      if (isGeminiConfigured() && adminClient && isAdminDatabaseConfigured()) {
        after(async () => {
          try {
            const classification = await classifyOpinionWithGemini(trimmedContent, {
              category: initialClassification.category,
              hashtags: initialClassification.hashtags,
            });

            const { error: updateError } = await adminClient
              .from('opinions')
              .update({
                category: classification.category,
                hashtags: classification.hashtags,
              })
              .eq('id', opinionId);

            if (updateError) {
              console.error('Opinion classification update failed:', updateError.message);
            }
          } catch (classificationError) {
            console.error('Opinion classification job failed:', classificationError);
          }
        });
      }

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
