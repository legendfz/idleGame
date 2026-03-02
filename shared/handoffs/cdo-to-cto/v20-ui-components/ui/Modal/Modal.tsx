import { ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  closeOnOverlay?: boolean;
  children: ReactNode;
}

/**
 * 通用弹窗
 *
 * @example
 * <Modal open={showModal} title="🌙 离线收益" onClose={() => setShow(false)}>
 *   <p>内容</p>
 *   <Button onClick={() => setShow(false)}>确认</Button>
 * </Modal>
 */
export function Modal({ open, title, onClose, closeOnOverlay = true, children }: ModalProps) {
  // 禁止背景滚动
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={closeOnOverlay ? onClose : undefined}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        {title && (
          <div className={styles.header}>
            <span className={styles.title}>{title}</span>
            <button className={styles.close} onClick={onClose}>✕</button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
