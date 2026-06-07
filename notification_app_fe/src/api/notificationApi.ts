import { logApiStart, logApiSuccess, logApiError } from '../services/logger';
import type { NotificationItem } from '../utils/priorityLogic';
import { authenticateForTest } from '../../../logging_middleware/client';

const BASE = import.meta.env.VITE_TEST_SERVER_URL || 'http://4.224.186.213';

function buildAuthOverrides() {
  return {
    // When running in dev, leave baseUrl empty so requests are relative and hit the Vite proxy
    baseUrl: import.meta.env.DEV ? '' : BASE,
    accessToken: import.meta.env.VITE_TEST_ACCESS_TOKEN || '',
    clientID: import.meta.env.VITE_TEST_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_TEST_CLIENT_SECRET || '',
    email: import.meta.env.VITE_TEST_EMAIL || '',
    name: import.meta.env.VITE_TEST_NAME || '',
    rollNo: import.meta.env.VITE_TEST_ROLL_NO || '',
    accessCode: import.meta.env.VITE_TEST_ACCESS_CODE || ''
  };
}

export async function fetchNotifications(params: { limit?: number; page?: number; notification_type?: string }) {
  await logApiStart('Fetching notifications');

  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.page) qs.set('page', String(params.page));
  if (params.notification_type) qs.set('notification_type', params.notification_type);

  // Authenticate to get a fresh bearer token (front-end provides overrides via VITE_ env vars)
  let token = '';
  try {
    token = await authenticateForTest(buildAuthOverrides());
  } catch (err) {
    await logApiError(`Authentication failed: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }

  // Use relative path in dev so Vite proxy can forward requests and avoid CORS
  const url = import.meta.env.DEV ? `/evaluation-service/notifications?${qs.toString()}` : `${BASE}/evaluation-service/notifications?${qs.toString()}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    credentials: 'omit'
  });

  if (!res.ok) {
    const text = await res.text();
    await logApiError(`Failed to fetch notifications: ${res.status} ${text}`);
    throw new Error(`status ${res.status}`);
  }

  const data = (await res.json()) as { notifications?: NotificationItem[] } | { message?: string };
  await logApiSuccess('Notifications fetched successfully');

  return Array.isArray((data as any).notifications) ? (data as any).notifications : [];
}
