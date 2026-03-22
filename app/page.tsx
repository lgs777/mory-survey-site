import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, mockOpinions } from '@/lib/supabase';
import InlineOpinionForm from '@/components/InlineOpinionForm';

export const revalidate = 0; // Disable caching to fetch fresh data

function sortByCreatedAtAscending<T extends { created_at?: string }>(opinions: T[]) {
  return [...opinions].sort((left, right) => {
    const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;

    return leftTime - rightTime;
  });
}

export default async function Home() {
  let opinions = supabase ? [] : mockOpinions;

  if (supabase) {
    const { data, error } = await supabase
      .from('opinions')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load approved opinions:', error.message);
    } else {
      opinions = data ?? [];
    }
  }

  const orderedOpinions = sortByCreatedAtAscending(opinions);

  // Removed old toss colors because we use designSystem standard.
  // Instead of colored cards, we'll use clean white cards.

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link href="/" aria-label="메인페이지로 이동">
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
          <h1 className={styles.title}>
            장례문화가 불편할 때,<br/>
            언제였나요?
          </h1>
          <InlineOpinionForm />
        </section>

        <section className={`${styles.rightColumnWrapper} ${orderedOpinions.length > 5 ? styles.scrollableRightColumn : ''}`}>
          <div className={styles.scrollInner}>
            <div className={styles.rightColumn}>
              {orderedOpinions.length === 0 ? (
                <div className={styles.emptyState}>
                  <strong>아직 승인된 의견이 없습니다.</strong>
                  <p>새로운 의견이 승인되면 이 영역에 카드가 표시됩니다.</p>
                </div>
              ) : (
                orderedOpinions.map((op, i) => {
                  return (
                    <div key={op.id ?? i} className={styles.card} style={{ backgroundColor: '#ffffff', color: '#52453C', border: '1px solid #e7e5e4' }}>
                      <div className={styles.cardHeader}>
                        <span>{['🤔','💬','💡','👀','🙌'][i % 5]}</span>
                        <span>{i + 1}번째 불편함</span>
                      </div>
                      <div className={styles.cardContent}>
                        {op.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
