import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const terms = ['banan', 'lax', 'sallad', 'smoothie', 'kyckling'];
  const q = terms[Math.floor(Math.random() * terms.length)];
  const res = http.get(`${BASE}/api/search?q=${encodeURIComponent(q)}&type=all`, {
    headers: {
      // Add Authorization: `Bearer <token>` if needed for personalized access
    },
    tags: { endpoint: 'search' },
  });

  check(res, {
    'status is 200 or 400 (short query)': (r) => r.status === 200 || r.status === 400,
    'json content-type': (r) => String(r.headers['Content-Type'] || '').includes('application/json'),
  });

  sleep(0.2);
} 