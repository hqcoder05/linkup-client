import { ImagePlus, Minus, Paperclip, Phone, Send, Video, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { chatApi } from '@/api/chat';
import { postsApi } from '@/api/posts';
import { createChatClient, subscribeToConversation } from '@/websocket/chatSocket';
import type { ConversationDto, MessageDto, UserDto } from '@/types/api';
import { isMessageMine } from '@/utils/chat';
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
  const [notice, setNotice] = useState('');
  const [liveMessages, setLiveMessages] = useState<MessageDto[]>([]);
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [allMessages.length, conversation.id]);

  const showUnsupportedCall = () => {
    setNotice(t('chat.call_unavailable'));
    window.setTimeout(() => setNotice(''), 3500);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative">
            <Avatar user={other} size="sm" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-950">{title}</h2>
            <p className="text-[11px] text-emerald-600">{t('chat.available')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-700">
          <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" onClick={showUnsupportedCall} aria-label={t('chat.call')}>
            <Phone className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" onClick={showUnsupportedCall} aria-label={t('chat.video_call')}>
            <Video className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" aria-label="Minimize chat">
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" onClick={onClose} aria-label="Close chat">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {notice && (
        <div className="border-b border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {notice}
        </div>
      )}

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4">
        {messages.isLoading && <p className="text-center text-sm text-slate-500">{t('chat.loading_messages')}</p>}
        {messages.isError && <p className="text-center text-sm text-slate-500">{t('chat.messages_unavailable_short')}</p>}
        {allMessages.map((message) => {
          const mine = isMessageMine(message, currentUser);
          return <PopupMessage key={message.id} message={message} mine={mine} />;
        })}
      </div>

      {selectedFile && (
        <div className="border-t border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700">
            <span className="truncate">{selectedFile.name}</span>
            <button type="button" className="rounded-full p-1 hover:bg-slate-200" onClick={() => setSelectedFile(null)}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer rounded-full p-2 text-slate-700 hover:bg-slate-100" title={t('post.add_image')}>
            <ImagePlus className="h-4 w-4" />
            <input className="hidden" type="file" accept="image/*" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
          </label>
          <label className="cursor-pointer rounded-full p-2 text-slate-700 hover:bg-slate-100" title={t('post.video')}>
            <Paperclip className="h-4 w-4" />
            <input className="hidden" type="file" accept="video/*" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
          </label>
          <textarea
            className="min-h-11 flex-1 resize-none rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
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
            className="h-11 w-11 rounded-full bg-black p-0 text-white hover:bg-slate-900"
            disabled={(!draft.trim() && !selectedFile) || send.isPending}
            onClick={() => send.mutate()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {send.isError && <p className="mt-2 text-xs text-red-600">{t('chat.could_not_send')}</p>}
      </div>
    </div>
  );
}

function PopupMessage({ message, mine }: { message: MessageDto; mine: boolean }) {
  return (
    <div className={mine ? 'flex justify-end' : 'flex justify-start'}>
      <div className={clsx('max-w-[78%]', mine ? 'items-end' : 'items-start')}>
        <div
          className={clsx(
            'overflow-hidden rounded-2xl text-sm shadow-sm',
            mine ? 'rounded-br-sm bg-black text-white' : 'rounded-bl-sm bg-white text-slate-900 ring-1 ring-slate-200',
          )}
        >
          {message.attachmentUrl && <AttachmentPreview url={message.attachmentUrl} mine={mine} />}
          {message.content && <p className="whitespace-pre-wrap px-3 py-2">{message.content}</p>}
        </div>
      </div>
    </div>
  );
}

function AttachmentPreview({ url, mine }: { url: string; mine: boolean }) {
  const video = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
  if (video) {
    return <video className="max-h-48 w-full object-cover" src={url} controls />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img className={clsx('max-h-48 w-full object-cover', mine ? 'bg-black' : 'bg-white')} src={url} alt="Attachment" />
    </a>
  );
}
