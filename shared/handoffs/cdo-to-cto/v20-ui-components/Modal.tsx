import React, { useEffect, useCallback } from 'react';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  closeOnOverlay?: boolean;  // 默认 true
  children: React.ReactNode;
  className?: string;
}

/**
 * 通用弹窗
 *
 * @example
 * <Modal open={showModal} title="🌙 离线收益" onClose={() => setShow(false)}>
 *   <p>🪙 +128,400</p>
 *   <Button onClick={() => setShow(false)}>✅ 领取</Button>
 * </Modal>
 */
export function Modal({
  open,
  title,
  onClose,
  closeOnOverlay = true,
  children,
  className,
}: ModalProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={closeOnOverlay ? onClose : undefined}>
      <div
        className={[styles.content, className].filter(Boolean).join(' ')}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button className={styles.closeBtn} onClick={onClose} aria-label="关闭">✕</button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
