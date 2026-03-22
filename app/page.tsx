import styles from './page.module.css';
import Link from 'next/link';
import { supabase, mockOpinions } from '@/lib/supabase';
import InlineOpinionForm from '@/components/InlineOpinionForm';

export const revalidate = 0; // Disable caching to fetch fresh data

export default async function Home() {
  let opinions = mockOpinions;
  
  if (supabase) {
    const { data } = await supabase
      .from('opinions')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      opinions = data;
    }
  }

  // Removed old toss colors because we use designSystem standard.
  // Instead of colored cards, we'll use clean white cards.

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <strong>Mory</strong> <span className={styles.logoDivider}>|</span> 장례문화가 불편한 순간
        </div>
        <nav className={styles.nav}>
          <Link href="/rankings">TOP 20</Link>
        </nav>
      </header>

      <main className={styles.mainLayout}>
        <section className={styles.leftColumn}>
          <h1 className={styles.title}>
            현재 장례문화가 불편할 때,<br/>
            언제였나요?
          </h1>
          <InlineOpinionForm />
        </section>

        <section className={`${styles.rightColumnWrapper} ${opinions.length > 5 ? styles.scrollableRightColumn : ''}`}>
          <div className={styles.scrollInner}>
            <div className={styles.rightColumn}>
              {opinions.map((op, i) => {
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
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
