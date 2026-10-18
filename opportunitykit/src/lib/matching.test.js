import test from 'node:test';
import assert from 'node:assert/strict';
import { OPPORTUNITIES } from '../data/opportunities.js';
import { SAMPLE_PROFILES, EMPTY_PROFILE } from '../data/sampleProfiles.js';
import { CATEGORIES } from '../data/constants.js';
import {
  STATUS, REQ, normalizeSkill, evaluateOpportunity, evaluateAll,
  aggregateDocumentActions, summarize, profileCompleteness, isValidProfile, checklistToText,
} from './matching.js';

const aarav = SAMPLE_PROFILES.find((p) => p.key === 'aarav').profile;
const sneha = SAMPLE_PROFILES.find((p) => p.key === 'sneha').profile;
const meera = SAMPLE_PROFILES.find((p) => p.key === 'meera').profile;
const opp = (id) => OPPORTUNITIES.find((o) => o.id === id);

test('demo data: every opportunity has a unique id, a known category and valid documents', () => {
  const ids = new Set(OPPORTUNITIES.map((o) => o.id));
  assert.equal(ids.size, OPPORTUNITIES.length);
  for (const o of OPPORTUNITIES) {
    assert.ok(CATEGORIES.includes(o.category), `${o.id} category`);
    assert.ok(o.requirements, `${o.id} requirements`);
  }
});

test('skill aliases are normalised', () => {
  assert.equal(normalizeSkill('  JS '), 'javascript');
  assert.equal(normalizeSkill('React.js'), 'react');
  assert.equal(normalizeSkill('Data Viz'), 'data visualization');
});

test('Match: eligible student gets Match and open document items', () => {
  const res = evaluateOpportunity(aarav, opp('op-01'));
  assert.equal(res.status, STATUS.MATCH);
  const portfolio = res.requirements.find((q) => q.docId === 'portfolio');
  assert.equal(portfolio.status, REQ.UNMET);
  assert.ok(res.readiness < 100 && res.readiness > 0);
  assert.ok(res.openItems.some((i) => i.docId === 'portfolio'));
});

test('Mismatch: wrong course is a hard failure with an explanation', () => {
  const res = evaluateOpportunity(aarav, opp('op-13'));
  assert.equal(res.status, STATUS.MISMATCH);
  const course = res.requirements.find((q) => q.id === 'course');
  assert.equal(course.status, REQ.UNMET);
  assert.match(course.detail, /not on the accepted list/);
  assert.match(res.summary, /^Does not match/);
});

test('Mismatch: skill shortfall counts how many are missing', () => {
  const res = evaluateOpportunity(aarav, opp('op-02'));
  assert.equal(res.status, STATUS.MISMATCH);
  const skills = res.requirements.find((q) => q.id === 'skills');
  assert.equal(skills.status, REQ.UNMET);
  assert.match(skills.detail, /1 of the 3 needed/);
});

test('Mismatch: year of study outside the range', () => {
  const res = evaluateOpportunity({ ...aarav, year: 4 }, opp('op-03'));
  assert.equal(res.status, STATUS.MISMATCH);
  assert.equal(res.requirements.find((q) => q.id === 'year').status, REQ.UNMET);
});

test('Mismatch: CGPA below the minimum', () => {
  const res = evaluateOpportunity({ ...aarav, cgpa: 7.5 }, opp('op-03'));
  assert.equal(res.status, STATUS.MISMATCH);
  assert.match(res.requirements.find((q) => q.id === 'cgpa').detail, /0\.5 below/);
});

test('Missing Information: blank CGPA on a CGPA-gated opportunity', () => {
  const res = evaluateOpportunity({ ...aarav, cgpa: '' }, opp('op-01'));
  assert.equal(res.status, STATUS.MISSING);
  const cgpa = res.requirements.find((q) => q.id === 'cgpa');
  assert.equal(cgpa.status, REQ.UNKNOWN);
  assert.ok(cgpa.fixInProfile);
  assert.match(res.summary, /^Cannot confirm yet/);
});

