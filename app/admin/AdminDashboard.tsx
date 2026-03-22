'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type Opinion = {
  id: string;
  content: string;
  category: string;
  hashtags: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editState, setEditState] = useState<
    Record<string, { category: string; hashtags: string }>
  >({});

  const [adminContent, setAdminContent] = useState('');
  const [adminCategory, setAdminCategory] = useState('');
  const [adminHashtags, setAdminHashtags] = useState('');

  const fetchOpinions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/opinions', {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.refresh();
          return;
        }

        throw new Error(data.error || '데이터를 불러오지 못했습니다.');
      }

      setOpinions(data);
    } catch (fetchError: any) {
      console.error(fetchError);
      setError(fetchError.message || '데이터를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpinions();
  }, []);

  const handleUpdate = async (
    id: string,
    updates: Partial<Pick<Opinion, 'status' | 'category' | 'hashtags' | 'content'>>,
  ) => {
    try {
      const response = await fetch(`/api/opinions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '데이터를 수정하지 못했습니다.');
      }

      fetchOpinions();
    } catch (fetchError: any) {
      console.error(fetchError);
      setError(fetchError.message || '데이터 수정 중 문제가 발생했습니다.');
    }
  };

  const handleApprove = (
    id: string,
    currentCategory: string,
    currentHashtags: string[],
  ) => {
    const edit = editState[id];
    let category = currentCategory || '기타';
    let hashtags = currentHashtags || [];

    if (edit) {
      if (edit.category !== undefined) {
        category = edit.category;
      }

      if (edit.hashtags !== undefined) {
        hashtags = edit.hashtags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
    }

    handleUpdate(id, { status: 'approved', category, hashtags });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/opinions/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '데이터를 삭제하지 못했습니다.');
      }

      fetchOpinions();
    } catch (fetchError: any) {
      console.error(fetchError);
      setError(fetchError.message || '데이터 삭제 중 문제가 발생했습니다.');
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adminContent.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/admin/opinions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: adminContent,
          category: adminCategory || '관리자 리서치',
          hashtags: adminHashtags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          status: 'approved',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '관리자 데이터를 저장하지 못했습니다.');
      }

      setAdminContent('');
      setAdminCategory('');
      setAdminHashtags('');
      fetchOpinions();
    } catch (fetchError: any) {
      console.error(fetchError);
      setError(fetchError.message || '관리자 데이터 저장 중 문제가 발생했습니다.');
    }
  };

  const handleEditChange = (
    id: string,
    field: 'category' | 'hashtags',
    value: string,
  ) => {
    setEditState((previous) => ({
      ...previous,
      [id]: {
        ...previous[id],
        [field]: value,
      },
    }));
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.refresh();
  };

  return (
    <main className={styles.container}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>관리자 데이터베이스</h1>
          <p className={styles.description}>
            입력 폼에서 쌓인 데이터를 열람하고, 상태를 변경하거나 관리자 데이터를 직접 추가할 수 있습니다.
          </p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          로그아웃
        </button>
      </div>

      <div className={styles.adminFormContainer}>
        <h3>관리자 수동 입력</h3>
        <form onSubmit={handleCreate} className={styles.adminForm}>
          <textarea
            placeholder="데이터베이스에 직접 저장할 의견을 입력해 주세요."
            value={adminContent}
            onChange={(event) => setAdminContent(event.target.value)}
            required
            className={styles.inputArea}
          />
          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="카테고리"
              value={adminCategory}
              onChange={(event) => setAdminCategory(event.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="해시태그 (쉼표로 구분)"
              value={adminHashtags}
              onChange={(event) => setAdminHashtags(event.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.submitBtn}>
              직접 등록
            </button>
          </div>
        </form>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>상태</th>
                <th>내용</th>
                <th>카테고리</th>
                <th>태그 (쉼표 구분)</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {opinions.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    데이터가 없습니다
                  </td>
                </tr>
              ) : (
                opinions.map((opinion) => (
                  <tr key={opinion.id}>
                    <td>
                      <span className={`${styles.status} ${styles[opinion.status]}`}>
                        {opinion.status === 'pending'
                          ? '대기중'
                          : opinion.status === 'approved'
                            ? '승인됨'
                            : '거절됨'}
                      </span>
                    </td>
                    <td className={styles.contentCell}>{opinion.content}</td>
                    <td>
                      <input
                        className={styles.editInput}
                        value={editState[opinion.id]?.category ?? opinion.category ?? ''}
                        onChange={(event) =>
                          handleEditChange(opinion.id, 'category', event.target.value)
                        }
                        placeholder="카테고리"
                      />
                    </td>
                    <td>
                      <input
                        className={styles.editInput}
                        value={
                          editState[opinion.id]?.hashtags ??
                          (opinion.hashtags ? opinion.hashtags.join(', ') : '')
                        }
                        onChange={(event) =>
                          handleEditChange(opinion.id, 'hashtags', event.target.value)
                        }
                        placeholder="태그"
                      />
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(opinion.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actions}>
                        {opinion.status === 'pending' && (
                          <>
                            <button
                              onClick={() =>
                                handleApprove(opinion.id, opinion.category, opinion.hashtags || [])
                              }
                              className={styles.approveBtn}
                            >
                              저장 및 승인
                            </button>
                            <button
                              onClick={() => handleDelete(opinion.id)}
                              className={styles.rejectBtn}
                            >
                              삭제
                            </button>
                          </>
                        )}
                        {opinion.status !== 'pending' && (
                          <>
                            <button
                              onClick={() =>
                                handleApprove(opinion.id, opinion.category, opinion.hashtags || [])
                              }
                              className={styles.approveBtn}
                            >
                              수정 저장
                            </button>
                            <button
                              onClick={() => handleUpdate(opinion.id, { status: 'pending' })}
                              className={styles.rejectBtn}
                            >
                              대기중으로 변경
                            </button>
                            <button
                              onClick={() => handleDelete(opinion.id)}
                              className={styles.rejectBtn}
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
