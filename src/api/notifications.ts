import { apiClient, unwrap } from '@/api/client';
import type { NotificationDto } from '@/types/api';

export const notificationsApi = {
  list: () => unwrap<NotificationDto[]>(apiClient.get('/notifications')),
  unreadCount: () => unwrap<{ unreadCount: number }>(apiClient.get('/notifications/unread-count')),
  read: (id: number) => unwrap<void>(apiClient.post(`/notifications/${id}/read`)),
};