test('Missing Information: a hard failure still wins over missing data', () => {
  // Sneha has no skills (unknown) but the wrong course for op-13 (unmet) -> Mismatch.
  assert.equal(evaluateOpportunity(sneha, opp('op-13')).status, STATUS.MISMATCH);
});

test('Missing Information: incomplete sample profile produces all three statuses overall', () => {
  const statuses = new Set([
    ...evaluateAll(sneha, OPPORTUNITIES).map((r) => r.status),
    ...evaluateAll(aarav, OPPORTUNITIES).map((r) => r.status),
  ]);
  assert.deepEqual([...statuses].sort(), [STATUS.MATCH, STATUS.MISMATCH, STATUS.MISSING].sort());
});

test('Empty profile never throws and nothing is a Match when hard rules exist', () => {
  const results = evaluateAll(EMPTY_PROFILE, OPPORTUNITIES);
  assert.equal(results.length, OPPORTUNITIES.length);
  assert.ok(results.every((r) => r.status !== STATUS.MATCH));
});

test('Hard achievements: none listed is Missing, too few is Mismatch', () => {
  const none = evaluateOpportunity({ ...aarav, achievements: [] }, opp('op-03'));
  assert.equal(none.status, STATUS.MISSING);
  const o = { ...opp('op-03'), requirements: { ...opp('op-03').requirements, achievements: { min: 2, hard: true } } };
  const few = evaluateOpportunity({ ...aarav, achievements: ['one'] }, o);
  assert.equal(few.status, STATUS.MISMATCH);
});

test('Marking a document ready raises readiness and removes the open item', () => {
  const before = evaluateOpportunity(aarav, opp('op-01'));
  const after = evaluateOpportunity({ ...aarav, documents: [...aarav.documents, 'portfolio'] }, opp('op-01'));
  assert.ok(after.readiness > before.readiness);
  assert.ok(!after.openItems.some((i) => i.docId === 'portfolio'));
});

test('open items are ordered by urgency: eligibility first, documents last', () => {
  const res = evaluateOpportunity({ ...aarav, cgpa: '' }, opp('op-01'));
  const types = res.openItems.map((i) => i.type);
  assert.equal(types[0], 'cgpa');
  assert.equal(types[types.length - 1], 'document');
});

test('document actions ignore Mismatch opportunities and sort by impact', () => {
  const results = evaluateAll(aarav, OPPORTUNITIES);
  const actions = aggregateDocumentActions(results);
  assert.ok(actions.length > 0);
  for (let i = 1; i < actions.length; i += 1) assert.ok(actions[i - 1].count >= actions[i].count);
  const mismatchTitles = new Set(results.filter((r) => r.status === STATUS.MISMATCH).map((r) => r.opportunity.title));
  for (const a of actions) for (const t of a.titles) assert.ok(!mismatchTitles.has(t));
});

test('summary counts add up', () => {
  const results = evaluateAll(meera, OPPORTUNITIES);
  const s = summarize(results, CATEGORIES);
  assert.equal(s.total, OPPORTUNITIES.length);
  assert.equal(s.match + s.missing + s.mismatch, s.total);
  assert.equal(s.byCategory.reduce((n, c) => n + c.total, 0), s.total);
  const expectedOpen = results.filter((r) => r.status !== STATUS.MISMATCH).reduce((n, r) => n + r.openItems.length, 0);
  assert.equal(s.incomplete, expectedOpen);
});

test('profile completeness and validation', () => {
  assert.equal(profileCompleteness(EMPTY_PROFILE).percent, 0);
  assert.equal(profileCompleteness(aarav).percent, 100);
  assert.deepEqual(profileCompleteness(sneha).missing.sort(), ['Achievements', 'CGPA', 'Documents', 'Skills'].sort());
  assert.ok(isValidProfile(aarav));
  assert.ok(!isValidProfile({ course: 5 }));
  assert.ok(!isValidProfile(null));
});

test('checklist text export includes next steps', () => {
  const text = checklistToText(evaluateOpportunity(aarav, opp('op-01')));
  assert.match(text, /DEMO DATA/);
  assert.match(text, /Next step:/);
});
