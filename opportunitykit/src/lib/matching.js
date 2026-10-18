// Client-side eligibility engine. Pure functions, no React, no network.
//
// Each opportunity is broken into requirements. Each requirement is evaluated against the profile
// and gets one of three results:
//   met      the profile satisfies it
//   unmet    the profile has the information and does not satisfy it
//   unknown  the profile does not contain the information needed to decide
//
// A requirement is either "hard" (an eligibility rule) or "soft" (helps the application, but does not
// decide eligibility). Documents are always soft: they affect readiness, not eligibility.
//
// Overall status of an opportunity:
//   mismatch  at least one hard requirement is unmet
//   missing   no hard requirement is unmet, but at least one hard requirement is unknown
//   match     every hard requirement is met

import { DOCUMENTS } from '../data/constants.js';

export const STATUS = { MATCH: 'match', MISMATCH: 'mismatch', MISSING: 'missing' };
export const REQ = { MET: 'met', UNMET: 'unmet', UNKNOWN: 'unknown' };

const SKILL_ALIASES = {
  js: 'javascript',
  'java script': 'javascript',
  reactjs: 'react',
  'react.js': 'react',
  ts: 'typescript',
  py: 'python',
  ml: 'machine learning',
  'ms excel': 'excel',
  'microsoft excel': 'excel',
  tailwind: 'tailwind css',
  'ui design': 'figma',
  'data viz': 'data visualization',
  'internet of things': 'iot',
};

export function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeSkill(value) {
  const key = normalizeText(value);
  return SKILL_ALIASES[key] ?? key;
}

const hasNumber = (v) => v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v));

function makeReq(fields) {
  return { hard: false, nextStep: null, fixInProfile: false, docId: null, ...fields };
}

function evalCourse(profile, rule) {
  const label = `Course: ${rule.join(' or ')}`;
  if (!profile.course) {
    return makeReq({
      id: 'course', type: 'course', hard: true, label, status: REQ.UNKNOWN,
      detail: 'Your course is not in your profile, so this cannot be checked.',
      nextStep: 'Add your course to your profile.', fixInProfile: true,
    });
  }
  const ok = rule.includes(profile.course);
  return makeReq({
    id: 'course', type: 'course', hard: true, label, status: ok ? REQ.MET : REQ.UNMET,
    detail: ok
      ? `Your course (${profile.course}) is accepted.`
      : `Your course (${profile.course}) is not on the accepted list.`,
    nextStep: ok ? null : 'This is a fixed eligibility rule. Focus on opportunities marked Match.',
  });
}

function evalYear(profile, rule) {
  const { min = 1, max = 5 } = rule;
  const label = `Year of study: ${min === max ? min : `${min} to ${max}`}`;
  if (!hasNumber(profile.year)) {
    return makeReq({
      id: 'year', type: 'year', hard: true, label, status: REQ.UNKNOWN,
      detail: 'Your year of study is not in your profile.',
      nextStep: 'Add your year of study to your profile.', fixInProfile: true,
    });
  }
  const year = Number(profile.year);
  const ok = year >= min && year <= max;
  return makeReq({
    id: 'year', type: 'year', hard: true, label, status: ok ? REQ.MET : REQ.UNMET,
    detail: ok
      ? `You are in year ${year}, which is within the range.`
      : `You are in year ${year}, outside the accepted range.`,
    nextStep: ok ? null : year < min
      ? `Eligible from year ${min}. Save this one for later.`
      : 'The accepted years have passed for you. Focus on opportunities marked Match.',
  });
}

