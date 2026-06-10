import { Compass, Hash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { postsApi } from '@/api/posts';
import { EmptyState } from '@/components/common/EmptyState';
import { PostCard } from '@/components/post/PostCard';
import { Card } from '@/components/ui/Card';

export function ExplorePage() {
  const { t } = useTranslation();
  const posts = useQuery({
    queryKey: ['posts', 'explore'],
    queryFn: () => postsApi.explore(0, 20),
    retry: false,
  });
  const trending = useQuery({
    queryKey: ['hashtags', 'trending', 'explore'],
    queryFn: () => postsApi.trendingHashtags(20),
    retry: false,
  });

  return (
    <div className="mx-auto grid max-w-[980px] items-start gap-5 lg:grid-cols-[minmax(0,640px)_300px]">
      <section className="space-y-5">
        <Card className="p-5 dark:bg-black dark:border-white/10 shadow-sm">
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            <Compass className="h-6 w-6" />
            {t('explore.title')}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{t('explore.subtitle')}</p>
        </Card>

        {posts.isLoading && <Card className="p-10 text-center text-xs font-bold text-slate-400 italic dark:bg-black dark:border-white/10">{t('explore.loading')}</Card>}
        {posts.data?.map((post) => <PostCard key={post.id} post={post} />)}
        {posts.data?.length === 0 && !posts.isLoading && (
          <EmptyState icon={<Compass className="h-10 w-10" />} title={t('explore.empty')} text="" />
        )}
      </section>

      <aside className="hidden lg:block">
        <Card className="sticky top-20 rounded-2xl p-5 dark:bg-black dark:border-white/10 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <Hash className="h-4 w-4" />
            {t('feed.trending')}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {trending.data?.map((tag) => (
              <Link
                key={tag.name}
                to={`/hashtags/${encodeURIComponent(tag.name)}`}
                className="rounded-full bg-slate-100 dark:bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 transition-all"
              >
                #{tag.name}
              </Link>
            ))}
            {trending.data?.length === 0 && <p className="text-xs font-bold text-slate-400 italic py-2">{t('feed.no_trending')}</p>}
          </div>
        </Card>
      </aside>
    </div>
  );
}
