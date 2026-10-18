import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import TagInput from './TagInput.jsx';
import { ReadinessBar } from './StatusBadge.jsx';
import { COURSES, YEARS, DOCUMENTS, SKILL_SUGGESTIONS, INTEREST_SUGGESTIONS } from '../data/constants.js';
import { EMPTY_PROFILE, SAMPLE_PROFILES } from '../data/sampleProfiles.js';
import { profileCompleteness } from '../lib/matching.js';

function validate(d) {
  const errors = {};
  if (!d.course) errors.course = 'Choose your course or field of study.';
  if (!d.year) errors.year = 'Choose your year of study.';
  if (d.cgpa !== '' && d.cgpa !== null) {
    const n = Number(d.cgpa);
    if (!Number.isFinite(n) || n < 0 || n > 10) errors.cgpa = 'Enter a CGPA between 0 and 10, or leave it blank.';
  }
  if (d.name.length > 60) errors.name = 'Keep your name under 60 characters.';
  return errors;
}

function clean(d) {
  return {
    name: d.name.trim(),
    course: d.course,
    year: Number(d.year),
    cgpa: d.cgpa === '' || d.cgpa === null ? '' : Math.round(Number(d.cgpa) * 100) / 100,
    skills: d.skills,
    interests: d.interests,
    achievements: d.achievements,
    documents: d.documents,
  };
}

const ERROR_ORDER = ['name', 'course', 'year', 'cgpa'];

