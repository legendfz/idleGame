import { ReactNode } from 'react';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ visible, onClose, title, children }: Props) {
  if (!visible) return null;
  return (
    <div className="v2-modal-overlay" onClick={onClose}>
      <div className="v2-modal-content" onClick={e => e.stopPropagation()}>
        {title && <h2 className="v2-modal-title">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
