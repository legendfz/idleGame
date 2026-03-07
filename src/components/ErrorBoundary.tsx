import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 32,
          textAlign: 'center',
          color: '#fff',
          background: '#1a1a2e',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <h2 style={{ color: '#f0c040' }}>⚠️ 游戏加载出错</h2>
          <p style={{ color: '#aaa', maxWidth: 300 }}>
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={() => {
              try {
                localStorage.removeItem('xiyou-idle-save');
                localStorage.removeItem('xiyou-idle-backup-1');
                localStorage.removeItem('xiyou-idle-backup-2');
                localStorage.removeItem('xiyou-idle-backup-3');
              } catch {}
              // Clear SW cache to force fresh load
              if ('caches' in window) {
                caches.keys().then(names => names.forEach(n => caches.delete(n)));
              }
              if (navigator.serviceWorker) {
                navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
              }
              setTimeout(() => window.location.reload(), 500);
            }}
            style={{
              marginTop: 16,
              padding: '8px 24px',
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            清除存档并重新加载
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '8px 24px',
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
