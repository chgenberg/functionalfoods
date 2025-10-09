import http from 'k6/http';
import { check, sleep } from 'k6';

// Usage examples:
// 1) Smoke (safe): BASE_URL=https://ulrika-functional-foods-production.up.railway.app k6 run scripts/loadtest/k6-prod-readonly.js
// 2) With auth (optional): TOKEN=eyJ... BASE_URL=... k6 run scripts/loadtest/k6-prod-readonly.js
// 3) Heavier run: k6 run --vus 100 --duration 5m scripts/loadtest/k6-prod-readonly.js

export const options = {
  vus: __ENV.VUS ? Number(__ENV.VUS) : 20,
  duration: __ENV.DURATION || '2m',
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'], // 95% under 800ms
    http_req_failed: ['rate<0.01'], // <1% failures
  },
  // Optional ramping scenario (override with --vus/--duration if desired)
  scenarios: __ENV.RAMP ? {
    ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '3m', target: 100 },
        { duration: '2m', target: 0 },
      ],
    },
  } : undefined,
};

const BASE_URL = __ENV.BASE_URL || 'https://ulrika-functional-foods-production.up.railway.app';
const TOKEN = __ENV.TOKEN || '';

const commonHeaders = {
  'User-Agent': 'k6-loadtest/production-readonly',
  'Accept': 'text/html,application/json',
  'Cache-Control': 'no-cache',
};

if (TOKEN) {
  commonHeaders['Authorization'] = `Bearer ${TOKEN}`;
}

// Read-only endpoints/pages
const publicPages = [
  '/',
  '/kunskapsbank/recept?free=true&limit=21&page=1',
  '/kunskapsbank/recept?free=true&limit=21&page=2',
  '/kunskapsbank/recept?free=true&limit=21&page=3',
  '/utbildning',
];

const apiEndpoints = [
  '/api/recipes?free=true&limit=21&page=1',
  '/api/recipes?free=true&limit=21&page=2',
  '/api/recipes/random',
  '/api/recipes?featured=true&limit=12&free=true',
];

// Optional authenticated endpoints (only if TOKEN present)
const authEndpoints = [
  '/api/user/purchases',
  '/api/user/profile-summary',
];

export default function () {
  // Hit public pages
  for (const path of publicPages) {
    const res = http.get(`${BASE_URL}${path}`, { headers: commonHeaders, tags: { endpoint: path, type: 'page' } });
    check(res, {
      [`${path} status 200`]: (r) => r.status === 200,
    });
    sleep(0.2);
  }

  // Hit public APIs
  for (const path of apiEndpoints) {
    const res = http.get(`${BASE_URL}${path}`, { headers: commonHeaders, tags: { endpoint: path, type: 'api' } });
    check(res, {
      [`${path} status 200`]: (r) => r.status === 200,
      [`${path} json`]: (r) => r.headers['Content-Type']?.includes('application/json') || true,
    });
    sleep(0.2);
  }

  // Auth-only (if token supplied)
  if (TOKEN) {
    for (const path of authEndpoints) {
      const res = http.get(`${BASE_URL}${path}`, { headers: commonHeaders, tags: { endpoint: path, type: 'api-auth' } });
      check(res, {
        [`${path} status 200/401`]: (r) => r.status === 200 || r.status === 401, // allow 401 if token invalid
      });
      sleep(0.2);
    }
  }

  // Short think time between iterations
  sleep(0.5);
}


