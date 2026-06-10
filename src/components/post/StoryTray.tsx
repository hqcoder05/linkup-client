import { Eye, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/ui/Card';
import { postsApi } from '@/api/posts';
import { storiesApi } from '@/api/stories';
import { useAuthStore } from '@/stores/authStore';
import { displayName, formatDateTime } from '@/utils/format';
import type { StoryDto, UserStoriesDto } from '@/types/api';

export function StoryTray() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [activeGroup, setActiveGroup] = useState<UserStoriesDto | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewersOpen, setViewersOpen] = useState(false);

  const stories = useQuery({
    queryKey: ['stories'],
    queryFn: storiesApi.list,
    enabled: Boolean(user),
    retry: false,
  });

  const createStory = useMutation({
    mutationFn: async (file: File) => {
      const media = file.type.startsWith('video/') ? await postsApi.uploadVideo(file) : await postsApi.uploadImage(file);
      return storiesApi.create({
        media: [
          {
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
            type: media.type,
          },
        ],
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  const seenStory = useMutation({ mutationFn: storiesApi.seen });
  const activeStory = activeGroup?.stories[activeIndex];
  const activeStoryId = activeStory?.id;
  const isOwner = activeStory?.user.id === user?.id;
  const viewers = useQuery({
    queryKey: ['stories', activeStoryId, 'viewers'],
    queryFn: () => storiesApi.viewers(activeStoryId!),
    enabled: Boolean(activeStoryId && isOwner && viewersOpen),
    retry: false,
  });
  const deleteStory = useMutation({
    mutationFn: storiesApi.remove,
    onSuccess: () => {
      closeViewer();
      void queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  useEffect(() => {
    if (activeStoryId) {
      seenStory.mutate(activeStoryId);
    }
  }, [activeStoryId, seenStory]);

  const closeViewer = () => {
    setActiveGroup(null);
    setActiveIndex(0);
    setViewersOpen(false);
    void queryClient.invalidateQueries({ queryKey: ['stories'] });
  };

  return (
    <>
      <Card className="rounded-lg px-3 py-2 shadow-sm">
        <div className="flex gap-3 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <label className="flex w-[68px] shrink-0 cursor-pointer flex-col items-center gap-1.5 text-center">
            <span className="relative rounded-full bg-slate-200 p-0.5">
              <span className="block rounded-full bg-white p-0.5">
                <Avatar user={user} size="lg" />
              </span>
              <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white">
                <Plus className="h-3.5 w-3.5" />
              </span>
            </span>
            <span className="w-full truncate text-[11px] font-semibold text-slate-700">
              {createStory.isPending ? t('stories.uploading') : t('stories.create')}
            </span>
            <input
              className="hidden"
              type="file"
              accept="image/*,video/*"
              disabled={createStory.isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) createStory.mutate(file);
                event.target.value = '';
              }}
            />
          </label>

          {stories.data?.map((group) => (
            <button
              key={group.user.id}
              type="button"
              className="flex w-[68px] shrink-0 flex-col items-center gap-1.5 text-center"
              onClick={() => {
                setActiveGroup(group);
                setActiveIndex(0);
              }}
              >
                <span
                  className={
                    group.hasUnseen
                      ? 'rounded-full bg-gradient-to-tr from-fuchsia-600 via-red-500 to-amber-400 p-0.5'
                      : 'rounded-full bg-slate-200 p-0.5'
                  }
                >
                <span className="block rounded-full bg-white p-0.5">
                  <Avatar user={group.user} size="lg" />
                </span>
              </span>
              <span className="w-full truncate text-[11px] font-semibold text-slate-700">{displayName(group.user)}</span>
            </button>
          ))}

          {stories.isLoading && <p className="self-center px-3 text-sm text-slate-500">{t('stories.loading')}</p>}
          {stories.data?.length === 0 && <p className="self-center px-3 text-sm text-slate-500">{t('stories.empty')}</p>}
          {stories.isError && <p className="self-center px-3 text-sm text-slate-500">{t('stories.unavailable')}</p>}
        </div>
      </Card>

      {activeGroup && activeStory && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 px-3 py-4">
          <div className="relative flex h-full max-h-[720px] w-full max-w-[390px] flex-col overflow-hidden rounded-xl bg-slate-950 shadow-2xl">
            <div className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-black/75 to-transparent p-3 text-white">
              <div className="mb-3 flex gap-1">
                {activeGroup.stories.map((story, index) => (
                  <span key={story.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/35">
                    <span
                      className={
                        index < activeIndex
                          ? 'block h-full w-full bg-white'
                          : index === activeIndex
                            ? 'block h-full w-1/2 bg-white'
                            : 'block h-full w-0 bg-white'
                      }
                    />
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar user={activeGroup.user} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{displayName(activeGroup.user)}</p>
                    <p className="text-[11px] text-white/70">{formatDateTime(activeStory.createdAt)}</p>
                  </div>
                </div>
                <button type="button" className="rounded-full p-1.5 hover:bg-white/10" onClick={closeViewer}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <StoryMedia story={activeStory} />

            {activeStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-sm text-white">
                {activeStory.caption}
              </div>
            )}

            {isOwner && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-black/60"
                  onClick={() => setViewersOpen((value) => !value)}
                >
                  <Eye className="h-4 w-4" />
                  {t('stories.viewers')}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-red-600"
                  disabled={deleteStory.isPending}
                  onClick={() => deleteStory.mutate(activeStory.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  {t('common.delete')}
                </button>
              </div>
            )}

            {viewersOpen && isOwner && (
              <div className="absolute bottom-14 left-3 right-3 max-h-52 overflow-y-auto rounded-xl bg-white p-3 shadow-2xl">
                <h3 className="text-sm font-bold text-slate-950">{t('stories.viewers')}</h3>
                <div className="mt-2 space-y-2">
                  {viewers.data?.map((view) => (
                    <div key={`${view.user.id}-${view.viewedAt}`} className="flex items-center gap-2">
                      <Avatar user={view.user} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{displayName(view.user)}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(view.viewedAt)}</p>
                      </div>
                    </div>
                  ))}
                  {viewers.data?.length === 0 && <p className="text-sm text-slate-500">{t('stories.no_viewers')}</p>}
                </div>
              </div>
            )}

            {activeIndex > 0 && (
              <button
                type="button"
                className="absolute left-0 top-20 h-[calc(100%-10rem)] w-1/3"
                aria-label="Previous story"
                onClick={() => setActiveIndex((value) => Math.max(0, value - 1))}
              />
            )}
            {activeIndex < activeGroup.stories.length - 1 && (
              <button
                type="button"
                className="absolute right-0 top-20 h-[calc(100%-10rem)] w-1/3"
                aria-label="Next story"
                onClick={() => setActiveIndex((value) => Math.min(activeGroup.stories.length - 1, value + 1))}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function StoryMedia({ story }: { story: StoryDto }) {
  const media = story.media[0];

  if (!media) {
    return <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-white">{story.caption}</div>;
  }

  if (media.type === 'video') {
    return <video className="h-full w-full object-contain" src={media.url} poster={media.thumbnailUrl ?? undefined} controls autoPlay />;
  }

  return <img className="h-full w-full object-contain" src={media.url} alt={story.caption ?? 'Story'} />;
}
