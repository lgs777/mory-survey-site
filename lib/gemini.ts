import 'server-only';

import {
  OPINION_CATEGORIES,
  normalizeOpinionCategory,
  normalizeOpinionHashtags,
  type OpinionCategory,
} from '@/lib/opinion-taxonomy';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

type OpinionClassification = {
  category: OpinionCategory;
  hashtags: string[];
};

type GeminiContentPart = {
  text?: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiContentPart[];
  };
};

type GeminiGenerateContentResponse = {
  candidates?: GeminiCandidate[];
};

type GeminiClassificationPayload = {
  category?: string;
  hashtags?: unknown;
};

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || '';
}

export function isGeminiConfigured() {
  return Boolean(getGeminiApiKey());
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function buildFallbackClassification(fallback?: {
  category?: string | null;
  hashtags?: unknown;
}): OpinionClassification {
  return {
    category: normalizeOpinionCategory(fallback?.category),
    hashtags: normalizeOpinionHashtags(fallback?.hashtags),
  };
}

function buildClassificationPrompt(content: string) {
  return `
다음 사용자 의견을 한국 장례 문화/서비스 설문 분류 기준에 맞춰 분석해 주세요.

카테고리 후보:
${OPINION_CATEGORIES.map((category) => `- ${category}`).join('\n')}

규칙:
- category는 위 목록 중 정확히 하나만 선택합니다.
- hashtags는 2개 또는 3개를 생성합니다.
- hashtags는 # 기호 없이 작성합니다.
- hashtags는 공백 없는 짧은 한국어 표현으로 작성합니다.
- 너무 포괄적인 단어보다 의견의 핵심 불편 또는 니즈를 반영합니다.

사용자 의견:
"""${content.trim()}"""
  `.trim();
}

function extractTextFromResponse(payload: GeminiGenerateContentResponse) {
  for (const candidate of payload.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (typeof part.text === 'string' && part.text.trim()) {
        return part.text;
      }
    }
  }

  return '';
}

export async function classifyOpinionWithGemini(
  content: string,
  fallback?: {
    category?: string | null;
    hashtags?: unknown;
  },
): Promise<OpinionClassification> {
  const fallbackClassification = buildFallbackClassification(fallback);
  const apiKey = getGeminiApiKey();
  const trimmedContent = content.trim();

  if (!apiKey || !trimmedContent) {
    return fallbackClassification;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(getGeminiModel())}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: buildClassificationPrompt(trimmedContent) }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseJsonSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: [...OPINION_CATEGORIES],
                  description: '장례 문화 설문 의견에 가장 잘 맞는 카테고리',
                },
                hashtags: {
                  type: 'array',
                  description: '# 없이 쓰는 핵심 해시태그 2~3개',
                  minItems: 2,
                  maxItems: 3,
                  items: {
                    type: 'string',
                  },
                },
              },
              required: ['category', 'hashtags'],
            },
          },
        }),
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      console.error('Gemini classification failed:', await response.text());
      return fallbackClassification;
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;
    const text = extractTextFromResponse(payload);

    if (!text) {
      return fallbackClassification;
    }

    const parsed = JSON.parse(text) as GeminiClassificationPayload;
    const hashtags = normalizeOpinionHashtags(parsed.hashtags);

    return {
      category: parsed.category
        ? normalizeOpinionCategory(parsed.category)
        : fallbackClassification.category,
      hashtags: hashtags.length > 0 ? hashtags : fallbackClassification.hashtags,
    };
  } catch (error) {
    console.error('Gemini classification error:', error);
    return fallbackClassification;
  }
}
