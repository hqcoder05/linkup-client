import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/common/Avatar';
import type { ConversationDto, UserDto } from '@/types/api';
import { displayName } from '@/utils/format';

export function ConversationList({
  conversations,
  currentUser,
  activeId,
  onSelect,
}: {
  conversations: ConversationDto[];
  currentUser: UserDto | null;
  activeId?: number;
  onSelect: (conversation: ConversationDto) => void;
}) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState<'all' | 'groups' | 'archive'>('all');

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (tab === 'groups' && !conversation.group) return false;
      if (tab === 'archive') return false;
      if (!query) return true;
      const name = conversationTitle(conversation, currentUser).toLowerCase();
      const last = conversation.lastMessage?.content?.toLowerCase() ?? '';
      return name.includes(query) || last.includes(query);
    });
  }, [conversations, currentUser, keyword, tab]);

  return (
    <aside className="flex min-h-0 w-full flex-col border-r border-slate-200 bg-white md:w-[430px] md:min-w-[360px]">
      <div className="border-b border-slate-100 px-6 pb-6 pt-7">
        <label className="flex h-14 items-center gap-3 rounded-full bg-slate-100 px-5 text-slate-500">
          <Search className="h-5 w-5 text-slate-800" />
          <input
            className="w-full bg-transparent text-[16px] outline-none placeholder:text-slate-500"
            placeholder={t('chat.search_conversations')}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </label>

        <div className="mt-7 flex items-center gap-6 text-[15px]">
          {[
            ['all', t('chat.all_messages')],
            ['groups', t('chat.groups')],
            ['archive', t('chat.archive')],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id as 'all' | 'groups' | 'archive')}
              className={clsx(
                'border-b-2 pb-2 font-medium transition-colors',
                tab === id
                  ? 'border-black text-black'
                  : 'border-transparent text-slate-600 hover:text-black',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.map((conversation) => {
          const title = conversationTitle(conversation, currentUser);
          const peer = conversationPeer(conversation, currentUser);
          const active = activeId === conversation.id;
          const lastMessage = conversation.lastMessage;
          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelect(conversation)}
              className={clsx(
                'flex w-full items-center gap-4 border-l-4 px-6 py-5 text-left transition-colors',
                active
                  ? 'border-black bg-slate-100'
                  : 'border-transparent bg-white hover:bg-slate-50',
              )}
            >
              <span className="relative shrink-0">
                <Avatar user={peer} size="lg" />
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span className="truncate text-[16px] font-bold text-slate-950">{title}</span>
                  <span className="shrink-0 text-sm text-slate-600">
                    {formatConversationTime(lastMessage?.createdAt ?? conversation.createdAt)}
                  </span>
                </span>
                <span className="mt-1 flex items-center gap-3">
                  <span className={clsx('truncate text-[15px]', lastMessage?.mine ? 'font-semibold text-slate-950' : 'text-slate-600')}>
                    {lastMessage?.mine && lastMessage.content ? `${t('chat.you_sent')} ` : ''}
                    {lastMessage?.content || t('chat.no_messages')}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-black px-1.5 text-xs font-bold text-white">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="px-6 py-8 text-sm text-slate-500">
            {tab === 'archive' ? t('chat.no_archived') : t('feed.no_conversations')}
          </p>
        )}
      </div>
    </aside>
  );
}

function conversationPeer(conversation: ConversationDto, currentUser: UserDto | null) {
  return conversation.group
    ? conversation.members[0]
    : conversation.members.find((member) => member.id !== currentUser?.id) ?? conversation.members[0];
}

function conversationTitle(conversation: ConversationDto, currentUser: UserDto | null) {
  if (conversation.name) return conversation.name;
  if (conversation.group) return conversation.members.map((member) => displayName(member)).join(', ');
  return displayName(conversationPeer(conversation, currentUser));
}

function formatConversationTime(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}
