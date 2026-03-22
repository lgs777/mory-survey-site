'use client';

import { useState } from 'react';

export default function InlineOpinionForm() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/opinions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setContent('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || '의견을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (err) {
      console.error(err);
      setError('네트워크 문제로 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f5f4f0', borderRadius: '12px', border: '1px solid #e7e5e4', textAlign: 'center' }}>
        <h3 style={{ color: '#52453C', marginBottom: '0.5rem', fontWeight: 'bold' }}>✓ 소중한 의견 감사합니다</h3>
        <p style={{ color: '#78716c', fontSize: '0.95rem' }}>남겨주신 이야기는 검토 후 모리 서비스에 반영하도록 할게요.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <textarea
        placeholder="어떤 점이 불편하셨나요? 자유롭게 남겨주세요."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={300}
        style={{
          width: '100%',
          height: '140px',
          background: '#fcfbf7', // slightly off-white for input or #fdfcf8
          border: '1px solid #e7e5e4',
          borderRadius: '12px',
          padding: '1rem',
          color: '#52453C',
          fontFamily: 'inherit',
          fontSize: '1rem',
          resize: 'none',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#52453C';
          e.target.style.boxShadow = '0 0 0 2px rgba(82, 69, 60, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e7e5e4';
          e.target.style.boxShadow = 'none';
        }}
      />
      {error && <p style={{ fontSize: '0.9rem', color: '#b42318' }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: '#a8a29e' }}>{content.length} / 300</span>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          style={{
            background: content.trim() ? '#52453C' : '#e7e5e4',
            color: content.trim() ? '#fff' : '#a8a29e',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: content.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s, transform 0.2s'
          }}
          onMouseOver={(e) => content.trim() && (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseOut={(e) => content.trim() && (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isSubmitting ? '전송 중...' : '의견 남기기'}
        </button>
      </div>
    </form>
  );
}