function evalCgpa(profile, min) {
  const label = `Minimum CGPA ${min} (10-point scale)`;
  if (!hasNumber(profile.cgpa)) {
    return makeReq({
      id: 'cgpa', type: 'cgpa', hard: true, label, status: REQ.UNKNOWN,
      detail: 'Your CGPA is not in your profile.',
      nextStep: 'Add your latest CGPA, converted to a 10-point scale if needed.', fixInProfile: true,
    });
  }
  const cgpa = Number(profile.cgpa);
  const ok = cgpa >= min;
  return makeReq({
    id: 'cgpa', type: 'cgpa', hard: true, label, status: ok ? REQ.MET : REQ.UNMET,
    detail: ok
      ? `Your CGPA (${cgpa}) meets the minimum.`
      : `Your CGPA (${cgpa}) is ${(min - cgpa).toFixed(1)} below the minimum.`,
    nextStep: ok ? null : 'The cutoff is fixed. Consider opportunities with a lower or no CGPA requirement.',
  });
}

function evalSkills(profile, rule) {
  const minMatch = rule.minMatch ?? 1;
  const label = `At least ${minMatch} of these skills: ${rule.anyOf.join(', ')}`;
  const owned = new Set((profile.skills ?? []).map(normalizeSkill));
  if (owned.size === 0) {
    return makeReq({
      id: 'skills', type: 'skills', hard: true, label, status: REQ.UNKNOWN,
      detail: 'No skills are listed in your profile.',
      nextStep: 'Add the skills you already have to your profile.', fixInProfile: true,
    });
  }
  const matched = rule.anyOf.filter((s) => owned.has(normalizeSkill(s)));
  const missing = rule.anyOf.filter((s) => !owned.has(normalizeSkill(s)));
  const ok = matched.length >= minMatch;
  const need = minMatch - matched.length;
  return makeReq({
    id: 'skills', type: 'skills', hard: true, label, status: ok ? REQ.MET : REQ.UNMET,
    detail: ok
      ? `You have ${matched.length} of the listed skills: ${matched.join(', ')}.`
      : `You have ${matched.length} of the ${minMatch} needed (${matched.join(', ') || 'none'}).`,
    nextStep: ok ? null : `Learn ${need} more, for example ${missing.slice(0, 3).join(', ')}. A small project for each is enough to show it.`,
  });
}

function evalBonusSkills(profile, list) {
  const label = `Bonus skills: ${list.join(', ')}`;
  const owned = new Set((profile.skills ?? []).map(normalizeSkill));
  if (owned.size === 0) {
    return makeReq({
      id: 'bonus', type: 'bonus', label, status: REQ.UNKNOWN,
      detail: 'No skills are listed in your profile.',
      nextStep: 'Add your skills to your profile.', fixInProfile: true,
    });
  }
  const matched = list.filter((s) => owned.has(normalizeSkill(s)));
  const ok = matched.length > 0;
  return makeReq({
    id: 'bonus', type: 'bonus', label, status: ok ? REQ.MET : REQ.UNMET,
    detail: ok ? `You have a bonus skill: ${matched.join(', ')}.` : 'You have none of the bonus skills. They are optional.',
    nextStep: ok ? null : `Optional: pick up ${list[0]} to stand out.`,
  });
}

function evalInterests(profile, list) {
  const label = `Interest in: ${list.join(', ')}`;
  const owned = new Set((profile.interests ?? []).map(normalizeText));
  if (owned.size === 0) {
    return makeReq({
      id: 'interests', type: 'interests', label, status: REQ.UNKNOWN,
      detail: 'No interests are listed in your profile.',
      nextStep: 'Add your interests so we can check the fit.', fixInProfile: true,
    });
  }
  const matched = list.filter((i) => owned.has(normalizeText(i)));
  const ok = matched.length > 0;
  return makeReq({
    id: 'interests', type: 'interests', label, status: ok ? REQ.MET : REQ.UNMET,
    detail: ok ? `Your interests overlap: ${matched.join(', ')}.` : 'None of your interests overlap with this opportunity.',
    nextStep: ok ? null : 'Mention in your application why this area interests you, or look for a closer fit.',
  });
}

