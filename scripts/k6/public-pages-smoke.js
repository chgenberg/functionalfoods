import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

const pages = ['/', '/kunskapsbank', '/kunskapsbank/recept', '/kunskapsbank/blogg'];

export default function () {
  const path = pages[Math.floor(Math.random() * pages.length)];
  const res = http.get(`${BASE}${path}`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'html content-type': (r) => String(r.headers['Content-Type'] || '').includes('text/html'),
  });
  sleep(0.2);
} 