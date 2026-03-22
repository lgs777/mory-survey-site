'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import logoImage from '@/logo.png';

interface Opinion {
  id: string;
  content: string;
  category: string;
  hashtags: string[];
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

  const topCategories = Object.entries(categorized)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20); // Show up to 20

  return (
    <div className={styles.wrapper}>
      <header className={styles.topHeader}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src={logoImage}
              alt="Mory"
              className={styles.logoImage}
              priority
            />
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/rankings">TOP 20</Link>
        </nav>
      </header>

      <main className={styles.mainLayout}>
        <section className={styles.leftColumn}>
          <h1 className={styles.title}>
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
            {topCategories.length === 0 && (
              <p className={styles.empty}>데이터를 불러오는 중이거나 없습니다.</p>
            )}
            {topCategories.map(([category, ops], idx) => (
              <div key={category} className={`${styles.listItem} glass`}>
                <div className={styles.rank}>{idx + 1}위</div>
                <div className={styles.content}>{category}</div>
                <div className={styles.count}>{ops.length}명</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
