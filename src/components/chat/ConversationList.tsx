import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import type { ConversationDto, UserDto } from '@/types/api';
import { displayName, formatDateTime } from '@/utils/format';

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
  const peer = (conversation: ConversationDto) =>
    conversation.group
      ? null
      : conversation.members.find((member) => member.id !== currentUser?.id) ?? conversation.members[0];

  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 md:w-80">
      <div className="flex items-center justify-between border-b border-slate-200 p-3">
        <h1 className="font-semibold text-slate-900">Messages</h1>
      </div>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="input-field pl-9" placeholder="Search conversations..." />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {conversations.map((conversation) => {
          const other = peer(conversation);
          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={clsx(
                'mb-1 flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-brand-50',
                activeId === conversation.id && 'bg-brand-50 ring-1 ring-brand-200',
              )}
            >
              <Avatar user={other} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900">
                    {conversation.name || displayName(other ?? undefined)}
                  </span>
                  {conversation.lastMessage && (
                    <span className="text-[11px] text-slate-400">{formatDateTime(conversation.lastMessage.createdAt)}</span>
                  )}
                </div>
                <p className="truncate text-xs text-slate-500">{conversation.lastMessage?.content || 'No messages yet'}</p>
              </div>
            </button>
          );
        })}
        {conversations.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No conversations yet.</p>}
      </div>
    </aside>
  );
}
