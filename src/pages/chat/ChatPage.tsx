import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { chatApi } from '@/api/chat';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { apiMessage } from '@/api/client';

export function ChatPage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const conversations = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.conversations,
    enabled: Boolean(currentUser?.id),
    retry: false,
  });
  const activeId = params.conversationId ? Number(params.conversationId) : undefined;
  const active = useMemo(
    () => conversations.data?.find((conversation) => conversation.id === activeId) ?? conversations.data?.[0],
    [activeId, conversations.data],
  );

  return (
    <Card className="-mx-4 -my-6 flex h-[calc(100vh-65px)] overflow-hidden rounded-none border-x border-slate-200 shadow-none sm:-mx-6">
      <ConversationList
        conversations={conversations.data ?? []}
        currentUser={currentUser}
        activeId={active?.id}
        onSelect={(conversation) => navigate(`/chat/${conversation.id}`)}
      />
      {conversations.isError ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{t('chat.messages_unavailable')}</h1>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              {apiMessage(conversations.error, t('chat.could_not_load'))}
            </p>
          </div>
        </div>
      ) : (
        <ChatWindow conversation={active} currentUser={currentUser} />
      )}
    </Card>
  );
}
