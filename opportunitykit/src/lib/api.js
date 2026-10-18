// Data access layer. Today it resolves bundled demo data after a short delay so the loading and
// error states are real code paths. Replace the body with fetch() when a backend exists.
//
// Demo hook for judges: open the app with ?demo=error to see the error state once.
// The flag is removed after it fires, so pressing "Try again" succeeds.

import { OPPORTUNITIES } from '../data/opportunities.js';

export function loadOpportunities({ delay = 700 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('demo') === 'error') {
          params.delete('demo');
          const qs = params.toString();
          window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash);
          throw new Error('The opportunity list could not be loaded (simulated failure).');
        }
        if (!Array.isArray(OPPORTUNITIES)) throw new Error('Opportunity data is malformed.');
        resolve(OPPORTUNITIES);
      } catch (err) {
        reject(err);
      }
    }, delay);
  });
}
