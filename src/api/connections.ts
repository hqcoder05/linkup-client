import { apiClient, unwrap } from '@/api/client';
import type { ConnectionDto, UserDto } from '@/types/api';

export const connectionsApi = {
  request: (targetUserId: number) =>
    unwrap<ConnectionDto>(apiClient.post(`/connections/${targetUserId}`)),
  accept: (requesterId: number) =>
    unwrap<ConnectionDto>(apiClient.post(`/connections/${requesterId}/accept`)),
  decline: (requesterId: number) =>
    unwrap<ConnectionDto>(apiClient.post(`/connections/${requesterId}/decline`)),
  remove: (targetUserId: number) => unwrap<void>(apiClient.delete(`/connections/${targetUserId}`)),
  list: (userId: number) => unwrap<UserDto[]>(apiClient.get(`/users/${userId}/connections`)),
  incoming: () => unwrap<ConnectionDto[]>(apiClient.get('/connections/incoming')),
  outgoing: () => unwrap<ConnectionDto[]>(apiClient.get('/connections/outgoing')),
  status: (userId: number) =>
    unwrap<{ status: string }>(apiClient.get(`/users/${userId}/connection-status`)),
};
