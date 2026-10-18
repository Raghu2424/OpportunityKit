import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './components/Landing.jsx';
import ProfileForm from './components/ProfileForm.jsx';
import OpportunityList, { DEFAULT_FILTERS } from './components/OpportunityList.jsx';
import OpportunityDetail from './components/OpportunityDetail.jsx';
import Checklist from './components/Checklist.jsx';
import Dashboard from './components/Dashboard.jsx';
import Toast from './components/Toast.jsx';
import { Notice } from './components/States.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { loadOpportunities } from './lib/api.js';
import { evaluateAll, isValidProfile } from './lib/matching.js';
import { DOCUMENTS } from './data/constants.js';
import { SAMPLE_PROFILES } from './data/sampleProfiles.js';

const STORAGE_KEY = 'opportunitykit.profile.v1';
const TITLES = {
  home: 'OpportunityKit — know what you qualify for',
  profile: 'Profile — OpportunityKit',
  opportunities: 'Opportunities — OpportunityKit',
  checklist: 'Readiness checklist — OpportunityKit',
  dashboard: 'Dashboard — OpportunityKit',
};

export default function App() {
  const [view, setView] = useState('home');
  const [profile, setProfile, storageError, dismissStorageError] = useLocalStorage(STORAGE_KEY, isValidProfile);
  const [opportunities, setOpportunities] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [openId, setOpenId] = useState(null);
  const [checklistId, setChecklistId] = useState(null);
  const [toast, setToast] = useState(null);
  const mainRef = useRef(null);
  const started = useRef(false);
  const firstView = useRef(true);

  const load = useCallback(() => {
    setLoadState('loading');
    loadOpportunities()
      .then((data) => {
        setOpportunities(data);
        setLoadState('ready');
      })
      .catch((err) => {
        setLoadError(err.message || 'Unknown error.');
        setLoadState('error');
      });
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    load();
  }, [load]);

  // Move focus and the document title with the view so keyboard and screen-reader users know the page changed.
  useEffect(() => {
    document.title = TITLES[view];
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [view]);

  const resultsById = useMemo(() => {
    if (!profile || loadState !== 'ready') return null;
    const map = {};
    for (const r of evaluateAll(profile, opportunities)) map[r.opportunity.id] = r;
    return map;
  }, [profile, opportunities, loadState]);
  const results = useMemo(() => (resultsById ? Object.values(resultsById) : []), [resultsById]);

  const notify = useCallback((message, tone = 'info') => setToast({ id: Date.now(), message, tone }), []);
  const clearToast = useCallback(() => setToast(null), []);

  const navigate = useCallback((next, opts = {}) => {
    if (opts.filters) setFilters({ ...DEFAULT_FILTERS, ...opts.filters });
    if (opts.checklistId) setChecklistId(opts.checklistId);
    setOpenId(null);
    setView(next);
  }, []);

  const saveProfile = (p) => {
    setProfile(p);
    setFilters(DEFAULT_FILTERS);
    notify('Profile saved. Your matches are ready.');
    navigate('opportunities');
  };

  const deleteProfile = () => {
    setProfile(null);
    notify('Profile deleted from this browser.');
  };

  const trySample = (key) => {
    const sample = SAMPLE_PROFILES.find((s) => s.key === key);
    if (!sample) return;
    setProfile({ ...sample.profile });
    setFilters(DEFAULT_FILTERS);
    notify(`Loaded ${sample.profile.name}. Matches are ready.`);
    navigate('opportunities');
  };

  const toggleDoc = (docId) => {
    if (!profile) return;
    const has = profile.documents.includes(docId);
    setProfile((p) => ({
      ...p,
      documents: has ? p.documents.filter((d) => d !== docId) : [...p.documents, docId],
    }));
    notify(has ? `Marked "${DOCUMENTS[docId].label}" as not ready.` : `Marked "${DOCUMENTS[docId].label}" as ready.`);
  };

  const closeDetail = useCallback(() => setOpenId(null), []);
  const openOpp = opportunities.find((o) => o.id === openId) ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-white">
        Skip to main content
      </a>
      <div className="bg-ink px-4 py-1.5 text-center text-xs font-medium text-white">
        Demo prototype. Every opportunity shown is fictional sample data, not a real listing.
      </div>
      <Navbar view={view} onNavigate={navigate} profile={profile} />

      {storageError && (
        <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6">
          <Notice onDismiss={dismissStorageError}>{storageError}</Notice>
        </div>
      )}

      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        {view === 'home' && <Landing onNavigate={navigate} onTrySample={trySample} />}

        {view === 'profile' && (
          <ProfileForm key={profile ? 'saved' : 'new'} profile={profile} onSave={saveProfile} onDelete={deleteProfile} />
        )}

        {view === 'opportunities' && (
          <OpportunityList
            opportunities={opportunities} resultsById={resultsById} loadState={loadState} loadError={loadError} onRetry={load}
            filters={filters} setFilters={setFilters} onOpen={setOpenId}
            onGoProfile={() => navigate('profile')} onTrySample={trySample}
          />
        )}

        {view === 'checklist' && (
          <Checklist
            results={results} loadState={loadState} hasProfile={Boolean(profile)}
            selectedId={checklistId} setSelectedId={setChecklistId}
            onToggleDoc={toggleDoc} onEditProfile={() => navigate('profile')}
            onGoProfile={() => navigate('profile')} onTrySample={trySample} notify={notify}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard
            results={results} profile={profile} loadState={loadState}
            onNavigate={navigate} onOpen={setOpenId} onTrySample={trySample} onGoProfile={() => navigate('profile')}
          />
        )}
      </main>

      <Footer />

      {openOpp && (
        <OpportunityDetail
          opportunity={openOpp}
          result={resultsById?.[openOpp.id] ?? null}
          onClose={closeDetail}
          onToggleDoc={toggleDoc}
          onEditProfile={() => navigate('profile')}
          onGoProfile={() => navigate('profile')}
          onOpenChecklist={(id) => navigate('checklist', { checklistId: id })}
        />
      )}

      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
