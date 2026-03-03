import { ReactNode } from 'react';

export function Card({ title, titleColor, children, className, style, borderColor, onClick }: {
  title?: string; titleColor?: string; children: ReactNode;
  className?: string; style?: React.CSSProperties; borderColor?: string;
  onClick?: () => void;
}) {
  return (
    <div className={`card ${className ?? ''}`} style={{ ...style, borderColor }} onClick={onClick}>
      {title && <div className="card-title" style={{ color: titleColor ?? 'var(--accent)' }}>{title}</div>}
      {children}
    </div>
  );
}
