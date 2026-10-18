import Icon from './Icon.jsx';

// Status is always shown as icon + words, never colour alone.
export const STATUS_UI = {
  match: { label: 'Match', icon: 'check', cls: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
  missing: { label: 'Missing information', icon: 'alert', cls: 'border-amber-400 bg-amber-50 text-amber-950' },
  mismatch: { label: 'Mismatch', icon: 'x', cls: 'border-rose-300 bg-rose-50 text-rose-900' },
  none: { label: 'Not assessed', icon: 'clock', cls: 'border-ink/20 bg-white text-ink-soft' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const ui = STATUS_UI[status] ?? STATUS_UI.none;
  const pad = size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${pad} ${ui.cls}`}>
      <Icon name={ui.icon} className="h-3.5 w-3.5" />
      {ui.label}
    </span>
  );
}

export function ReadinessBar({ value, label = 'Readiness' }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs font-medium text-ink-soft">
        <span>{label}</span>
        <span className="font-semibold text-ink">{value}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-2 overflow-hidden rounded-full bg-ink/10"
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
