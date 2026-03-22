'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function AdminPage() {
  const [opinions, setOpinions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editState, setEditState] = useState<Record<string, { category: string; hashtags: string }>>({});

  const [adminContent, setAdminContent] = useState('');
  const [adminCategory, setAdminCategory] = useState('');
  const [adminHashtags, setAdminHashtags] = useState('');

  const fetchOpinions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/opinions');
      const data = await res.json();
      setOpinions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpinions();
  }, []);

  const handleUpdate = async (id: string, updates: any) => {
    try {
      await fetch('/api/opinions/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchOpinions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = (id: string, currentCategory: string, currentHashtags: string[]) => {
    const edit = editState[id];
    let category = currentCategory || '기타';
    let hashtags = currentHashtags || [];
    
    if (edit) {
      if (edit.category !== undefined) category = edit.category;
      if (edit.hashtags !== undefined) {
        hashtags = edit.hashtags.split(',').map(h => h.trim()).filter(h => h);
      }
    }
    
    handleUpdate(id, { status: 'approved', category, hashtags });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetch('/api/opinions/' + id, { method: 'DELETE' });
      fetchOpinions();
    } catch (e) { console.error(e); }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminContent.trim()) return;
    try {
      const res = await fetch('/api/opinions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: adminContent,
          category: adminCategory || '관리자 리서치',
          hashtags: adminHashtags.split(',').map(h => h.trim()).filter(h => h)
        })
      });
      const newOp = await res.json();
      if (newOp.id) {
        // Automatically approve admin inputs
        await fetch('/api/opinions/' + newOp.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        });
      }
      setAdminContent('');
      setAdminCategory('');
      setAdminHashtags('');
      fetchOpinions();
    } catch (e) { console.error(e); }
  }

  const handleEditChange = (id: string, field: 'category' | 'hashtags', value: string) => {
    setEditState(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>관리자 대시보드</h1>
      
      <div className={styles.adminFormContainer}>
        <h3>관리자 리서치 등록</h3>
        <form onSubmit={handleCreate} className={styles.adminForm}>
          <textarea 
            placeholder="개선점 내용" 
            value={adminContent} 
            onChange={e => setAdminContent(e.target.value)} 
            required 
            className={styles.inputArea}
          />
          <div className={styles.formRow}>
            <input 
              type="text" 
              placeholder="카테고리" 
              value={adminCategory} 
              onChange={e => setAdminCategory(e.target.value)} 
              className={styles.input}
            />
            <input 
              type="text" 
              placeholder="해시태그 (쉼표로 구분)" 
              value={adminHashtags} 
              onChange={e => setAdminHashtags(e.target.value)} 
              className={styles.input}
            />
            <button type="submit" className={styles.submitBtn}>직접 등록</button>
          </div>
        </form>
      </div>

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
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {opinions.length === 0 ? (
                <tr><td colSpan={5} className={styles.empty}>데이터가 없습니다</td></tr>
              ) : (
                opinions.map(op => (
                  <tr key={op.id}>
                    <td>
                      <span className={`${styles.status} ${styles[op.status]}`}>
                        {op.status === 'pending' ? '대기중' : op.status === 'approved' ? '승인됨' : '거절됨'}
                      </span>
                    </td>
                    <td className={styles.contentCell}>{op.content}</td>
                    <td>
                      <input 
                        className={styles.editInput}
                        value={editState[op.id]?.category ?? op.category ?? ''}
                        onChange={(e) => handleEditChange(op.id, 'category', e.target.value)}
                        placeholder="카테고리"
                      />
                    </td>
                    <td>
                      <input 
                        className={styles.editInput}
                        value={editState[op.id]?.hashtags ?? (op.hashtags ? op.hashtags.join(', ') : '')}
                        onChange={(e) => handleEditChange(op.id, 'hashtags', e.target.value)}
                        placeholder="태그"
                      />
                    </td>
                    <td className={styles.actions}>
                      {op.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(op.id, op.category, op.hashtags)} className={styles.approveBtn}>저장 및 승인</button>
                          <button onClick={() => handleDelete(op.id)} className={styles.rejectBtn}>삭제</button>
                        </>
                      )}
                      {op.status !== 'pending' && (
                        <>
                          <button onClick={() => handleApprove(op.id, op.category, op.hashtags)} className={styles.approveBtn}>수정 저장</button>
                          <button onClick={() => handleUpdate(op.id, { status: 'pending' })} className={styles.rejectBtn}>대기중으로 변경</button>
                          <button onClick={() => handleDelete(op.id)} className={styles.rejectBtn}>삭제</button>
                        </>
                      )}
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
