import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function AdminHeader() {
  return (
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
          <span className={styles.brandLabel}>| 장례 희망</span>
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/">메인</Link>
        <Link href="/rankings">TOP 20</Link>
      </nav>
    </header>
  );
}
