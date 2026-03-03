import { ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  borderColor?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', style, borderColor, onClick }: Props) {
  return (
    <div
      className={`v2-card ${className}`}
      style={{ ...style, borderLeftColor: borderColor }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
