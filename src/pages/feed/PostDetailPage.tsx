import { FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { postsApi } from '@/api/posts';
import { apiStatus } from '@/api/client';
import { EmptyState } from '@/components/common/EmptyState';
import { PostCard } from '@/components/post/PostCard';
import { Card } from '@/components/ui/Card';

export function PostDetailPage() {
  const { t } = useTranslation();
  const { postId = '' } = useParams();
  const id = Number(postId);
  const post = useQuery({
    queryKey: ['posts', id],
    queryFn: () => postsApi.get(id),
    enabled: Number.isFinite(id) && id > 0,
    retry: false,
  });

  const forbidden = apiStatus(post.error) === 403;

  return (
    <div className="mx-auto max-w-[640px] space-y-5">
      {post.isLoading && <Card className="p-5 text-sm text-slate-500">{t('post_detail.loading')}</Card>}
      {post.data && <PostCard post={post.data} />}
      {(post.isError || !Number.isFinite(id) || id <= 0) && (
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title={forbidden ? t('profile.private_content') : t('post_detail.unavailable')}
          text=""
        />
      )}
    </div>
  );
}
