import Icon, { categoryIcon } from './Icon.jsx';
import StatusBadge, { ReadinessBar } from './StatusBadge.jsx';
import { deadlineLabel } from '../lib/format.js';

export default function OpportunityCard({ opportunity: o, result, onOpen }) {
  return (
    <article className="panel flex h-full flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-tint px-2.5 py-1 text-xs font-semibold text-brand-dark">
          <Icon name={categoryIcon(o.category)} className="h-3.5 w-3.5" />
          {o.category}
        </span>
        <span className="rounded-md border border-dashed border-ink/30 px-2 py-0.5 text-xs font-medium text-ink-soft">Demo data</span>
      </div>

      <h3 className="mt-3 text-lg font-bold leading-snug">{o.title}</h3>
      <p className="text-sm text-ink-soft">
        {o.organization} · {o.mode}
      </p>
      <p className="mt-1 text-sm font-medium">{o.reward}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
        <Icon name="clock" className="h-3.5 w-3.5" />
        {deadlineLabel(o.deadlineInDays)}
      </p>

      <div className="mt-4 flex-1 space-y-3 border-t border-ink/10 pt-4">
        <StatusBadge status={result?.status ?? 'none'} />
        <p className="text-sm">
          {result ? result.summary : 'Create a profile to see whether you match and why.'}
        </p>
        {result && <ReadinessBar value={result.readiness} />}
      </div>

      <button
        type="button"
        className="btn btn-secondary mt-4 w-full"
        onClick={() => onOpen(o.id)}
        aria-label={`See details and reasons for ${o.title}`}
      >
        {result ? 'See why' : 'See requirements'}
        <Icon name="arrow" />
      </button>
    </article>
  );
}
