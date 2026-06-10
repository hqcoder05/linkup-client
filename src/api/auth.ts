import { apiClient, unwrap } from '@/api/client';
import type { AuthResponse, UserDto } from '@/types/api';

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  fullName: string;
};

export const authApi = {
  login: (input: LoginInput) => unwrap<AuthResponse>(apiClient.post('/auth/login', input)),
  register: (input: RegisterInput) => unwrap<AuthResponse>(apiClient.post('/auth/register', input)),
  refresh: (refreshToken: string) => unwrap<AuthResponse>(apiClient.post('/auth/refresh', { refreshToken })),
  me: () => unwrap<AuthResponse>(apiClient.get('/auth/me')),
  currentUser: () => unwrap<UserDto>(apiClient.get('/users/me')),
};
