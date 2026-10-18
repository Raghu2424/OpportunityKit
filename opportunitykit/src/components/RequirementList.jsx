import Icon from './Icon.jsx';
import { REQ } from '../lib/matching.js';

function rowStyle(req) {
  if (req.status === REQ.MET) return { icon: 'check', word: 'Met', tone: 'text-emerald-800 bg-emerald-50 border-emerald-300' };
  if (req.status === REQ.UNKNOWN) return { icon: 'alert', word: 'Info needed', tone: 'text-amber-950 bg-amber-50 border-amber-400' };
  if (req.hard) return { icon: 'x', word: 'Not met', tone: 'text-rose-900 bg-rose-50 border-rose-300' };
  return { icon: 'alert', word: 'To do', tone: 'text-amber-950 bg-amber-50 border-amber-400' };
}

// Renders requirements with a plain-language explanation and, where possible, a one-click fix.
// `neutral` lists the rules without evaluating them (used before a profile exists).
export default function RequirementList({ items, onToggleDoc, onEditProfile, neutral = false }) {
  return (
    <ul className="space-y-3">
      {items.map((req) => {
        const s = rowStyle(req);
        return (
          <li key={req.id} className="rounded-lg border border-ink/10 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-semibold">{req.label}</p>
              {!neutral && (
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.tone}`}>
                  <Icon name={s.icon} className="h-3.5 w-3.5" />
                  {s.word}
                </span>
              )}
              {neutral && (
                <span className="rounded-full border border-ink/15 px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
                  {req.hard ? 'Eligibility rule' : req.type === 'document' ? 'Document' : 'Helps your application'}
                </span>
              )}
            </div>
            {!neutral && (
              <>
                <p className="mt-1.5 text-sm text-ink-soft">{req.detail}</p>
                {req.nextStep && (
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">Next step: </span>
                    {req.nextStep}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {req.type === 'document' && req.status !== REQ.MET && onToggleDoc && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => onToggleDoc(req.docId)}>
                      <Icon name="check" />
                      I have this ready
                    </button>
                  )}
                  {req.type === 'document' && req.status === REQ.MET && onToggleDoc && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onToggleDoc(req.docId)}>
                      Mark as not ready
                    </button>
                  )}
                  {req.fixInProfile && onEditProfile && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={onEditProfile}>
                      <Icon name="user" />
                      Update my profile
                    </button>
                  )}
                </div>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
