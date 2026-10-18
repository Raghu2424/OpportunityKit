# OpportunityKit

**Know what you qualify for, and exactly what is still missing.**
Prototype for SETU 2026 Round 2, problem statement PS-03.

> **Demo data notice.** Every opportunity, organisation, stipend and deadline in this project is fictional and was written for the prototype. Nothing here is a verified real-world listing. Deadlines are generated relative to today ("in 21 days") so they never look stale.

## The problem

Students find opportunities easily. What they cannot tell is whether they are *eligible*, why not, and which documents or skills they are missing. They learn about a missing recommendation letter days before the deadline, and rejections arrive with no reason.

## The solution

1. The student creates a profile: course, year, CGPA, skills, interests, achievements, and documents they already have.
2. OpportunityKit checks the profile against each opportunity's requirements and assigns a status: **Match**, **Mismatch** or **Missing information**.
3. Every result is explained rule by rule, and a **readiness checklist** lists what is missing in priority order with a concrete next step.

## Features

| # | Feature | Where |
|---|---------|-------|
| 1 | Responsive landing page (problem, solution, status legend, business model) | Home |
| 2 | Profile form with validation: course, year, CGPA, skills, interests, achievements, documents | Profile |
| 3 | 14 demo opportunities across internships, scholarships, hackathons and programs | Opportunities |
| 4 | Real client-side matching engine with three statuses | `src/lib/matching.js` |
| 5 | Plain-language reason for every requirement, on cards and in a detail dialog | Opportunities |
| 6 | Readiness checklist with next steps, one-click "I have this ready", copy and download | Checklist |
| 7 | Search, category filter, status filter, sorting | Opportunities |
| 8 | Dashboard: total, matches, missing information, mismatches, incomplete requirements, ready to apply, category breakdown | Dashboard |
| 9 | Three sample students so judges can test instantly | Profile, Home |
| 10 | Loading skeletons, empty states, error states with retry, corrupt-storage recovery, error boundary | Everywhere |

Also included: a "documents that unlock the most opportunities" ranking, skill aliases (`JS` is understood as JavaScript), keyboard-accessible dialog with focus trap, skip link, and reduced-motion support.

## How the matching works

Each opportunity is split into requirements. Each requirement is evaluated against the profile and returns **met**, **unmet** or **unknown** (the profile lacks the information to decide).

- **Hard** requirements are eligibility rules: course, year of study, minimum CGPA, required skills (at least N of a list), and sometimes achievements.
- **Soft** requirements help the application but do not decide eligibility: bonus skills, interests, and documents.

| Status | Rule |
|--------|------|
| Mismatch | At least one hard requirement is unmet |
| Missing information | No hard requirement is unmet, but at least one is unknown (for example, CGPA left blank) |
| Match | Every hard requirement is met |

A hard failure always wins over missing data, because the student should not be told to fill in more information for something they cannot qualify for. **Readiness** is the share of all requirements met, including documents. A Match can therefore still be 75% ready.

## Technology stack

- React 18, Vite 5, Tailwind CSS 3
- No backend, no paid APIs, no accounts. The profile lives in `localStorage`.
- Tests use Node's built-in test runner (`node --test`), so there are no extra test dependencies.

## Project structure

```
src/
  data/        constants, 14 demo opportunities, sample profiles
  lib/         matching.js (engine), api.js (data layer), format.js, matching.test.js
  hooks/       useLocalStorage.js
  components/  Landing, ProfileForm, OpportunityList/Card/Detail, Checklist, Dashboard,
               RequirementList, TagInput, StatusBadge, States, Toast, Navbar, Footer, ErrorBoundary
  App.jsx      state, navigation, wiring
```

To add an opportunity, append an object to `src/data/opportunities.js`. The engine and every screen pick it up automatically.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # opens http://localhost:5173
npm test           # matching-engine tests
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

## Deploy

