import { fetchDashboardSummary } from './dashboardSummaryService';
import { getCurrentDashboardSession } from './dashboardCache';
import { getProfile } from '../profile/services/profileService';
import { getProyectos, getTecnologiasCatalogo } from '../projects/services/projectsService';
import { getUserSkills, getCatalogSkills } from '../skills/services/skillService';
import { getExperiencias } from '../experience/services/experienceService';
import { fetchEnlaces } from '../Links/services/EnlaceService';

const PREFETCH_COOLDOWN_MS = 20000;

let lastPrefetch = {
  userId: null,
  startedAt: 0,
};

function runSilently(task) {
  return Promise.resolve()
    .then(task)
    .catch(() => null);
}

function schedule(task) {
  if (typeof window === 'undefined') {
    task();
    return;
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 1200 });
    return;
  }

  window.setTimeout(task, 150);
}

export function preloadDashboardData() {
  let userId;

  try {
    userId = getCurrentDashboardSession({ requireToken: false }).userId;
  } catch {
    return;
  }

  const now = Date.now();

  if (lastPrefetch.userId === userId && now - lastPrefetch.startedAt < PREFETCH_COOLDOWN_MS) {
    return;
  }

  lastPrefetch = { userId, startedAt: now };

  schedule(() => {
    [
      () => fetchDashboardSummary({ force: false }),
      () => getProfile({ force: false }),
      () => getProyectos({ force: false }),
      () => getUserSkills({ force: false }),
      () => getExperiencias({ force: false }),
      () => fetchEnlaces({ force: false }),
      () => getCatalogSkills({ force: false }),
      () => getTecnologiasCatalogo(),
    ].forEach(runSilently);
  });
}
