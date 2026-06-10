import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from '@/config/env';
import type {
  CallDescriptionPayload,
  CallIcePayload,
  CallInvitePayload,
  CallSignalDto,
  CallStatePayload,
  MessageDto,
  NotificationDto,
} from '@/types/api';

export function createChatClient(onConnect?: () => void) {
  return new Client({
    webSocketFactory: () => new SockJS(WS_URL),
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

export function subscribeToCallSignals(
  client: Client,
  userId: number,
  onSignal: (signal: CallSignalDto) => void,
) {
  return client.subscribe(`/topic/calls/${userId}`, (frame) => {
    onSignal(JSON.parse(frame.body) as CallSignalDto);
  });
}

export function sendCallInvite(client: Client, payload: CallInvitePayload) {
  client.publish({ destination: '/app/calls.invite', body: JSON.stringify(payload) });
}

export function sendCallOffer(client: Client, payload: CallDescriptionPayload) {
  client.publish({ destination: '/app/calls.offer', body: JSON.stringify(payload) });
}

export function sendCallAnswer(client: Client, payload: CallDescriptionPayload) {
  client.publish({ destination: '/app/calls.answer', body: JSON.stringify(payload) });
}

export function sendCallIce(client: Client, payload: CallIcePayload) {
  client.publish({ destination: '/app/calls.ice', body: JSON.stringify(payload) });
}

export function rejectCall(client: Client, payload: CallStatePayload) {
  client.publish({ destination: '/app/calls.reject', body: JSON.stringify(payload) });
}

export function endCall(client: Client, payload: CallStatePayload) {
  client.publish({ destination: '/app/calls.end', body: JSON.stringify(payload) });
}
