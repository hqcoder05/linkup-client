const LOCAL_API_BASE_URL = 'http://localhost:8080/api';
const LOCAL_WS_URL = 'http://localhost:8080/ws';
const PRODUCTION_BACKEND_URL = 'https://linkup-backend-fvg3.onrender.com';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function withPath(baseUrl: string, path: string) {
  const normalized = trimTrailingSlash(baseUrl);
  return normalized.endsWith(path) ? normalized : `${normalized}${path}`;
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? trimTrailingSlash(import.meta.env.VITE_API_BASE_URL)
  : import.meta.env.PROD
    ? `${PRODUCTION_BACKEND_URL}/api`
    : LOCAL_API_BASE_URL;

export const WS_URL = import.meta.env.VITE_WS_URL
  ? trimTrailingSlash(import.meta.env.VITE_WS_URL)
  : import.meta.env.PROD
    ? withPath(PRODUCTION_BACKEND_URL, '/ws')
    : LOCAL_WS_URL;