function evalAchievements(profile, rule) {
  const min = rule.min ?? 1;
  const label = `At least ${min} achievement${min > 1 ? 's' : ''} (award, project, leadership or certificate)`;
  const count = (profile.achievements ?? []).filter((a) => normalizeText(a)).length;
  if (count === 0) {
    return makeReq({
      id: 'achievements', type: 'achievements', hard: Boolean(rule.hard), label, status: REQ.UNKNOWN,
      detail: 'No achievements are listed in your profile.',
      nextStep: `Add ${min} achievement${min > 1 ? 's' : ''} to your profile, such as a project, award or certificate.`,
      fixInProfile: true,
    });
  }
  const ok = count >= min;
  return makeReq({
    id: 'achievements', type: 'achievements', hard: Boolean(rule.hard), label, status: ok ? REQ.MET : REQ.UNMET,
    detail: ok ? `You list ${count} achievement${count > 1 ? 's' : ''}.` : `You list ${count} of the ${min} needed.`,
    nextStep: ok ? null : `Add ${min - count} more achievement${min - count > 1 ? 's' : ''} to your profile.`,
    fixInProfile: !ok,
  });
}

function evalDocument(profile, docId) {
  const doc = DOCUMENTS[docId];
  const have = (profile.documents ?? []).includes(docId);
  return makeReq({
    id: `doc-${docId}`, type: 'document', docId, label: `Document: ${doc.label}`,
    status: have ? REQ.MET : REQ.UNMET,
    detail: have ? 'You marked this as ready.' : 'You have not marked this as ready.',
    nextStep: have ? null : doc.hint,
  });
}

export function evaluateRequirements(profile, opp) {
  const r = opp.requirements ?? {};
  const out = [];
  if (r.courses?.length) out.push(evalCourse(profile, r.courses));
  if (r.years) out.push(evalYear(profile, r.years));
  if (hasNumber(r.minCgpa)) out.push(evalCgpa(profile, r.minCgpa));
  if (r.skills?.anyOf?.length) out.push(evalSkills(profile, r.skills));
  if (r.achievements) out.push(evalAchievements(profile, r.achievements));
  if (r.bonusSkills?.length) out.push(evalBonusSkills(profile, r.bonusSkills));
  if (r.interests?.length) out.push(evalInterests(profile, r.interests));
  for (const docId of r.documents ?? []) out.push(evalDocument(profile, docId));
  return out;
}

// Lower number = more urgent.
function priority(req) {
  if (req.hard && req.status === REQ.UNMET) return 0;
  if (req.hard && req.status === REQ.UNKNOWN) return 1;
  if (req.type !== 'document') return 2;
  return 3;
}

export function deriveStatus(requirements) {
  if (requirements.some((q) => q.hard && q.status === REQ.UNMET)) return STATUS.MISMATCH;
  if (requirements.some((q) => q.hard && q.status === REQ.UNKNOWN)) return STATUS.MISSING;
  return STATUS.MATCH;
}

function buildSummary(status, requirements) {
  const names = (list) => list.map((q) => q.label.split(':')[0].replace(/^Minimum /, '').toLowerCase()).join(', ');
  if (status === STATUS.MISMATCH) {
    const bad = requirements.filter((q) => q.hard && q.status === REQ.UNMET);
    return `Does not match: ${bad.length} eligibility rule${bad.length > 1 ? 's' : ''} not met (${names(bad)}).`;
  }
  if (status === STATUS.MISSING) {
    const gap = requirements.filter((q) => q.hard && q.status === REQ.UNKNOWN);
    return `Cannot confirm yet: add ${names(gap)} to your profile.`;
  }
  const hard = requirements.filter((q) => q.hard).length;
  return hard > 0
    ? `Matches: you meet all ${hard} eligibility rules.`
    : 'Matches: this opportunity has no hard eligibility rules.';
}

