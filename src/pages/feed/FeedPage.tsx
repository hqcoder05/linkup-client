import { Bell, Circle, Newspaper, Search, Settings, UserRoundPlus } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { chatApi } from '@/api/chat';
import { postsApi } from '@/api/posts';
import { CreatePostCard } from '@/components/post/CreatePostCard';
import { PostCard } from '@/components/post/PostCard';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/common/Avatar';
import { ChatPopup } from '@/components/chat/ChatPopup';
import { displayName, formatDateTime } from '@/utils/format';
import type { ConversationDto } from '@/types/api';

const feedTools = [
  { to: '/feed', labelKey: 'navbar.feed', icon: Newspaper },
  { to: '/connections', labelKey: 'feed.find_people', icon: UserRoundPlus },
  { to: '/notifications', labelKey: 'common.notifications', icon: Bell },
  { to: '/settings', labelKey: 'common.settings', icon: Settings },
];

export function FeedPage() {
  const { t } = useTranslation();
  const [activeChat, setActiveChat] = useState<ConversationDto | null>(null);
  const user = useAuthStore((state) => state.user);
  const feed = useQuery({ queryKey: ['feed'], queryFn: () => postsApi.feed(0, 20) });
  const conversations = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.conversations,
    retry: false,
  });
  const peer = (conversation: ConversationDto) =>
    conversation.group
      ? null
      : conversation.members.find((member) => member.id !== user?.id) ?? conversation.members[0];

  return (
    <div className="min-h-[calc(100vh-112px)]">
      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,600px)_320px]">
        <aside className="hidden lg:block">
          <Card className="sticky top-20 rounded-lg p-3 shadow-sm">
            <h2 className="px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{t('feed.tools')}</h2>
            <nav className="space-y-1">
              {feedTools.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                  >
                    <Icon className="h-5 w-5" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </Card>
        </aside>

        <section className="space-y-5">
          <CreatePostCard />
          {feed.isLoading && <Card className="rounded-lg p-5 text-sm text-slate-500">{t('feed.loading_feed')}</Card>}
          {feed.data?.length === 0 && (
            <Card className="rounded-lg px-6 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
                <Newspaper className="h-10 w-10" />
              </div>
              <h1 className="mt-6 text-2xl font-bold leading-tight text-black">{t('feed.no_posts_title')}</h1>
              <p className="mx-auto mt-3 max-w-[420px] text-base leading-7 text-slate-700">
                {t('feed.no_posts_body')}
              </p>
              <Link
                to="/connections"
                className="mt-6 inline-flex h-11 min-w-[210px] items-center justify-center rounded-lg border border-black px-6 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
              >
                {t('feed.find_people_to_follow')}
              </Link>
            </Card>
          )}
          {feed.data?.map((post) => <PostCard key={post.id} post={post} />)}
        </section>

        <aside className="hidden xl:block">
          <Card className="sticky top-20 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-950">{t('feed.contacts')}</h2>
              <Link to="/chat" className="text-xs font-semibold text-slate-500 hover:text-slate-950">
                {t('feed.view_all')}
              </Link>
            </div>
            <div className="mt-3">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500">
                <Search className="h-4 w-4" />
                <input className="w-full bg-transparent text-sm outline-none" placeholder={t('feed.search_messages')} />
              </label>
            </div>
            <div className="mt-4 space-y-1">
              {conversations.data?.slice(0, 6).map((conversation) => {
                const other = peer(conversation);
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveChat(conversation)}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="relative">
                      <Avatar user={other} size="sm" />
                      <span className="absolute bottom-0 right-0 rounded-full bg-white p-0.5">
                        <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900">
                          {conversation.name || displayName(other ?? undefined)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      {conversation.lastMessage && (
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                          {formatDateTime(conversation.lastMessage.createdAt)}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
              {conversations.isLoading && <p className="px-2 py-3 text-sm text-slate-500">{t('feed.loading_conversations')}</p>}
              {conversations.data?.length === 0 && <p className="px-2 py-3 text-sm text-slate-500">{t('feed.no_conversations')}</p>}
              {conversations.isError && (
                <p className="px-2 py-3 text-sm text-slate-500">{t('feed.conversations_unavailable')}</p>
              )}
            </div>
          </Card>
        </aside>
      </div>
      {activeChat && (
        <ChatPopup conversation={activeChat} currentUser={user} onClose={() => setActiveChat(null)} />
      )}
    </div>
  );
}
