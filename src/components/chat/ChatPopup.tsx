import { Send, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { chatApi } from '@/api/chat';
import { createChatClient, subscribeToConversation } from '@/websocket/chatSocket';
import type { ConversationDto, MessageDto, UserDto } from '@/types/api';
import { displayName } from '@/utils/format';

type ChatPopupProps = {
  conversation: ConversationDto;
  currentUser: UserDto | null;
  onClose: () => void;
};

export function ChatPopup({ conversation, currentUser, onClose }: ChatPopupProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [liveMessages, setLiveMessages] = useState<MessageDto[]>([]);
  const queryClient = useQueryClient();
  const other = conversation.group
    ? null
    : conversation.members.find((member) => member.id !== currentUser?.id) ?? conversation.members[0];
  const title = conversation.name || displayName(other ?? undefined);

  const messages = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: () => chatApi.messages(conversation.id),
    retry: false,
  });

  const send = useMutation({
    mutationFn: () => chatApi.send(conversation.id, { content: draft.trim() }),
    onSuccess: () => {
      setDraft('');
      void queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  useEffect(() => {
    setLiveMessages([]);
    const client = createChatClient();
    client.onConnect = () => {
      subscribeToConversation(client, conversation.id, (message) => {
        setLiveMessages((items) => [...items, message]);
        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      });
      void chatApi.read(conversation.id);
    };
    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [conversation.id, queryClient]);

  const allMessages = useMemo(() => {
    const combined = [...(messages.data ?? []).reverse(), ...liveMessages];
    return combined.filter((message, index, list) => list.findIndex((item) => item.id === message.id) === index);
  }, [liveMessages, messages.data]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[440px] w-[340px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-3 py-2.5 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar user={other} size="sm" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{title}</h2>
            <p className="text-[11px] text-slate-300">{t('chat.conversation')}</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full p-1 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3">
        {messages.isLoading && <p className="text-center text-sm text-slate-500">{t('chat.loading_messages')}</p>}
        {messages.isError && <p className="text-center text-sm text-slate-500">{t('chat.messages_unavailable_short')}</p>}
        {allMessages.map((message) => {
          const mine = message.sender.id === currentUser?.id || message.mine;
          return (
            <div key={message.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={
                  mine
                    ? 'max-w-[78%] rounded-2xl bg-blue-600 px-3 py-2 text-sm text-white'
                    : 'max-w-[78%] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900'
                }
              >
                {message.content}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 bg-white p-2">
        <div className="flex gap-2">
          <textarea
            className="min-h-10 flex-1 resize-none rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400"
            rows={1}
            placeholder={t('chat.type_message')}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && draft.trim()) {
                event.preventDefault();
                send.mutate();
              }
            }}
          />
          <Button className="h-10 w-10 rounded-full p-0" disabled={!draft.trim() || send.isPending} onClick={() => send.mutate()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
