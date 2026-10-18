import { useEffect } from 'react';
import Icon from './Icon.jsx';

export default function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4" role="status" aria-live="polite">
      {toast && (
        <p
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.tone === 'error' ? 'bg-rose-800' : 'bg-ink'
          }`}
        >
          <Icon name={toast.tone === 'error' ? 'alert' : 'check'} />
          {toast.message}
        </p>
      )}
    </div>
  );
}
