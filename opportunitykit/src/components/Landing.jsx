import Icon from './Icon.jsx';
import StatusBadge from './StatusBadge.jsx';
import { evaluateOpportunity } from '../lib/matching.js';
import { OPPORTUNITIES } from '../data/opportunities.js';
import { SAMPLE_PROFILES } from '../data/sampleProfiles.js';

// The hero card is a real engine result, not a mockup: a sample student against a demo opportunity.
const heroProfile = SAMPLE_PROFILES[0].profile;
const heroResult = evaluateOpportunity(heroProfile, OPPORTUNITIES.find((o) => o.id === 'op-01'));

const PROBLEMS = [
  ['Requirements are buried', 'Eligibility rules sit in long pages and PDFs. Students skim, guess, and apply to things they cannot get.'],
  ['Documents surface late', 'A missing recommendation letter or income certificate is found days before the deadline, when it is too late to get one.'],
  ['Rejections come with no reason', 'Students never learn which rule they missed, so they repeat the same mistake on the next application.'],
];

const STEPS = [
  ['Create your profile', 'Add your course, year, skills, interests, achievements and the documents you already have. It takes about two minutes.'],
  ['See a status for every opportunity', 'Each one is marked Match, Mismatch or Missing information, with the exact rule behind the result.'],
  ['Work through your checklist', 'Get the missing requirements in priority order, each with a concrete next step. Tick off documents as you finish them.'],
];

const MODEL = [
  ['Students', 'Free', 'Profile, matching and checklists stay free. Optional paid plan for deadline reminders and application tracking.'],
  ['Colleges and placement cells', 'Subscription', 'A cohort dashboard showing how many students are ready for each opportunity and which documents block them most.'],
  ['Organisations', 'Per qualified applicant', 'Verified listings with clear requirements, so they receive applications from students who already meet the criteria.'],
];

export default function Landing({ onNavigate, onTrySample }) {
  return (
    <>
      <section aria-labelledby="hero-title" className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-20">
        <div>
          <h1 id="hero-title" className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            See what you qualify for, and exactly what is still missing.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            Build a profile once. OpportunityKit checks it against the requirements of each internship, scholarship, hackathon and program, explains every result, and gives you a checklist to act on.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary px-6 text-base" onClick={() => onNavigate('profile')}>
              Build my profile
              <Icon name="arrow" />
            </button>
            <button type="button" className="btn btn-secondary px-6 text-base" onClick={() => onTrySample('aarav')}>
              Try a sample student
            </button>
          </div>
          <p className="mt-4 text-sm text-ink-soft">No account, no payment. All opportunities are fictional demo data.</p>
        </div>

        <figure aria-labelledby="hero-cap" className="panel relative overflow-hidden p-5 shadow-lg sm:p-6">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-mark" aria-hidden="true" />
          <figcaption id="hero-cap" className="text-xs font-medium text-ink-soft">
            Live result from the matching engine: {heroProfile.name} vs a demo opportunity
          </figcaption>
          <p className="mt-3 text-xl font-bold">{heroResult.opportunity.title}</p>
          <p className="text-sm text-ink-soft">{heroResult.opportunity.organization} · Demo data</p>
          <div className="mt-3"><StatusBadge status={heroResult.status} size="lg" /></div>
          <ul className="mt-4 space-y-2 text-sm">
            {[...heroResult.requirements.filter((r) => r.status === 'met').slice(0, 4), ...heroResult.openItems.slice(0, 3)].map((r) => (
              <li key={r.id} className="flex items-start gap-2">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${r.status === 'met' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-950'}`}>
                  <Icon name={r.status === 'met' ? 'check' : 'alert'} className="h-3 w-3" />
                </span>
                <span>
                  <span className="font-medium">{r.label}</span>
                  {r.status !== 'met' && r.nextStep && <span className="block text-ink-soft">Next: {r.nextStep}</span>}
                </span>
              </li>
            ))}
          </ul>
        </figure>
      </section>

      <section aria-labelledby="problem-title" className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="problem-title" className="max-w-2xl text-3xl font-extrabold sm:text-4xl">
            Finding opportunities is easy. Knowing whether you qualify is the hard part.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {PROBLEMS.map(([title, body]) => (
              <div key={title} className="border-l-4 border-mark pl-4">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="how-title" className="text-3xl font-extrabold sm:text-4xl">How OpportunityKit works</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="panel p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-lg font-bold text-white" aria-hidden="true">{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold"><span className="sr-only">Step {i + 1}: </span>{title}</h3>
              <p className="mt-2 text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ['match', 'You meet every eligibility rule. Your checklist shows any documents still to prepare.'],
            ['missing', 'Nothing rules you out yet, but your profile lacks the information to confirm. Add it and the status updates.'],
            ['mismatch', 'At least one eligibility rule is not met. You see which one, so you can aim at a better fit.'],
          ].map(([status, text]) => (
            <div key={status} className="rounded-xl border border-ink/10 bg-white p-5">
              <StatusBadge status={status} size="lg" />
              <p className="mt-3 text-sm text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="model-title" className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="model-title" className="max-w-2xl text-3xl font-extrabold sm:text-4xl">Free for students. Valuable to the people who serve them.</h2>
          <p className="mt-3 max-w-2xl text-white/75">Planned business model. This prototype has no accounts or payments.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {MODEL.map(([who, price, body]) => (
              <div key={who} className="rounded-xl border border-white/20 p-6">
                <p className="text-sm font-semibold text-mark">{price}</p>
                <h3 className="mt-1 text-xl font-bold">{who}</h3>
                <p className="mt-2 text-white/80">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="cta-title" className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 id="cta-title" className="text-3xl font-extrabold sm:text-4xl">Check your own profile in two minutes</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          Prefer to explore first? Browse all fourteen demo opportunities, or load Sneha, an incomplete sample profile, to see Missing information in action.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-primary px-6 text-base" onClick={() => onNavigate('profile')}>Build my profile</button>
          <button type="button" className="btn btn-secondary px-6 text-base" onClick={() => onNavigate('opportunities')}>Browse opportunities</button>
          <button type="button" className="btn btn-secondary px-6 text-base" onClick={() => onTrySample('sneha')}>Load Sneha</button>
        </div>
      </section>
    </>
  );
}
