import { Heart, MoreHorizontal, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storiesApi } from '@/api/stories';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/ui/Card';
import { displayName, formatDateTime } from '@/utils/format';
import type { StoryDto } from '@/types/api';

export function StoryDetailPage() {
  const { storyId } = useParams();
  const id = Number(storyId);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  const story = useQuery({
    queryKey: ['stories', id],
    queryFn: () => storiesApi.get(id),
    enabled: Number.isFinite(id),
    retry: false,
  });

  useEffect(() => {
    if (story.data?.id) void storiesApi.seen(story.data.id);
  }, [story.data?.id]);

  useEffect(() => {
    if (!story.data) return;
    const duration = story.data.media[0]?.type === 'video' ? 15000 : 5000;
    const interval = 100;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          navigate('/feed');
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [story.data, navigate]);

  if (story.isLoading) return <Card className="mx-auto max-w-md p-5 text-sm text-slate-500">Loading story...</Card>;
  if (!story.data) return <Card className="mx-auto max-w-md p-5 text-sm text-slate-500">Story unavailable.</Card>;

  const media = story.data.media[0];
  const backgroundUrl = media?.thumbnailUrl ?? media?.url;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-neutral-950 text-white select-none">
      {backgroundUrl && (
        <img
          src={backgroundUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-3xl"
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),rgba(0,0,0,0.82)_62%)]" />

      <div className="relative z-10 flex h-full w-full max-w-[430px] items-center justify-center px-4 py-8">
        <div className="relative aspect-[9/16] max-h-[86vh] w-full overflow-hidden rounded-[1.35rem] border border-white/10 bg-black shadow-2xl">
          <div className="absolute left-0 right-0 top-0 z-20 bg-gradient-to-b from-black/75 via-black/20 to-transparent p-4 pb-12">
            <div className="mb-4 flex gap-1.5">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="rounded-full border border-white/40 p-0.5">
                  <Avatar user={story.data.user} size="sm" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{displayName(story.data.user)}</p>
                  <p className="text-[10px] font-medium text-white/60">{formatDateTime(story.data.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button type="button" className="rounded-full p-2 text-white/90 hover:bg-white/10 transition-colors" aria-label="More">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                <Link to="/feed" className="rounded-full p-2 text-white/90 hover:bg-white/10 transition-colors" aria-label="Close">
                  <X className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          <StoryMedia story={story.data} />

          {story.data.caption && (
            <div className="absolute bottom-24 left-4 right-4 z-20 rounded-2xl bg-black/40 px-4 py-3 text-[13px] leading-relaxed text-white shadow-xl backdrop-blur-md border border-white/10">
              {story.data.caption}
            </div>
          )}

          <div className="absolute bottom-5 left-4 right-4 z-30 flex items-center gap-3">
            <div className="relative flex-1">
              <input
                className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none backdrop-blur-lg placeholder:text-white/50 focus:border-white/40 focus:bg-white/15 transition-all"
                placeholder={t('stories.send_reply')}
              />
            </div>
            <button type="button" className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-lg transition-all hover:bg-white/20 active:scale-90" aria-label="Like story">
              <Heart className="h-5 w-5 transition-transform group-hover:scale-110" />
            </button>
            <button type="button" className="group flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-500 active:scale-90" aria-label="Send story reply">
              <Send className="h-4.5 w-4.5 -rotate-12 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryMedia({ story }: { story: StoryDto }) {
  const media = story.media[0];

  if (!media) {
    return <div className="flex h-full items-center justify-center p-8 text-center text-sm text-white">{story.caption}</div>;
  }

  if (media.type === 'video') {
    return (
      <video
        className="h-full w-full object-contain"
        src={media.url}
        poster={media.thumbnailUrl ?? undefined}
        controls
        autoPlay
      />
    );
  }

  return <img className="h-full w-full object-contain" src={media.url} alt={story.caption ?? 'Story'} />;
}