export default function ProfileForm({ profile, onSave, onDelete }) {
  const [draft, setDraft] = useState(() => (profile ? { ...EMPTY_PROFILE, ...profile } : EMPTY_PROFILE));
  const [errors, setErrors] = useState({});
  const [sampleNote, setSampleNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const summaryRef = useRef(null);
  const [submitCount, setSubmitCount] = useState(0);

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const completeness = profileCompleteness(clean(draft));

  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) summaryRef.current?.focus();
  }, [submitCount, errors]);

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(draft);
    setErrors(errs);
    setSubmitCount((n) => n + 1);
    if (Object.keys(errs).length === 0) onSave(clean(draft));
  };

  const loadSample = (s) => {
    setDraft({ ...EMPTY_PROFILE, ...s.profile });
    setErrors({});
    setSampleNote(`Loaded ${s.profile.name}. Review it, then save.`);
  };

  const reset = () => {
    setDraft(EMPTY_PROFILE);
    setErrors({});
    setSampleNote('');
  };

  const toggleDoc = (id) =>
    set('documents', draft.documents.includes(id) ? draft.documents.filter((d) => d !== id) : [...draft.documents, id]);

  const errorKeys = ERROR_ORDER.filter((k) => errors[k]);

  return (
    <section aria-labelledby="profile-title" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 id="profile-title" className="text-3xl font-extrabold sm:text-4xl">
        {profile ? 'Your profile' : 'Build your profile'}
      </h1>
      <p className="mt-2 text-ink-soft">
        Fill in what you know. Course and year are required. Anything you leave blank shows up as Missing information instead of a wrong answer. Your profile is saved only in this browser.
      </p>

      <div className="panel mt-6 p-4">
        <p className="text-sm font-semibold">Want to test quickly? Load a sample student.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {SAMPLE_PROFILES.map((s) => (
            <button key={s.key} type="button" onClick={() => loadSample(s)} className="rounded-lg border border-ink/15 p-3 text-left hover:border-brand hover:bg-brand-tint">
              <span className="block font-semibold">{s.profile.name.replace(' (sample)', '')}</span>
              <span className="mt-0.5 block text-xs text-ink-soft">{s.blurb}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 min-h-[1.25rem] text-sm font-medium text-brand-dark" role="status">{sampleNote}</p>
      </div>

      <form onSubmit={submit} noValidate className="mt-8 space-y-8">
        {errorKeys.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-rose-950">
            <p className="font-bold">Fix {errorKeys.length} thing{errorKeys.length > 1 ? 's' : ''} to save your profile:</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {errorKeys.map((k) => (
                <li key={k}><a className="underline" href={`#field-${k}`}>{errors[k]}</a></li>
              ))}
            </ul>
          </div>
        )}

        <fieldset className="space-y-5">
          <legend className="mb-3 text-xl font-bold">About you</legend>
          <div>
            <label htmlFor="field-name" className="label">Name <span className="font-normal text-ink-soft">(optional)</span></label>
            <input
              id="field-name" className={`field ${errors.name ? 'field-error' : ''}`} value={draft.name} autoComplete="given-name"
              onChange={(e) => set('name', e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'err-name' : undefined}
            />
            {errors.name && <p id="err-name" className="mt-1 text-sm font-medium text-rose-800">{errors.name}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="field-course" className="label">Course or field of study</label>
              <select
                id="field-course" required className={`field ${errors.course ? 'field-error' : ''}`} value={draft.course}
                onChange={(e) => set('course', e.target.value)} aria-invalid={Boolean(errors.course)} aria-describedby={errors.course ? 'err-course' : undefined}
              >
                <option value="">Select your course</option>
                {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.course && <p id="err-course" className="mt-1 text-sm font-medium text-rose-800">{errors.course}</p>}
            </div>

            <div>
              <label htmlFor="field-year" className="label">Year of study</label>
              <select
                id="field-year" required className={`field ${errors.year ? 'field-error' : ''}`} value={draft.year}
                onChange={(e) => set('year', e.target.value)} aria-invalid={Boolean(errors.year)} aria-describedby={errors.year ? 'err-year' : undefined}
              >
                <option value="">Select year</option>
                {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
              {errors.year && <p id="err-year" className="mt-1 text-sm font-medium text-rose-800">{errors.year}</p>}
            </div>

            <div>
              <label htmlFor="field-cgpa" className="label">CGPA on a 10-point scale <span className="font-normal text-ink-soft">(optional)</span></label>
              <input
                id="field-cgpa" type="number" inputMode="decimal" step="0.01" min="0" max="10" placeholder="For example 7.8"
                className={`field ${errors.cgpa ? 'field-error' : ''}`} value={draft.cgpa}
                onChange={(e) => set('cgpa', e.target.value)} aria-invalid={Boolean(errors.cgpa)} aria-describedby={errors.cgpa ? 'err-cgpa' : undefined}
              />
              {errors.cgpa && <p id="err-cgpa" className="mt-1 text-sm font-medium text-rose-800">{errors.cgpa}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="mb-3 text-xl font-bold">Skills, interests and achievements</legend>
          <TagInput
            label="Skills" hint="Type a skill and press Enter, or tap a suggestion. Short forms like JS or ML are understood."
            values={draft.skills} onChange={(v) => set('skills', v)} suggestions={SKILL_SUGGESTIONS} placeholder="For example Python" maxLength={40}
          />
          <TagInput
            label="Interests" hint="What kinds of work do you want more of?"
            values={draft.interests} onChange={(v) => set('interests', v)} suggestions={INTEREST_SUGGESTIONS} placeholder="For example Sustainability" maxLength={40}
          />
          <TagInput
            label="Achievements" hint="Projects, awards, leadership roles or certificates. One per entry."
            values={draft.achievements} onChange={(v) => set('achievements', v)} variant="list" splitOnComma={false}
            placeholder="For example Won second place at a college hackathon" max={10} maxLength={120} addLabel="Add"
          />
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-xl font-bold">Documents you have ready</legend>
          <p className="mb-3 text-sm text-ink-soft">Tick only what you could upload today. The rest goes onto your checklist.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(DOCUMENTS).map(([id, doc]) => (
              <label key={id} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-ink/15 bg-white px-3 py-2 hover:border-brand">
                <input type="checkbox" className="h-5 w-5 accent-brand" checked={draft.documents.includes(id)} onChange={() => toggleDoc(id)} />
                <span className="text-sm font-medium">{doc.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="sticky bottom-0 -mx-4 border-t border-ink/10 bg-paper/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
            <ReadinessBar value={completeness.percent} label="Profile completeness" />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn btn-primary">
                <Icon name="check" />
                Save and see my matches
              </button>
              <button type="button" className="btn btn-secondary" onClick={reset}>Clear form</button>
            </div>
          </div>
          {completeness.missing.length > 0 && (
            <p className="mt-2 text-xs text-ink-soft">Still blank: {completeness.missing.join(', ')}.</p>
          )}
        </div>
      </form>

      {profile && (
        <div className="mt-10 border-t border-ink/10 pt-6">
          <h2 className="text-lg font-bold">Delete saved profile</h2>
          <p className="mt-1 text-sm text-ink-soft">Removes your profile from this browser. You can create a new one any time.</p>
          {confirmDelete ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-rose-900">Delete your profile permanently?</p>
              <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}><Icon name="trash" />Yes, delete it</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(false)}>Keep it</button>
            </div>
          ) : (
            <button type="button" className="btn btn-danger btn-sm mt-3" onClick={() => setConfirmDelete(true)}><Icon name="trash" />Delete profile</button>
          )}
        </div>
      )}
    </section>
  );
}
