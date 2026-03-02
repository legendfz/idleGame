import React from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps {
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * 通用按钮组件
 *
 * @example
 * <Button variant="primary" onClick={handleClick}>突破！</Button>
 * <Button variant="danger" loading>分解中…</Button>
 * <Button variant="secondary" disabled>条件不足</Button>
 * <Button fullWidth>⚔️ 开始挑战</Button>
 */
export function Button({
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  onClick,
  className,
}: ButtonProps) {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <span className={styles.spinner}>⏳</span> : children}
    </button>
  );
}
