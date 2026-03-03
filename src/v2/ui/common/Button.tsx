import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({ children, variant = 'primary', disabled, onClick }: Props) {
  return (
    <button className={`v2-btn v2-btn-${variant}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
