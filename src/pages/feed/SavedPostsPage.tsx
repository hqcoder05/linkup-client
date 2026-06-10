import { Bookmark } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { postsApi } from '@/api/posts';
import { EmptyState } from '@/components/common/EmptyState';
import { PostCard } from '@/components/post/PostCard';
import { Card } from '@/components/ui/Card';

export function SavedPostsPage() {
  const { t } = useTranslation();
  const saved = useQuery({
    queryKey: ['posts', 'saved'],
    queryFn: () => postsApi.saved(0, 20),
    retry: false,
  });

  return (
    <div className="mx-auto max-w-[640px] space-y-5">
      <Card className="p-4">
        <h1 className="text-2xl font-bold text-slate-950">{t('saved.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('saved.subtitle')}</p>
      </Card>
      {saved.isLoading && <Card className="p-5 text-sm text-slate-500">{t('saved.loading')}</Card>}
      {saved.data?.map((post) => <PostCard key={post.id} post={{ ...post, savedByCurrentUser: true }} />)}
      {saved.data?.length === 0 && (
        <EmptyState icon={<Bookmark className="h-10 w-10" />} title={t('saved.empty')} text={t('saved.empty_body')} />
      )}
    </div>
  );
}
