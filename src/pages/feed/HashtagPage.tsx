import { Hash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { postsApi } from '@/api/posts';
import { EmptyState } from '@/components/common/EmptyState';
import { PostCard } from '@/components/post/PostCard';
import { Card } from '@/components/ui/Card';

export function HashtagPage() {
  const { t } = useTranslation();
  const { name = '' } = useParams();
  const posts = useQuery({
    queryKey: ['hashtags', name, 'posts'],
    queryFn: () => postsApi.byHashtag(name, 0, 20),
    enabled: Boolean(name),
    retry: false,
  });

  return (
    <div className="mx-auto max-w-[640px] space-y-5">
      <Card className="p-4">
        <h1 className="text-2xl font-bold text-slate-950">#{name}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('hashtag.subtitle')}</p>
      </Card>
      {posts.isLoading && <Card className="p-5 text-sm text-slate-500">{t('hashtag.loading')}</Card>}
      {posts.data?.map((post) => <PostCard key={post.id} post={post} />)}
      {posts.data?.length === 0 && (
        <EmptyState icon={<Hash className="h-10 w-10" />} title={t('hashtag.empty')} text="" />
      )}
    </div>
  );
}
