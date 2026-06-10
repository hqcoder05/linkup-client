import { ImagePlus, Info, Paperclip, Phone, Send, Smile, Video, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { chatApi } from '@/api/chat';
import { postsApi } from '@/api/posts';
import { useCalling } from '@/hooks/useCalling';
import { wsManager } from '@/websocket/wsManager';
import { subscribeToConversation } from '@/websocket/chatSocket';
import type { ConversationDto, MessageDto, UserDto } from '@/types/api';
import { isMessageMine, mergeMessagesChronologically } from '@/utils/chat';
import { displayName } from '@/utils/format';

export function ChatWindow({ conversation, currentUser }: { conversation?: ConversationDto; currentUser: UserDto | null }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [liveMessages, setLiveMessages] = useState<MessageDto[]>([]);
  const { startCall } = useCalling();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => chatApi.messages(conversation!.id),
    enabled: Boolean(conversation),
    retry: false,
  });

  const send = useMutation({
    mutationFn: async () => {
      const content = draft.trim();
      if (!selectedFile) return chatApi.send(conversation!.id, { content });
      const media = selectedFile.type.startsWith('video/')
        ? await postsApi.uploadVideo(selectedFile)
        : await postsApi.uploadImage(selectedFile);
      return chatApi.send(conversation!.id, {
        content: content || undefined,
        attachmentUrl: media.url,
      });
    },
    onSuccess: () => {
      setDraft('');
      setSelectedFile(null);
      void queryClient.invalidateQueries({ queryKey: ['messages', conversation?.id] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  useEffect(() => {
    if (!conversation) return;
    setLiveMessages([]);
    wsManager.activate(() => {
      const client = wsManager.getClient();
      const sub = subscribeToConversation(client, conversation.id, (message) => {
        setLiveMessages((items) => [...items, message]);
        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      });
      void chatApi.read(conversation.id);
      return () => sub.unsubscribe();
    });
  }, [conversation, queryClient]);

  const allMessages = useMemo(() => {
    return mergeMessagesChronologically(messages.data, liveMessages);
  }, [liveMessages, messages.data]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [allMessages.length, conversation?.id]);

  if (!conversation) {
    return (
      <section className="flex flex-1 items-center justify-center bg-slate-50 dark:bg-black p-6 text-center">
        <div>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-neutral-800 text-slate-500">
            <Send className="h-7 w-7" />
          </div>
          <h2 className="font-semibold text-slate-900 dark:text-white">{t('chat.choose_conversation')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('chat.choose_body')}</p>
        </div>
      </section>
    );
  }

  const peer = conversationPeer(conversation, currentUser);
  const title = conversation.name || (conversation.group ? conversation.members.map((member) => displayName(member)).join(', ') : displayName(peer));

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-slate-50 dark:bg-black transition-colors">
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-black px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar user={peer} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
            <p className="text-sm text-emerald-600 dark:text-emerald-500 font-medium">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              {conversation.group
                ? t('chat.member_count', { count: conversation.members.length })
                : t('chat.available')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-slate-900 dark:text-white/80">
          <button 
            type="button" 
            className="rounded-full p-2.5 transition-all hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90" 
            onClick={() => startCall(conversation.id, peer, 'audio')} 
            aria-label={t('chat.call')}
          >
            <Phone className="h-5 w-5" />
          </button>
          <button 
            type="button" 
            className="rounded-full p-2.5 transition-all hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90" 
            onClick={() => startCall(conversation.id, peer, 'video')} 
            aria-label={t('chat.video_call')}
          >
            <Video className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-full p-2.5 transition-all hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90" aria-label={t('chat.conversation_info')}>
            <Info className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-8 py-7 [scrollbar-width:thin] dark:scrollbar-color-white/10">
        <div className="mb-7 flex justify-center">
          <span className="rounded-full bg-slate-200 dark:bg-neutral-800 px-5 py-2 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
            {t('chat.today')}
          </span>
        </div>

        {messages.isLoading && <p className="text-center text-sm text-slate-500">{t('chat.loading_messages')}</p>}
        {messages.isError && <p className="text-center text-sm text-slate-500">{t('chat.messages_unavailable_short')}</p>}

        <div className="space-y-7">
          {allMessages.map((message) => {
            const mine = isMessageMine(message, currentUser);
            return (
              <MessageBubble key={message.id} message={message} mine={mine} />
            );
          })}
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black px-8 py-6">
        {selectedFile && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-100 dark:bg-neutral-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
            <span className="truncate font-bold">{selectedFile.name}</span>
            <button type="button" className="rounded-full p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors" onClick={() => setSelectedFile(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-4">
          <label className="cursor-pointer rounded-full p-2.5 text-slate-800 dark:text-white/60 transition-all hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90" aria-label={t('post.add_image')}>
            <ImagePlus className="h-5.5 w-5.5" />
            <input className="hidden" type="file" accept="image/*" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
          </label>
          <label className="cursor-pointer rounded-full p-2.5 text-slate-800 dark:text-white/60 transition-all hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90" aria-label={t('post.video')}>
            <Paperclip className="h-5.5 w-5.5" />
            <input className="hidden" type="file" accept="video/*" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
          </label>
          <button type="button" className="rounded-full p-2.5 text-slate-800 dark:text-white/60 transition-all hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90" aria-label={t('chat.emoji')}>
            <Smile className="h-5.5 w-5.5" />
          </button>
          <textarea
            className="min-h-14 flex-1 resize-none rounded-2xl border-none bg-slate-100 dark:bg-neutral-900 px-7 py-4 text-[16px] leading-6 text-slate-900 dark:text-white outline-none placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-slate-200 dark:focus:ring-white/5 transition-all"
            rows={1}
            placeholder={t('chat.type_message')}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && (draft.trim() || selectedFile)) {
                event.preventDefault();
                send.mutate();
              }
            }}
          />
          <Button
            disabled={(!draft.trim() && !selectedFile) || send.isPending}
            onClick={() => send.mutate()}
            className="h-14 w-14 rounded-2xl bg-black dark:bg-white p-0 text-white dark:text-black shadow-xl hover:bg-slate-900 dark:hover:bg-slate-100 transition-all active:scale-95"
            aria-label={t('post.post')}
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
        <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">{t('chat.enter_hint')}</p>
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
              'rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm ring-1 ring-black/5 dark:ring-white/5',
              mine
                ? 'rounded-br-sm bg-slate-950 text-white dark:bg-white dark:text-black'
                : 'rounded-bl-sm bg-white text-slate-900 dark:bg-neutral-900 dark:text-white',
            )}
          >
            {message.content && <p className="whitespace-pre-wrap">{message.deleted ? '' : message.content}</p>}
            {message.attachmentUrl && <AttachmentPreview url={message.attachmentUrl} mine={mine} />}
          </div>
          <p className={clsx('mt-1.5 text-[10px] font-black uppercase tracking-tighter text-slate-400 dark:text-slate-600', mine ? 'text-right' : 'text-left')}>
            {formatMessageTime(message.createdAt)}
            {mine && <span className="ml-1 text-blue-500">●</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

function AttachmentPreview({ url, mine }: { url: string; mine: boolean }) {
  const video = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
  if (video) {
    return <video className="mt-3 max-h-80 w-full rounded-xl object-cover" src={url} controls />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block group/media relative overflow-hidden rounded-xl mt-3">
      <img
        className={clsx('max-h-80 w-full object-cover transition-transform duration-500 group-hover/media:scale-105', mine ? 'bg-slate-900' : 'bg-slate-100')}
        src={url}
        alt="Attachment"
      />
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover/media:bg-black/10" />
    </a>
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
