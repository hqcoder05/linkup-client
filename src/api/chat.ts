import { apiClient, unwrap } from '@/api/client';
import type { ConversationDto, MessageDto } from '@/types/api';

export const chatApi = {
  conversations: () => unwrap<ConversationDto[]>(apiClient.get('/conversations')),
  createConversation: (memberIds: number[], name?: string) =>
    unwrap<ConversationDto>(apiClient.post('/conversations', { memberIds, name })),
  messages: (conversationId: number, before?: string, take = 50) =>
    unwrap<MessageDto[]>(
      apiClient.get(`/conversations/${conversationId}/messages`, { params: { before, take } }),
    ),
  send: (
    conversationId: number,
    input: {
      content?: string;
      attachmentUrl?: string;
      sharedPostId?: number;
      sharedStoryId?: number;
      disappearAfterSeconds?: number;
    },
  ) =>
    unwrap<MessageDto>(apiClient.post(`/conversations/${conversationId}/messages`, input)),
  read: (conversationId: number) => unwrap<void>(apiClient.post(`/conversations/${conversationId}/read`)),
};
