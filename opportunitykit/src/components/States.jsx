import Icon from './Icon.jsx';

export function LoadingGrid({ count = 6, label = 'Loading opportunities' }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}…</span>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="panel space-y-3 p-5">
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-6 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title, children, actions }) {
  return (
    <div className="panel mx-auto max-w-xl px-6 py-12 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand">
        <Icon name="inbox" className="h-6 w-6" />
      </span>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-ink-soft">{children}</p>
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div role="alert" className="mx-auto max-w-xl rounded-xl border border-rose-300 bg-rose-50 px-6 py-10 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-800">
        <Icon name="alert" className="h-6 w-6" />
      </span>
      <h2 className="text-xl font-bold text-rose-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-rose-900">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary mt-6" onClick={onRetry}>
          <Icon name="refresh" />
          Try again
        </button>
      )}
    </div>
  );
}

export function Notice({ tone = 'warning', children, onDismiss }) {
  const cls =
    tone === 'warning'
      ? 'border-amber-400 bg-amber-50 text-amber-950'
      : 'border-brand/30 bg-brand-tint text-ink';
  return (
    <div role="alert" className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${cls}`}>
      <p>{children}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="-m-1 rounded p-1 hover:bg-black/5" aria-label="Dismiss message">
          <Icon name="x" />
        </button>
      )}
    </div>
  );
}
