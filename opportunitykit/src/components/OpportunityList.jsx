import { useMemo } from 'react';
import Icon from './Icon.jsx';
import OpportunityCard from './OpportunityCard.jsx';
import { EmptyState, ErrorState, LoadingGrid } from './States.jsx';
import { CATEGORIES } from '../data/constants.js';

export const DEFAULT_FILTERS = { q: '', category: 'All', status: 'all', sort: 'best' };

const STATUS_OPTIONS = [
  ['all', 'All statuses'],
  ['match', 'Match'],
  ['missing', 'Missing information'],
  ['mismatch', 'Mismatch'],
];

export default function OpportunityList({
  opportunities, resultsById, loadState, loadError, onRetry,
  filters, setFilters, onOpen, onGoProfile, onTrySample,
}) {
  const hasProfile = Boolean(resultsById);

  const rows = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const list = opportunities
      .map((o) => ({ o, r: resultsById?.[o.id] ?? null }))
      .filter(({ o, r }) => {
        if (filters.category !== 'All' && o.category !== filters.category) return false;
        if (filters.status !== 'all' && r?.status !== filters.status) return false;
        if (!q) return true;
        return [o.title, o.organization, o.category, o.description, o.mode, ...o.tags].join(' ').toLowerCase().includes(q);
      });
    const sorters = {
      best: (a, b) => (b.r?.rank ?? 0) - (a.r?.rank ?? 0) || a.o.deadlineInDays - b.o.deadlineInDays,
      deadline: (a, b) => a.o.deadlineInDays - b.o.deadlineInDays,
      title: (a, b) => a.o.title.localeCompare(b.o.title),
    };
    return list.sort(sorters[filters.sort] ?? sorters.best);
  }, [opportunities, resultsById, filters]);

  const countFor = (cat) => opportunities.filter((o) => cat === 'All' || o.category === cat).length;
  const filtersActive = filters.q || filters.category !== 'All' || filters.status !== 'all';
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <section aria-labelledby="list-title" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 id="list-title" className="text-3xl font-extrabold sm:text-4xl">Opportunities</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Sample internships, scholarships, hackathons and programs. All are fictional demo data.
        {hasProfile ? ' Each card shows how your profile compares.' : ' Create a profile to see how you compare.'}
      </p>

      {loadState === 'loading' && (
        <div className="mt-8">
          <LoadingGrid />
        </div>
      )}

      {loadState === 'error' && (
        <div className="mt-8">
          <ErrorState title="Opportunities could not be loaded" message={loadError} onRetry={onRetry} />
        </div>
      )}

      {loadState === 'ready' && (
        <>
          {!hasProfile && (
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-brand/30 bg-brand-tint p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium">No profile yet. Statuses and reasons appear once you add one.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary btn-sm" onClick={onGoProfile}>Build my profile</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => onTrySample('aarav')}>Try a sample student</button>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4" role="search">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
              <div>
                <label htmlFor="q" className="label">Search</label>
                <div className="relative">
                  <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                  <input
                    id="q" type="search" className="field pl-9" placeholder="Title, organisation or keyword"
                    value={filters.q} onChange={(e) => set({ q: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="status" className="label">Eligibility status</label>
                <select
                  id="status" className="field md:w-56" value={filters.status}
                  disabled={!hasProfile} onChange={(e) => set({ status: e.target.value })}
                  aria-describedby={hasProfile ? undefined : 'status-hint'}
                >
                  {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                {!hasProfile && <p id="status-hint" className="mt-1 text-xs text-ink-soft">Available after you add a profile.</p>}
              </div>
              <div>
                <label htmlFor="sort" className="label">Sort by</label>
                <select id="sort" className="field md:w-48" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
                  <option value="best">{hasProfile ? 'Best fit' : 'Default'}</option>
                  <option value="deadline">Soonest demo deadline</option>
                  <option value="title">Title A to Z</option>
                </select>
              </div>
            </div>

            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
              {['All', ...CATEGORIES].map((cat) => {
                const on = filters.category === cat;
                return (
                  <button
                    key={cat} type="button" aria-pressed={on} onClick={() => set({ category: cat })}
                    className={`chip min-h-[40px] font-semibold transition-colors ${on ? 'border-ink bg-ink text-white' : 'hover:bg-brand-tint'}`}
                  >
                    {cat} <span className={on ? 'text-white/80' : 'text-ink-soft'}>{countFor(cat)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-6 text-sm font-medium text-ink-soft" aria-live="polite">
            Showing {rows.length} of {opportunities.length} opportunities
          </p>

          {rows.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No opportunities match these filters"
                actions={
                  filtersActive && (
                    <button type="button" className="btn btn-primary" onClick={() => setFilters(DEFAULT_FILTERS)}>
                      Clear all filters
                    </button>
                  )
                }
              >
                Try a different keyword, pick another category, or clear the filters to see everything.
              </EmptyState>
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map(({ o, r }) => (
                <li key={o.id}>
                  <OpportunityCard opportunity={o} result={r} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
