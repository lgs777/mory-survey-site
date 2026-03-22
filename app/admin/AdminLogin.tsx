'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import AdminHeader from './AdminHeader';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '비밀번호가 올바르지 않습니다.');
        return;
      }

      router.refresh();
    } catch (fetchError) {
      console.error(fetchError);
      setError('인증 요청 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageShell}>
      <AdminHeader />
      <main className={styles.loginShell}>
        <section className={styles.loginCard}>
          <p className={styles.loginEyebrow}>Protected Admin Page</p>
          <h1 className={styles.loginTitle}>데이터베이스 열람 페이지</h1>
          <p className={styles.loginDescription}>
            저장된 의견 데이터를 확인하거나 수동으로 등록하려면 관리자 비밀번호가 필요합니다.
          </p>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <label htmlFor="admin-password" className={styles.loginLabel}>
              PASSWORD
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={styles.loginInput}
              placeholder="관리자 비밀번호를 입력해 주세요"
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
            <button
              type="submit"
              disabled={!password.trim() || isSubmitting}
              className={styles.loginButton}
            >
              {isSubmitting ? '확인 중...' : '페이지 열기'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
