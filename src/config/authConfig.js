import { createHttpError } from '../utils/httpError.js';

export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  OAUTH_PROVIDER_GOOGLE: 'google',
  OAUTH_ACCESS_TYPE: 'offline',
  OAUTH_PROMPT: 'consent',
  RECOVERY_OTP_TYPE: 'recovery',
  REDIRECT_PATHS: {
    GOOGLE_CALLBACK: '/callback',
    RESET_PASSWORD: '/reset-password',
  },
};

export function buildFrontendRedirectUrl(path) {
  const baseUrl = process.env.FRONTEND_URL?.trim();
  if (!baseUrl) {
    throw createHttpError(500, 'Konfigurasi FRONTEND_URL belum diatur di server');
  }
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${normalizedPath}`;
}