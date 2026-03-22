export const OPINION_CATEGORIES = [
  '분위기',
  '편의성',
  '추모방식',
  '절차',
  '환경/비용',
  '의식',
  '식문화',
  '의복',
  '트렌드',
  '소통',
  '기타',
  '비용',
  '인프라',
  '행정',
  '답례풍습',
  '사회인식',
] as const;

export type OpinionCategory = (typeof OPINION_CATEGORIES)[number];

const opinionCategorySet = new Set<string>(OPINION_CATEGORIES);

export function normalizeOpinionCategory(value?: string | null): OpinionCategory {
  const normalized = value?.trim();

  if (normalized && opinionCategorySet.has(normalized)) {
    return normalized as OpinionCategory;
  }

  return '기타';
}

export function normalizeOpinionHashtags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueHashtags = new Set<string>();

  for (const item of value) {
    if (typeof item !== 'string') {
      continue;
    }

    const normalized = item.replace(/^#+/, '').trim().replace(/\s+/g, '');

    if (!normalized) {
      continue;
    }

    uniqueHashtags.add(normalized.slice(0, 24));

    if (uniqueHashtags.size === 3) {
      break;
    }
  }

  return Array.from(uniqueHashtags);
}