export function evaluateOpportunity(profile, opp) {
  const requirements = evaluateRequirements(profile, opp);
  const status = deriveStatus(requirements);
  const total = requirements.length;
  const metCount = requirements.filter((q) => q.status === REQ.MET).length;
  const openItems = requirements
    .filter((q) => q.status !== REQ.MET)
    .sort((a, b) => priority(a) - priority(b));
  const readiness = total === 0 ? 100 : Math.round((metCount / total) * 100);
  const statusWeight = { [STATUS.MATCH]: 300, [STATUS.MISSING]: 200, [STATUS.MISMATCH]: 100 }[status];
  return {
    opportunity: opp,
    status,
    requirements,
    openItems,
    metCount,
    total,
    readiness,
    summary: buildSummary(status, requirements),
    rank: statusWeight + readiness,
  };
}

export function evaluateAll(profile, opportunities) {
  return opportunities.map((o) => evaluateOpportunity(profile, o));
}

// Documents that would move the most opportunities forward. Opportunities marked Mismatch are
// ignored because a document cannot fix an eligibility rule.
export function aggregateDocumentActions(results) {
  const map = new Map();
  for (const res of results) {
    if (res.status === STATUS.MISMATCH) continue;
    for (const item of res.openItems) {
      if (item.type !== 'document') continue;
      const entry = map.get(item.docId) ?? {
        docId: item.docId, label: DOCUMENTS[item.docId].label, hint: DOCUMENTS[item.docId].hint, titles: [],
      };
      entry.titles.push(res.opportunity.title);
      map.set(item.docId, entry);
    }
  }
  return [...map.values()]
    .map((e) => ({ ...e, count: e.titles.length }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function summarize(results, categories) {
  const count = (s) => results.filter((r) => r.status === s).length;
  const workable = results.filter((r) => r.status !== STATUS.MISMATCH);
  return {
    total: results.length,
    match: count(STATUS.MATCH),
    missing: count(STATUS.MISSING),
    mismatch: count(STATUS.MISMATCH),
    incomplete: workable.reduce((sum, r) => sum + r.openItems.length, 0),
    readyToApply: results.filter((r) => r.status === STATUS.MATCH && r.openItems.length === 0).length,
    avgReadiness: workable.length
      ? Math.round(workable.reduce((s, r) => s + r.readiness, 0) / workable.length)
      : 0,
    byCategory: categories.map((cat) => {
      const rows = results.filter((r) => r.opportunity.category === cat);
      return {
        category: cat,
        total: rows.length,
        match: rows.filter((r) => r.status === STATUS.MATCH).length,
        missing: rows.filter((r) => r.status === STATUS.MISSING).length,
        mismatch: rows.filter((r) => r.status === STATUS.MISMATCH).length,
      };
    }),
  };
}

export function profileCompleteness(profile) {
  const checks = [
    ['Name', Boolean(normalizeText(profile.name))],
    ['Course', Boolean(profile.course)],
    ['Year of study', hasNumber(profile.year)],
    ['CGPA', hasNumber(profile.cgpa)],
    ['Skills', (profile.skills ?? []).length > 0],
    ['Interests', (profile.interests ?? []).length > 0],
    ['Achievements', (profile.achievements ?? []).length > 0],
    ['Documents', (profile.documents ?? []).length > 0],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter(([, ok]) => !ok).map(([name]) => name),
  };
}

export function isValidProfile(p) {
  return Boolean(
    p && typeof p === 'object' &&
    typeof p.name === 'string' && typeof p.course === 'string' &&
    Array.isArray(p.skills) && Array.isArray(p.interests) &&
    Array.isArray(p.achievements) && Array.isArray(p.documents),
  );
}

export function checklistToText(result) {
  const { opportunity: o } = result;
  const lines = [
    `Readiness checklist: ${o.title} (${o.organization}) [DEMO DATA]`,
    `Status: ${result.status}. Readiness: ${result.readiness}%.`,
    '',
  ];
  if (result.openItems.length === 0) lines.push('Nothing left to do. Everything is ready.');
  result.openItems.forEach((item, i) => {
    lines.push(`${i + 1}. [ ] ${item.label}`);
    lines.push(`   ${item.detail}`);
    if (item.nextStep) lines.push(`   Next step: ${item.nextStep}`);
  });
  return lines.join('\n');
}
