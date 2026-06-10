import { Info, Paperclip, Phone, Send, Smile, Video } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { chatApi } from '@/api/chat';
import { createChatClient, subscribeToConversation } from '@/websocket/chatSocket';
import type { ConversationDto, MessageDto, UserDto } from '@/types/api';
import { displayName } from '@/utils/format';

export function ChatWindow({ conversation, currentUser }: { conversation?: ConversationDto; currentUser: UserDto | null }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [liveMessages, setLiveMessages] = useState<MessageDto[]>([]);
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => chatApi.messages(conversation!.id),
    enabled: Boolean(conversation),
    retry: false,
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [allMessages.length, conversation?.id]);

  if (!conversation) {
    return (
      <section className="flex flex-1 items-center justify-center bg-slate-50 p-6 text-center">
        <div>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <Send className="h-7 w-7" />
          </div>
          <h2 className="font-semibold text-slate-900">{t('chat.choose_conversation')}</h2>
          <p className="text-sm text-slate-500">{t('chat.choose_body')}</p>
        </div>
      </section>
    );
  }

  const peer = conversationPeer(conversation, currentUser);
  const title = conversation.name || (conversation.group ? conversation.members.map((member) => displayName(member)).join(', ') : displayName(peer));

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-slate-50">
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar user={peer} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-950">{title}</h2>
            <p className="text-sm text-emerald-600">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {conversation.group
                ? t('chat.member_count', { count: conversation.members.length })
                : t('chat.available')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-slate-900">
          <button type="button" className="rounded-full p-2 transition-colors hover:bg-slate-100" aria-label={t('chat.call')}>
            <Phone className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-full p-2 transition-colors hover:bg-slate-100" aria-label={t('chat.video_call')}>
            <Video className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-full p-2 transition-colors hover:bg-slate-100" aria-label={t('chat.conversation_info')}>
            <Info className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-8 py-7">
        <div className="mb-7 flex justify-center">
          <span className="rounded-full bg-slate-200 px-5 py-2 text-sm font-medium uppercase tracking-wide text-slate-700">
            {t('chat.today')}
          </span>
        </div>

        {messages.isLoading && <p className="text-center text-sm text-slate-500">{t('chat.loading_messages')}</p>}
        {messages.isError && <p className="text-center text-sm text-slate-500">{t('chat.messages_unavailable_short')}</p>}

        <div className="space-y-7">
          {allMessages.map((message) => {
            const mine = message.sender.id === currentUser?.id || message.mine;
            return (
              <MessageBubble key={message.id} message={message} mine={mine} />
            );
          })}
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-200 bg-white px-8 py-6">
        <div className="flex items-center gap-4">
          <button type="button" className="rounded-full p-2 text-slate-800 transition-colors hover:bg-slate-100" aria-label={t('chat.attach')}>
            <Paperclip className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-full p-2 text-slate-800 transition-colors hover:bg-slate-100" aria-label={t('chat.emoji')}>
            <Smile className="h-5 w-5" />
          </button>
          <textarea
            className="min-h-14 flex-1 resize-none rounded-full border-0 bg-slate-100 px-7 py-4 text-[16px] leading-6 text-slate-900 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-slate-200"
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
          <Button
            disabled={!draft.trim() || send.isPending}
            onClick={() => send.mutate()}
            className="h-14 w-14 rounded-full bg-black p-0 text-white shadow-lg hover:bg-slate-900"
            aria-label={t('post.post')}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">{t('chat.enter_hint')}</p>
      </footer>
    </section>
  );
}

function MessageBubble({ message, mine }: { message: MessageDto; mine: boolean }) {
  return (
    <div className={mine ? 'flex justify-end' : 'flex justify-start'}>
      <div className={clsx('flex max-w-[76%] items-end gap-3', mine && 'flex-row-reverse')}>
        {!mine && <Avatar user={message.sender} size="sm" />}
        <div>
          <div
            className={clsx(
              'rounded-2xl px-5 py-4 text-[16px] leading-7 shadow-sm',
              mine
                ? 'rounded-br-sm bg-black text-white'
                : 'rounded-bl-sm bg-slate-200 text-slate-950',
            )}
          >
            <p className="whitespace-pre-wrap">{message.deleted ? '' : message.content}</p>
            {message.attachmentUrl && (
              <a href={message.attachmentUrl} className={mine ? 'mt-2 block text-sm underline text-white' : 'mt-2 block text-sm underline text-slate-800'} target="_blank" rel="noreferrer">
                Attachment
              </a>
            )}
          </div>
          <p className={clsx('mt-1 text-xs text-slate-500', mine ? 'text-right' : 'text-left')}>
            {formatMessageTime(message.createdAt)}
            {mine && <span className="ml-1">✓</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

function conversationPeer(conversation: ConversationDto, currentUser: UserDto | null) {
  return conversation.group
    ? conversation.members[0]
    : conversation.members.find((member) => member.id !== currentUser?.id) ?? conversation.members[0];
}

function formatMessageTime(value?: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
