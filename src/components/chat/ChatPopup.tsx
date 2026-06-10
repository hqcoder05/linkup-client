import { ImagePlus, Phone, Send, Video, X } from 'lucide-react';
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

type ChatPopupProps = {
  conversation: ConversationDto;
  currentUser: UserDto | null;
  onClose: () => void;
};

export function ChatPopup({ conversation, currentUser, onClose }: ChatPopupProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [liveMessages, setLiveMessages] = useState<MessageDto[]>([]);
  const { startCall } = useCalling();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
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
    mutationFn: async () => {
      const content = draft.trim();
      if (!selectedFile) {
        return chatApi.send(conversation.id, { content });
      }
      const media = selectedFile.type.startsWith('video/')
        ? await postsApi.uploadVideo(selectedFile)
        : await postsApi.uploadImage(selectedFile);
      return chatApi.send(conversation.id, {
        content: content || undefined,
        attachmentUrl: media.url,
      });
    },
    onSuccess: () => {
      setDraft('');
      setSelectedFile(null);
      void queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  useEffect(() => {
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
  }, [conversation.id, queryClient]);

  const allMessages = useMemo(() => {
    return mergeMessagesChronologically(messages.data, liveMessages);
  }, [liveMessages, messages.data]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [allMessages.length, conversation.id]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-black shadow-2xl transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative">
            <Avatar user={other} size="sm" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-black bg-emerald-500" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-950 dark:text-white">{title}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">{t('chat.available')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-700 dark:text-white/60">
          <button type="button" className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" onClick={() => startCall(conversation.id, other!, 'audio')} aria-label={t('chat.call')}>
            <Phone className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" onClick={() => startCall(conversation.id, other!, 'video')} aria-label={t('chat.video_call')}>
            <Video className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" onClick={onClose} aria-label="Close chat">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50 dark:bg-black px-4 py-5 [scrollbar-width:thin] dark:scrollbar-color-white/10">
        {messages.isLoading && <p className="text-center text-xs font-bold text-slate-400 italic py-10">{t('chat.loading_messages')}</p>}
        {messages.isError && <p className="text-center text-xs font-bold text-red-400 italic py-10">{t('chat.messages_unavailable_short')}</p>}
        {allMessages.map((message) => {
          const mine = isMessageMine(message, currentUser);
          return <PopupMessage key={message.id} message={message} mine={mine} />;
        })}
      </div>

      {selectedFile && (
        <div className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-100 dark:bg-neutral-900 px-4 py-3 text-xs text-slate-700 dark:text-slate-300">
            <span className="truncate font-bold">{selectedFile.name}</span>
            <button type="button" className="rounded-full p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors" onClick={() => setSelectedFile(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black p-4">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-full p-2 text-slate-700 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title={t('post.add_image')}>
            <ImagePlus className="h-5 w-5" />
            <input className="hidden" type="file" accept="image/*" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
          </label>
          <textarea
            className="min-h-11 flex-1 resize-none rounded-2xl border-none bg-slate-100 dark:bg-neutral-900 px-5 py-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:ring-1 focus:ring-slate-200 dark:focus:ring-white/10 transition-all"
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
            className="h-11 w-11 rounded-2xl bg-black dark:bg-white p-0 text-white dark:text-black shadow-lg hover:bg-slate-900 dark:hover:bg-slate-100 transition-all active:scale-95"
            disabled={(!draft.trim() && !selectedFile) || send.isPending}
            onClick={() => send.mutate()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {send.isError && <p className="mt-3 text-[11px] font-bold text-red-500 italic">{t('chat.could_not_send')}</p>}
      </div>
    </div>
  );
}

function PopupMessage({ message, mine }: { message: MessageDto; mine: boolean }) {
  return (
    <div className={mine ? 'flex justify-end' : 'flex justify-start'}>
      <div className={clsx('max-w-[80%]', mine ? 'items-end' : 'items-start')}>
        <div
          className={clsx(
            'overflow-hidden rounded-2xl text-[14px] leading-relaxed shadow-sm ring-1 ring-black/5 dark:ring-white/5',
            mine ? 'rounded-br-sm bg-slate-950 text-white dark:bg-white dark:text-black' : 'rounded-bl-sm bg-white text-slate-900 dark:bg-neutral-900 dark:text-white',
          )}
        >
          {message.attachmentUrl && <AttachmentPreview url={message.attachmentUrl} mine={mine} />}
          {message.content && <p className="whitespace-pre-wrap px-4 py-2.5">{message.content}</p>}
        </div>
      </div>
    </div>
  );
}

function AttachmentPreview({ url, mine }: { url: string; mine: boolean }) {
  const video = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
  if (video) {
    return <video className="max-h-56 w-full object-cover" src={url} controls />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block relative group/media overflow-hidden">
      <img className={clsx('max-h-56 w-full object-cover transition-transform duration-500 group-hover/media:scale-105', mine ? 'bg-slate-900' : 'bg-slate-100')} src={url} alt="Attachment" />
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover/media:bg-black/10" />
    </a>
  );
}
