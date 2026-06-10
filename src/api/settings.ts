import { apiClient, unwrap } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type {
  AccountSettingsDto,
  ChangePasswordRequest,
  SessionDto,
  UpdateAccountSettingsRequest,
} from '@/types/api';

export const settingsApi = {
  get: () => unwrap<AccountSettingsDto>(apiClient.get('/settings')),
  update: (input: UpdateAccountSettingsRequest) =>
    unwrap<AccountSettingsDto>(apiClient.put('/settings', input)),
  changePassword: (input: ChangePasswordRequest) =>
    unwrap<void>(apiClient.post('/settings/password', input)),
  sessions: () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    return unwrap<SessionDto[]>(
      apiClient.get('/settings/sessions', {
        headers: refreshToken ? { 'X-Refresh-Token': refreshToken } : undefined,
      }),
    );
  },
  revokeSession: (tokenId: number) => unwrap<void>(apiClient.delete(`/settings/sessions/${tokenId}`)),
  deactivateAccount: () => unwrap<{ deactivated: boolean }>(apiClient.delete('/settings/account')),
};
