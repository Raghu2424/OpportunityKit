import { useEffect, useRef } from 'react';
import Icon, { categoryIcon } from './Icon.jsx';
import StatusBadge, { ReadinessBar } from './StatusBadge.jsx';
import RequirementList from './RequirementList.jsx';
import { evaluateRequirements } from '../lib/matching.js';
import { EMPTY_PROFILE } from '../data/sampleProfiles.js';
import { deadlineLabel } from '../lib/format.js';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function OpportunityDetail({ opportunity: o, result, onClose, onToggleDoc, onEditProfile, onOpenChecklist, onGoProfile }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Focus the dialog on open, restore focus on close, trap Tab, close on Escape, lock page scroll.
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialog) return;
      const nodes = [...dialog.querySelectorAll(FOCUSABLE)].filter((n) => !n.disabled);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  const items = result ? result.requirements : evaluateRequirements(EMPTY_PROFILE, o);
  const open = result ? result.openItems : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-paper shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink/10 bg-paper px-5 py-4 sm:px-6">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
              <Icon name={categoryIcon(o.category)} className="h-4 w-4" />
              {o.category}
              <span className="rounded-md border border-dashed border-ink/30 px-2 py-0.5 text-xs font-medium text-ink-soft">Demo data</span>
            </p>
            <h2 id="detail-title" className="mt-1 text-2xl font-extrabold leading-tight">{o.title}</h2>
            <p className="text-ink-soft">{o.organization} · {o.mode}</p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close details">
            <Icon name="x" />
            Close
          </button>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-6">
          <p>{o.description}</p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold">Reward</dt><dd className="text-ink-soft">{o.reward}</dd></div>
            <div><dt className="font-semibold">Timing</dt><dd className="text-ink-soft">{deadlineLabel(o.deadlineInDays)}</dd></div>
          </dl>

          <section aria-labelledby="why-title" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 id="why-title" className="text-lg font-bold">{result ? 'Why this result' : 'What this opportunity requires'}</h3>
              {result && <StatusBadge status={result.status} size="lg" />}
            </div>

            {result ? (
              <>
                <p className="rounded-lg border border-ink/10 bg-white p-4 font-medium">{result.summary}</p>
                <ReadinessBar value={result.readiness} label={`Readiness: ${result.metCount} of ${result.total} requirements met`} />
              </>
            ) : (
              <p className="rounded-lg border border-brand/30 bg-brand-tint p-4 text-sm">
                Create a profile to see which of these you meet and what you still need.{' '}
                <button type="button" className="font-semibold text-brand underline" onClick={onGoProfile}>Build my profile</button>
              </p>
            )}

            <RequirementList items={items} neutral={!result} onToggleDoc={onToggleDoc} onEditProfile={onEditProfile} />
          </section>
        </div>

        {result && (
          <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 bg-paper px-5 py-4 sm:px-6">
            <p className="text-sm text-ink-soft">
              {open.length === 0 ? 'Nothing left to do.' : `${open.length} open item${open.length > 1 ? 's' : ''}`}
            </p>
            <button type="button" className="btn btn-primary" onClick={() => onOpenChecklist(o.id)}>
              Open readiness checklist
              <Icon name="arrow" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
