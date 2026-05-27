import { Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { chatApi } from '@/api/chat';
import { createChatClient, subscribeToConversation } from '@/websocket/chatSocket';
import type { ConversationDto, MessageDto, UserDto } from '@/types/api';
import { displayName, formatDateTime } from '@/utils/format';

export function ChatWindow({ conversation, currentUser }: { conversation?: ConversationDto; currentUser: UserDto | null }) {
  const [draft, setDraft] = useState('');
  const [liveMessages, setLiveMessages] = useState<MessageDto[]>([]);
  const queryClient = useQueryClient();
  const messages = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => chatApi.messages(conversation!.id),
    enabled: Boolean(conversation),
  });
  const send = useMutation({
    mutationFn: () => chatApi.send(conversation!.id, { content: draft.trim() }),
    onSuccess: () => {
      setDraft('');
      void queryClient.invalidateQueries({ queryKey: ['messages', conversation?.id] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  useEffect(() => {
    if (!conversation) return;
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
  }, [conversation, queryClient]);

  const allMessages = useMemo(() => {
    const combined = [...(messages.data ?? []).reverse(), ...liveMessages];
    return combined.filter((message, index, list) => list.findIndex((item) => item.id === message.id) === index);
  }, [liveMessages, messages.data]);

  if (!conversation) {
    return (
      <section className="flex flex-1 items-center justify-center bg-slate-50 p-6 text-center">
        <div>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <Send className="h-7 w-7" />
          </div>
          <h2 className="font-semibold text-slate-900">Choose a conversation</h2>
          <p className="text-sm text-slate-500">Select a conversation to start messaging.</p>
        </div>
      </section>
    );
  }

  const title =
    conversation.name ||
    displayName(conversation.members.find((member) => member.id !== currentUser?.id) ?? conversation.members[0]);

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">Conversation</p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {allMessages.map((message) => {
          const mine = message.sender.id === currentUser?.id || message.mine;
          return (
            <div key={message.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
              <div className="flex max-w-[78%] items-start gap-2">
                {!mine && <Avatar user={message.sender} size="sm" />}
                <div className={mine ? 'rounded-2xl bg-brand-500 px-3 py-2 text-white' : 'rounded-2xl border border-slate-200 bg-white px-3 py-2'}>
                  {!mine && <div className="mb-1 text-xs font-semibold text-slate-700">{displayName(message.sender)}</div>}
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  <p className={mine ? 'mt-1 text-[11px] text-brand-100' : 'mt-1 text-[11px] text-slate-400'}>{formatDateTime(message.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-slate-200 bg-white p-3">
        <div className="flex gap-2">
          <textarea
            className="input-field min-h-10 flex-1 resize-none"
            rows={1}
            placeholder="Type a message..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && draft.trim()) {
                event.preventDefault();
                send.mutate();
              }
            }}
          />
          <Button disabled={!draft.trim() || send.isPending} onClick={() => send.mutate()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
