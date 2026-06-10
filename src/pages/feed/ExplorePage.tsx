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
        <Card className="p-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
            <Compass className="h-6 w-6" />
            {t('explore.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t('explore.subtitle')}</p>
        </Card>

        {posts.isLoading && <Card className="p-5 text-sm text-slate-500">{t('explore.loading')}</Card>}
        {posts.data?.map((post) => <PostCard key={post.id} post={post} />)}
        {posts.data?.length === 0 && (
          <EmptyState icon={<Compass className="h-10 w-10" />} title={t('explore.empty')} text="" />
        )}
      </section>

      <aside className="hidden lg:block">
        <Card className="sticky top-20 rounded-lg p-4">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            <Hash className="h-4 w-4" />
            {t('feed.trending')}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {trending.data?.map((tag) => (
              <Link
                key={tag.name}
                to={`/hashtags/${encodeURIComponent(tag.name)}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                #{tag.name}
              </Link>
            ))}
            {trending.data?.length === 0 && <p className="text-sm text-slate-500">{t('feed.no_trending')}</p>}
          </div>
        </Card>
      </aside>
    </div>
  );
}
