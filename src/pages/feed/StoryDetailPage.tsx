import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { storiesApi } from '@/api/stories';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/ui/Card';
import { displayName, formatDateTime } from '@/utils/format';

export function StoryDetailPage() {
  const { storyId } = useParams();
  const id = Number(storyId);
  const story = useQuery({
    queryKey: ['stories', id],
    queryFn: () => storiesApi.get(id),
    enabled: Number.isFinite(id),
    retry: false,
  });

  useEffect(() => {
    if (story.data?.id) void storiesApi.seen(story.data.id);
  }, [story.data?.id]);

  const media = story.data?.media[0];

  if (story.isLoading) return <Card className="mx-auto max-w-md p-5 text-sm text-slate-500">Loading story...</Card>;
  if (!story.data) return <Card className="mx-auto max-w-md p-5 text-sm text-slate-500">Story unavailable.</Card>;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 px-3 py-4">
      <div className="relative h-full max-h-[720px] w-full max-w-[390px] overflow-hidden rounded-xl bg-slate-950">
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/75 to-transparent p-3 text-white">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar user={story.data.user} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName(story.data.user)}</p>
              <p className="text-[11px] text-white/70">{formatDateTime(story.data.createdAt)}</p>
            </div>
          </div>
          <Link to="/feed" className="rounded-full p-1.5 hover:bg-white/10">
            <X className="h-5 w-5" />
          </Link>
        </div>
        {media?.type === 'video' ? (
          <video className="h-full w-full object-contain" src={media.url} poster={media.thumbnailUrl ?? undefined} controls autoPlay />
        ) : media ? (
          <img className="h-full w-full object-contain" src={media.url} alt={story.data.caption ?? 'Story'} />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center text-white">{story.data.caption}</div>
        )}
      </div>
    </div>
  );
}
