'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Nanum_Myeongjo } from 'next/font/google';
import styles from './page.module.css';

interface Opinion {
  id: string;
  content: string;
  category: string;
  hashtags: string[];
}

type RankingGroup = {
  category: string;
  count: number;
  summary: string;
};

const nanumMyeongjo = Nanum_Myeongjo({
  weight: ['800'],
  preload: false,
});

function tokenizeContent(content: string) {
  return Array.from(
    new Set(
      content
        .split(/\s+/)
        .map((token) => token.replace(/[^0-9A-Za-z가-힣]/g, '').trim())
        .filter((token) => token.length >= 2),
    ),
  );
}

function buildGroupSummary(opinions: Opinion[]) {
  if (opinions.length === 0) {
    return '';
  }

  const scoredOpinions = opinions.map((opinion) => {
    const candidateTokens = tokenizeContent(opinion.content);
    const candidateHashtags = new Set(opinion.hashtags);

    let score = 0;

    for (const other of opinions) {
      if (other.id === opinion.id) {
        continue;
      }

      const sharedHashtags = other.hashtags.filter((tag) => candidateHashtags.has(tag)).length;
      const otherTokens = tokenizeContent(other.content);
      const sharedTokens = otherTokens.filter((token) => candidateTokens.includes(token)).length;

      score += sharedHashtags * 3 + sharedTokens;
    }

    return {
      content: opinion.content.trim().replace(/\s+/g, ' '),
      score,
    };
  });

  scoredOpinions.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return right.content.length - left.content.length;
  });

  return scoredOpinions[0]?.content ?? '';
}

export default function RankingsPage() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);

  useEffect(() => {
    fetch('/api/opinions')
      .then(res => res.json())
      .then(data => setOpinions(data))
      .catch(console.error);
  }, []);

  // Group and sort by category for TOP 20 simulation
  const categorized = opinions.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, Opinion[]>);

  const rankingGroups: RankingGroup[] = Object.entries(categorized)
    .map(([category, groupedOpinions]) => ({
      category,
      count: groupedOpinions.length,
      summary: buildGroupSummary(groupedOpinions),
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 20); // Show up to 20

  return (
    <div className={styles.wrapper}>
      <header className={styles.topHeader}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/logo_mori_fill.svg"
              alt="Mory"
              width={51}
              height={68}
              className={styles.logoImage}
              priority
            />
            <span className={styles.brandLabel}>장례 문화가 불편했던 순간</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/rankings">TOP 20</Link>
        </nav>
      </header>

      <main className={styles.mainLayout}>
        <section className={styles.leftColumn}>
          <h1 className={`${styles.title} ${nanumMyeongjo.className}`}>
            장례식이 불편한 순간<br/>
            TOP 20
          </h1>
          <p className={styles.subtitle}>
            그동안 사람들이 가장 많이 공감한 의견이에요.<br/>
            여러분이 보여주신 관심 잊지 않고,<br/>
            적극적으로 개선하겠습니다.
          </p>
        </section>

        <section className={styles.rightColumn}>
          <div className={styles.rankingsList}>
            {rankingGroups.length === 0 && (
              <p className={styles.empty}>데이터를 불러오는 중이거나 없습니다.</p>
            )}
            {rankingGroups.map((group, idx) => (
              <div key={group.category} className={`${styles.listItem} glass`}>
                <div className={styles.rank}>{idx + 1}위</div>
                <div className={styles.contentBlock}>
                  <div className={styles.content}>{group.summary}</div>
                  <div className={styles.meta}>{group.category} 관련 의견</div>
                </div>
                <div className={styles.count}>{group.count}명</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
