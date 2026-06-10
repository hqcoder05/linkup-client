import { Bell, Bookmark, Compass, Newspaper, Settings, UserRoundPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { postsApi } from '@/api/posts';
import { CreatePostCard } from '@/components/post/CreatePostCard';
import { PostCard } from '@/components/post/PostCard';
import { StoryTray } from '@/components/post/StoryTray';
import { Card } from '@/components/ui/Card';
import { ContactSidebar } from '@/components/layout/ContactSidebar';

const feedTools = [
  { to: '/feed', labelKey: 'navbar.feed', icon: Newspaper },
  { to: '/explore', labelKey: 'explore.title', icon: Compass },
  { to: '/connections', labelKey: 'feed.find_people', icon: UserRoundPlus },
  { to: '/saved', labelKey: 'saved.title', icon: Bookmark },
  { to: '/notifications', labelKey: 'common.notifications', icon: Bell },
  { to: '/settings', labelKey: 'common.settings', icon: Settings },
];

export function FeedPage() {
  const { t } = useTranslation();
  const feed = useQuery({ queryKey: ['feed'], queryFn: () => postsApi.feed(0, 20) });
  const trending = useQuery({
    queryKey: ['hashtags', 'trending'],
    queryFn: () => postsApi.trendingHashtags(8),
    retry: false,
  });

  return (
    <div className="min-h-[calc(100vh-112px)]">
      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,640px)] xl:grid-cols-[220px_minmax(0,640px)_300px]">
        <aside className="hidden space-y-5 lg:block">
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

          <Card className="rounded-lg p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{t('feed.trending')}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {trending.data?.map((tag) => (
                <Link key={tag.name} to={`/hashtags/${encodeURIComponent(tag.name)}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                  #{tag.name}
                </Link>
              ))}
              {trending.data?.length === 0 && <p className="text-sm text-slate-500">{t('feed.no_trending')}</p>}
            </div>
          </Card>
        </aside>

        <section className="space-y-5">
          <StoryTray />
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
          <ContactSidebar embedded floating={false} />
        </aside>
      </div>
      <ContactSidebar desktop={false} />
    </div>
  );
}
