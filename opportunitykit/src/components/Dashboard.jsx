import { useMemo } from 'react';
import Icon from './Icon.jsx';
import StatusBadge, { ReadinessBar } from './StatusBadge.jsx';
import { EmptyState, LoadingGrid } from './States.jsx';
import { CATEGORIES } from '../data/constants.js';
import { STATUS, aggregateDocumentActions, profileCompleteness, summarize } from '../lib/matching.js';

function Tile({ label, value, note, onClick, tone = 'bg-white' }) {
  return (
    <button type="button" onClick={onClick} className={`panel group w-full p-4 text-left transition-shadow hover:shadow-md ${tone}`}>
      <span className="block text-sm font-semibold text-ink-soft">{label}</span>
      <span className="mt-1 block font-display text-4xl font-extrabold">{value}</span>
      <span className="mt-1 flex items-center gap-1 text-xs text-ink-soft group-hover:text-brand">
        {note}
        <Icon name="arrow" className="h-3 w-3" />
      </span>
    </button>
  );
}

export default function Dashboard({ results, profile, loadState, onNavigate, onOpen, onTrySample, onGoProfile }) {
  const summary = useMemo(() => summarize(results, CATEGORIES), [results]);
  const actions = useMemo(() => aggregateDocumentActions(results), [results]);
  const top = useMemo(
    () => results.filter((r) => r.status !== STATUS.MISMATCH).sort((a, b) => b.rank - a.rank).slice(0, 3),
    [results],
  );

  return (
    <section aria-labelledby="dash-title" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 id="dash-title" className="text-3xl font-extrabold sm:text-4xl">Dashboard</h1>
      <p className="mb-8 mt-2 max-w-2xl text-ink-soft">Where you stand across all demo opportunities.</p>

      {loadState === 'loading' && <LoadingGrid count={6} label="Loading dashboard" />}

      {loadState === 'ready' && !profile && (
        <EmptyState
          title="No profile to analyse yet"
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={onGoProfile}>Build my profile</button>
              <button type="button" className="btn btn-secondary" onClick={() => onTrySample('aarav')}>Try a sample student</button>
            </>
          }
        >
          Add a profile and this page shows how many opportunities you match, what is blocking the rest, and what to do next.
        </EmptyState>
      )}

      {loadState === 'ready' && profile && (() => {
        const completeness = profileCompleteness(profile);
        return (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg">
                {profile.name ? <strong>{profile.name}</strong> : 'Your profile'}
                <span className="text-ink-soft"> · {profile.course}, year {profile.year}</span>
              </p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => onNavigate('profile')}>Edit profile</button>
            </div>

            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <li><Tile label="Total opportunities" value={summary.total} note="Browse all" onClick={() => onNavigate('opportunities', { filters: {} })} /></li>
              <li><Tile label="Matches" value={summary.match} note="View matches" tone="bg-emerald-50" onClick={() => onNavigate('opportunities', { filters: { status: 'match' } })} /></li>
              <li><Tile label="Missing information" value={summary.missing} note="View these" tone="bg-amber-50" onClick={() => onNavigate('opportunities', { filters: { status: 'missing' } })} /></li>
              <li><Tile label="Mismatches" value={summary.mismatch} note="See why" tone="bg-rose-50" onClick={() => onNavigate('opportunities', { filters: { status: 'mismatch' } })} /></li>
              <li><Tile label="Incomplete requirements" value={summary.incomplete} note="Open checklist" onClick={() => onNavigate('checklist')} /></li>
              <li><Tile label="Ready to apply" value={summary.readyToApply} note="Matches with nothing left" onClick={() => onNavigate('checklist')} /></li>
            </ul>
            <p className="-mt-4 text-xs text-ink-soft">
              Incomplete requirements counts open items for opportunities you match or could match. Mismatches are excluded.
            </p>

            <div className="grid gap-8 lg:grid-cols-2">
              <section aria-labelledby="cat-title" className="panel p-5">
                <h2 id="cat-title" className="text-lg font-bold">By category</h2>
                <ul className="mt-4 space-y-4">
                  {summary.byCategory.map((c) => (
                    <li key={c.category}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-semibold">{c.category}</span>
                        <span className="text-ink-soft">{c.match} match · {c.missing} missing info · {c.mismatch} mismatch</span>
                      </div>
                      <div
                        className="flex h-3 overflow-hidden rounded-full bg-ink/10" role="img"
                        aria-label={`${c.category}: ${c.match} match, ${c.missing} missing information, ${c.mismatch} mismatch`}
                      >
                        <span className="bg-emerald-600" style={{ width: `${(c.match / c.total) * 100}%` }} />
                        <span className="bg-amber-400" style={{ width: `${(c.missing / c.total) * 100}%` }} />
                        <span className="bg-rose-400" style={{ width: `${(c.mismatch / c.total) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="next-title" className="panel p-5">
                <h2 id="next-title" className="text-lg font-bold">Best next steps</h2>
                {actions.length === 0 ? (
                  <p className="mt-3 text-ink-soft">No documents are blocking you. Nice work.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {actions.slice(0, 4).map((a) => (
                      <li key={a.docId} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{a.label}</p>
                          <p className="text-sm text-ink-soft">Needed for {a.count} opportunit{a.count > 1 ? 'ies' : 'y'}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button type="button" className="btn btn-primary btn-sm mt-5" onClick={() => onNavigate('checklist')}>
                  Open checklist
                  <Icon name="arrow" />
                </button>
              </section>
            </div>

            <section aria-labelledby="top-title">
              <h2 id="top-title" className="text-lg font-bold">Closest to ready</h2>
              {top.length === 0 ? (
                <p className="mt-3 text-ink-soft">Nothing matches yet. Add more to your profile or review the mismatch reasons.</p>
              ) : (
                <ul className="mt-4 grid gap-4 md:grid-cols-3">
                  {top.map((r) => (
                    <li key={r.opportunity.id} className="panel flex flex-col p-4">
                      <p className="font-bold leading-snug">{r.opportunity.title}</p>
                      <p className="text-sm text-ink-soft">{r.opportunity.organization}</p>
                      <div className="mt-3"><StatusBadge status={r.status} /></div>
                      <div className="mt-3 flex-1"><ReadinessBar value={r.readiness} /></div>
                      <button type="button" className="btn btn-secondary btn-sm mt-4" onClick={() => onOpen(r.opportunity.id)}>See why</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="comp-title" className="panel p-5">
              <h2 id="comp-title" className="text-lg font-bold">Profile completeness</h2>
              <div className="mt-3 max-w-md"><ReadinessBar value={completeness.percent} label="Completeness" /></div>
              <p className="mt-3 text-sm text-ink-soft">
                {completeness.missing.length === 0
                  ? 'Your profile is complete, so results are as accurate as they can be.'
                  : `Adding ${completeness.missing.join(', ')} gives more accurate results and fewer Missing information statuses.`}
              </p>
            </section>
          </div>
        );
      })()}
    </section>
  );
}