You have to perform these steps yourself. Nothing has been deployed or pushed for you.

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "OpportunityKit prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/opportunitykit.git
git push -u origin main
```

Create the empty repository on GitHub first (no README, no .gitignore).

### 2a. Vercel

Dashboard: **Add New, Project**, import the GitHub repository, and accept the detected Vite settings (build `npm run build`, output `dist`). Click **Deploy**.

CLI:

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2b. Netlify

Dashboard: **Add new site, Import an existing project**, pick the repository. `netlify.toml` already sets build `npm run build` and publish `dist`.

CLI:

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

Netlify drag-and-drop also works: run `npm run build`, then drop the `dist` folder on the Netlify Drop page.

The app is a single page with no router, so no rewrite rules are needed.

## How to test the core journey (about 3 minutes)

1. **Home.** Click *Try a sample student*. You land on Opportunities with Aarav's results.
2. **Statuses.** Cards show Match and Mismatch. Open *Frontend Developer Intern* and read the rule-by-rule explanation.
3. **Live update.** In the dialog, press *I have this ready* on the portfolio document. Readiness rises immediately.
4. **Filters.** Choose the *Hackathon* chip, then set status to *Mismatch*. You get the empty state. Press *Clear all filters*. Type `cloud` in search.
5. **Missing information.** Go to Profile, load *Sneha* (incomplete profile), save. Filter by *Missing information* to see 8 results and what each is waiting for.
6. **Checklist.** Open Checklist. Use the top panel to mark the document that unlocks the most opportunities, then copy or download one checklist.
7. **Dashboard.** Check the counts. Click the *Mismatches* tile to jump to the filtered list.
8. **Persistence.** Reload the page. The profile is still there. Delete it from the Profile page to see the empty states.
9. **Error state.** Open the app with `?demo=error` at the end of the URL and go to Opportunities. The error state shows once, and *Try again* recovers.

Expected numbers for the three samples:

| Sample | Match | Missing information | Mismatch |
|--------|------:|--------------------:|---------:|
| Aarav (CS, year 3) | 8 | 0 | 6 |
| Meera (Design, year 2) | 4 | 0 | 10 |
| Sneha (Science, year 3, incomplete) | 0 | 8 | 6 |

## Demo script for judges (3 minutes)

**0:00, the problem (20 s).** "Students can find opportunities. What they can't tell is whether they qualify, why not, and what to prepare. They find out too late, or never."

**0:20, the profile (30 s).** Click *Try a sample student*. "A two-minute profile: course, year, skills, interests, achievements, and the documents they have. Stored only in the browser."

**0:50, the engine (60 s).** On Opportunities, point at the three statuses. Open one Match and one Mismatch. "This is real logic, not a mockup. Every rule is checked, and the reason is stated: this course isn't accepted, you have 1 of the 3 skills needed." Press *I have this ready* and show readiness rise.

**1:50, missing information (30 s).** Load Sneha. "Where a profile is incomplete we don't guess. We say Missing information and tell the student exactly what to add."

**2:20, checklist and dashboard (25 s).** "The checklist ranks documents by how many opportunities they unlock. The dashboard shows total, matches and incomplete requirements."

**2:45, business model (15 s).** "Free for students. Colleges pay for a cohort-readiness dashboard. Organisations pay per qualified applicant for verified listings with clear requirements."

## Monetization potential

| Customer | Model | Value |
|----------|-------|-------|
| Students | Free core, optional paid reminders and application tracking | Fewer wasted applications |
| Colleges and placement cells | Subscription | See which documents and skills block the most students |
| Organisations | Pay per qualified applicant, verified listings | Higher-quality applicant pool |

These are planned models. The prototype has no accounts or payments.

## Limitations and next steps

- Opportunity data is bundled demo data. A real product needs verified listings, ideally entered by organisations through a structured requirements form.
- The profile is self-reported. Document checkboxes are not verified.
- Course matching uses broad fields of study, not individual degree names.
- Next: backend with accounts, organisation portal, deadline reminders, cohort analytics for colleges, and more granular eligibility rules (location, category, income bands).

## Accessibility

Semantic landmarks and headings, a skip link, labelled form controls with an error summary that receives focus, status shown as icon plus text (never colour alone), a focus-trapped dialog that closes on Escape and returns focus, live regions for result counts and toasts, 44px touch targets, and reduced-motion support.

## Privacy

No data leaves the browser. The only network request is for the Google Fonts stylesheet; remove the two `<link>` font tags in `index.html` to run fully offline (the app falls back to system fonts).
