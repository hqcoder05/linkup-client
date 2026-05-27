import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { chatApi } from '@/api/chat';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';

export function ChatPage() {
  const currentUser = useAuthStore((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const conversations = useQuery({ queryKey: ['conversations'], queryFn: chatApi.conversations });
  const activeId = params.conversationId ? Number(params.conversationId) : undefined;
  const active = useMemo(
    () => conversations.data?.find((conversation) => conversation.id === activeId) ?? conversations.data?.[0],
    [activeId, conversations.data],
  );

  return (
    <Card className="mx-auto flex h-[calc(100vh-130px)] max-w-5xl overflow-hidden">
      <ConversationList
        conversations={conversations.data ?? []}
        currentUser={currentUser}
        activeId={active?.id}
        onSelect={(conversation) => navigate(`/chat/${conversation.id}`)}
      />
      <ChatWindow conversation={active} currentUser={currentUser} />
    </Card>
  );
}
