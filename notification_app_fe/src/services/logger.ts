import { Log } from '../../../logging_middleware/client';

export function logApiStart(message: string) {
  return Log('frontend', 'info', 'api', message, { accessToken: '' }).catch(() => undefined);
}

export function logApiSuccess(message: string) {
  return Log('frontend', 'info', 'api', message, { accessToken: '' }).catch(() => undefined);
}

export function logApiError(message: string) {
  return Log('frontend', 'error', 'api', message, { accessToken: '' }).catch(() => undefined);
}

export function logPage(message: string) {
  return Log('frontend', 'info', 'page', message, { accessToken: '' }).catch(() => undefined);
}
