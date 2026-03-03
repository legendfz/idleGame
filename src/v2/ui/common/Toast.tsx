import { useUIStore } from '../../store/uiStore';
import { useEffect } from 'react';

export default function Toast() {
  const queue = useUIStore(s => s.toastQueue);
  const consume = useUIStore(s => s.consumeToast);

  useEffect(() => {
    if (queue.length > 0) {
      const timer = setTimeout(consume, 3000);
      return () => clearTimeout(timer);
    }
  }, [queue, consume]);

  if (queue.length === 0) return null;
  const t = queue[0];

  return (
    <div className={`v2-toast v2-toast-${t.type}`}>
      {t.text}
    </div>
  );
}
