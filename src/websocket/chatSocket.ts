import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { MessageDto, NotificationDto } from '@/types/api';

export function createChatClient(onConnect?: () => void) {
  return new Client({
    webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL ?? 'http://localhost:8080/ws'),
    reconnectDelay: 3000,
    onConnect,
  });
}

export function subscribeToConversation(
  client: Client,
  conversationId: number,
  onMessage: (message: MessageDto) => void,
) {
  return client.subscribe(`/topic/conversations/${conversationId}`, (frame) => {
    onMessage(JSON.parse(frame.body) as MessageDto);
  });
}

export function subscribeToNotifications(
  client: Client,
  userId: number,
  onNotification: (notification: NotificationDto) => void,
) {
  return client.subscribe(`/topic/notifications/${userId}`, (frame) => {
    onNotification(JSON.parse(frame.body) as NotificationDto);
  });
}
