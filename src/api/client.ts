import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse, AuthResponse } from '@/types/api';

const AUTH_STORAGE_KEY = 'linkup-auth';
let refreshPromise: Promise<AuthResponse> | null = null;

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function clearAuthAndRedirect() {
  useAuthStore.getState().logout();
  localStorage.removeItem(AUTH_STORAGE_KEY);
  if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
    window.location.assign('/login');
  }
}

function isAuthSessionEndpoint(url?: string) {
  return Boolean(url?.includes('/auth/me'));
}

function saysTokenInvalid(message: unknown) {
  if (typeof message !== 'string') return false;
  return /token|jwt|expired|invalid|unauthorized/i.test(message);
}

function refreshSession(refreshToken: string) {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiResponse<AuthResponse>>(
        `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'}/auth/refresh`,
        { refreshToken },
      )
      .then((response) => {
        if (!response.data.success) {
          throw new Error(response.data.message || 'Refresh token failed');
        }
        const session = response.data.data;
        useAuthStore.getState().setSession(session);
        return session;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;
    const hadToken = Boolean(useAuthStore.getState().accessToken);
    const requestUrl = error.config?.url as string | undefined;
    const responseMessage = error.response?.data?.message;
    const originalRequest = error.config as RetryConfig | undefined;

    if (status === 401 && hadToken && originalRequest && !originalRequest._retry && !requestUrl?.includes('/auth/refresh')) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        originalRequest._retry = true;
        try {
          const session = await refreshSession(refreshToken);
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          clearAuthAndRedirect();
        }
      } else {
        clearAuthAndRedirect();
      }
    }

    if (status === 403 && hadToken && (isAuthSessionEndpoint(requestUrl) || saysTokenInvalid(responseMessage))) {
      clearAuthAndRedirect();
    }

    return Promise.reject(error);
  },
);

export function apiStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  if (!response.data.success) {
    throw new Error(response.data.message || 'Request failed');
  }
  return response.data.data;
}

export function apiMessage(error: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}
