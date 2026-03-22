'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './OpinionForm.module.css';

interface OpinionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpinionForm({ isOpen, onClose }: OpinionFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/opinions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setContent('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className={`${styles.modal} glass`}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <button className={styles.closeBtn} onClick={onClose}>×</button>
            
            {!success ? (
              <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>당신의 이야기를 들려주세요</h2>
                <p className={styles.desc}>장례식장에서 느꼈던 불편함이나 아쉬웠던 점을 남겨주시면,<br/>더 나은 장례 문화를 만드는데 큰 도움이 됩니다.</p>
                
                <textarea 
                  className={styles.textarea}
                  placeholder="예: 3일 내내 무거운 분위기 속에서 슬픔을 강요받는 것 같아 힘들었어요."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={300}
                />
                
                <div className={styles.footer}>
                  <span className={styles.length}>{content.length} / 300</span>
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={!content.trim() || isSubmitting}
                  >
                    {isSubmitting ? '전송 중...' : '의견 남기기'}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.successMessage}>
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: 'spring' }}
                  className={styles.checkIcon}
                >✓</motion.div>
                <h3>소중한 의견 감사합니다</h3>
                <p>남겨주신 이야기는 검토 후 게재될 수 있습니다.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
