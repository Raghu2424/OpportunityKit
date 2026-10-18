import { useEffect, useMemo } from 'react';
import Icon from './Icon.jsx';
import StatusBadge, { ReadinessBar } from './StatusBadge.jsx';
import RequirementList from './RequirementList.jsx';
import { EmptyState, LoadingGrid } from './States.jsx';
import { STATUS, aggregateDocumentActions, checklistToText, REQ } from '../lib/matching.js';
import { downloadTextFile, slugify } from '../lib/format.js';

export default function Checklist({
  results, loadState, hasProfile, selectedId, setSelectedId, onToggleDoc, onEditProfile, onGoProfile, onTrySample, notify,
}) {
  const ordered = useMemo(() => [...results].sort((a, b) => b.rank - a.rank), [results]);
  const actions = useMemo(() => aggregateDocumentActions(results), [results]);
  const selected = ordered.find((r) => r.opportunity.id === selectedId) ?? ordered[0] ?? null;

  // Keep the selection valid if it points at something that no longer exists.
  useEffect(() => {
    if (selected && selected.opportunity.id !== selectedId) setSelectedId(selected.opportunity.id);
  }, [selected, selectedId, setSelectedId]);

  if (loadState === 'loading') {
    return <Wrap><LoadingGrid count={3} label="Loading your checklist" /></Wrap>;
  }
  if (!hasProfile) {
    return (
      <Wrap>
        <EmptyState
          title="Your checklist starts with a profile"
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={onGoProfile}>Build my profile</button>
              <button type="button" className="btn btn-secondary" onClick={() => onTrySample('aarav')}>Try a sample student</button>
            </>
          }
        >
          Once OpportunityKit knows your course, skills and documents, it lists exactly what is missing for each opportunity and what to do next.
        </EmptyState>
      </Wrap>
    );
  }
  if (!selected) {
    return <Wrap><EmptyState title="No opportunities to show">The opportunity list is empty.</EmptyState></Wrap>;
  }

  const done = selected.requirements.filter((r) => r.status === REQ.MET);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(checklistToText(selected));
      notify('Checklist copied to clipboard');
    } catch {
      notify('Copying was blocked by the browser. Use Download instead.', 'error');
    }
  };
  const download = () => {
    downloadTextFile(`checklist-${slugify(selected.opportunity.title)}.txt`, checklistToText(selected));
    notify('Checklist downloaded');
  };

  return (
    <Wrap>
      {actions.length > 0 && (
        <section aria-labelledby="best-title" className="mb-8 rounded-xl border border-mark bg-mark/25 p-5">
          <h2 id="best-title" className="text-lg font-bold">Documents that unlock the most opportunities</h2>
          <p className="text-sm text-ink-soft">Counts exclude opportunities you do not match, since a document cannot fix an eligibility rule.</p>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {actions.slice(0, 3).map((a) => (
              <li key={a.docId} className="rounded-lg bg-white p-4">
                <p className="font-semibold">{a.label}</p>
                <p className="text-sm text-ink-soft">Needed for {a.count} opportunit{a.count > 1 ? 'ies' : 'y'}</p>
                <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => onToggleDoc(a.docId)}>
                  <Icon name="check" />
                  I have this ready
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <nav aria-label="Choose an opportunity">
          <h2 className="mb-3 text-lg font-bold">Opportunities</h2>
          <ul className="space-y-2">
            {ordered.map((r) => {
              const on = r.opportunity.id === selected.opportunity.id;
              return (
                <li key={r.opportunity.id}>
                  <button
                    type="button" aria-current={on ? 'true' : undefined} onClick={() => setSelectedId(r.opportunity.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${on ? 'border-ink bg-white shadow-sm' : 'border-ink/10 bg-white/60 hover:bg-white'}`}
                  >
                    <span className="block font-semibold leading-snug">{r.opportunity.title}</span>
                    <span className="block text-xs text-ink-soft">{r.opportunity.organization}</span>
                    <span className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge status={r.status} />
                      <span className="text-xs font-semibold">{r.readiness}%</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section aria-labelledby="check-title" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="check-title" className="text-2xl font-extrabold">{selected.opportunity.title}</h2>
              <p className="text-ink-soft">{selected.opportunity.organization} · Demo data</p>
            </div>
            <StatusBadge status={selected.status} size="lg" />
          </div>
          <p className="mt-3 font-medium">{selected.summary}</p>
          <div className="mt-4 max-w-md"><ReadinessBar value={selected.readiness} label={`Readiness: ${selected.metCount} of ${selected.total} met`} /></div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={copy}><Icon name="copy" />Copy checklist</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={download}><Icon name="download" />Download .txt</button>
          </div>

          {selected.status === STATUS.MISMATCH && (
            <p className="mt-5 rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-950">
              You do not currently match this opportunity, so these items are for reference. Red items are eligibility rules that documents cannot fix.
            </p>
          )}

          <h3 className="mt-8 text-lg font-bold">
            To do ({selected.openItems.length})
          </h3>
          {selected.openItems.length === 0 ? (
            <p className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 font-medium text-emerald-900">
              Everything is ready. You can apply with confidence.
            </p>
          ) : (
            <div className="mt-3">
              <RequirementList items={selected.openItems} onToggleDoc={onToggleDoc} onEditProfile={onEditProfile} />
            </div>
          )}

          {done.length > 0 && (
            <details className="mt-8 rounded-lg border border-ink/10 bg-white p-4">
              <summary className="cursor-pointer font-semibold">Already done ({done.length})</summary>
              <div className="mt-4">
                <RequirementList items={done} onToggleDoc={onToggleDoc} onEditProfile={onEditProfile} />
              </div>
            </details>
          )}
        </section>
      </div>
    </Wrap>
  );
}

function Wrap({ children }) {
  return (
    <section aria-labelledby="checklist-title" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 id="checklist-title" className="text-3xl font-extrabold sm:text-4xl">Readiness checklist</h1>
      <p className="mb-8 mt-2 max-w-2xl text-ink-soft">What is missing for each opportunity, in the order to tackle it.</p>
      {children}
    </section>
  );
}
