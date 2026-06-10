import { ChevronLeft, ChevronRight, Heart, MoreHorizontal, Plus, Send, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiMessage } from '@/api/client';
import { postsApi } from '@/api/posts';
import { storiesApi } from '@/api/stories';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { displayName, formatDateTime } from '@/utils/format';
import type { StoryDto, StoryViewDto, UserStoriesDto } from '@/types/api';

export function StoryTray() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [activeGroup, setActiveGroup] = useState<UserStoriesDto | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyCaption, setStoryCaption] = useState('');

  const stories = useQuery({
    queryKey: ['stories'],
    queryFn: storiesApi.list,
    enabled: Boolean(user),
    retry: false,
  });

  const createStory = useMutation({
    mutationFn: async () => {
      const uploadedMediaIds: number[] = [];
      try {
        const media = storyFile
          ? storyFile.type.startsWith('video/')
            ? await postsApi.uploadVideo(storyFile)
            : await postsApi.uploadImage(storyFile)
          : null;
        if (media) uploadedMediaIds.push(media.id);
        return await storiesApi.create({
          caption: storyCaption.trim() || undefined,
          media: media
            ? [
                {
                  url: media.url,
                  thumbnailUrl: media.thumbnailUrl,
                  type: media.type,
                  width: null,
                  height: null,
                },
              ]
            : [],
        });
      } catch (error) {
        await Promise.allSettled(uploadedMediaIds.map((id) => postsApi.deleteMedia(id)));
        throw error;
      }
    },
    onSuccess: () => {
      setStoryFile(null);
      setStoryCaption('');
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

  const handleNextGroup = () => {
    if (!stories.data || !activeGroup) return;
    const currentIndex = stories.data.findIndex((g) => g.user.id === activeGroup.user.id);
    if (currentIndex < stories.data.length - 1) {
      setActiveGroup(stories.data[currentIndex + 1]);
      setActiveIndex(0);
    } else {
      closeViewer();
    }
  };

  const handlePrevGroup = () => {
    if (!stories.data || !activeGroup) return;
    const currentIndex = stories.data.findIndex((g) => g.user.id === activeGroup.user.id);
    if (currentIndex > 0) {
      setActiveGroup(stories.data[currentIndex - 1]);
      setActiveIndex(stories.data[currentIndex - 1].stories.length - 1);
    }
  };

  return (
    <>
      <Card className="rounded-2xl px-3 py-2 shadow-sm dark:bg-black dark:border-white/10">
        <div className="flex gap-3 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <label className="flex w-[68px] shrink-0 cursor-pointer flex-col items-center gap-1.5 text-center">
            <span className="relative rounded-full bg-slate-200 p-0.5 dark:bg-neutral-800">
              <span className="block rounded-full bg-white p-0.5 dark:bg-black">
                <Avatar user={user} size="lg" />
              </span>
              <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white dark:border-black">
                <Plus className="h-3.5 w-3.5" />
              </span>
            </span>
            <span className="w-full truncate text-[11px] font-semibold text-slate-700 dark:text-slate-400">
              {createStory.isPending ? t('stories.uploading') : t('stories.create')}
            </span>
            <input
              className="hidden"
              type="file"
              accept="image/*,video/*"
              disabled={createStory.isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setStoryFile(file);
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
                    : 'rounded-full bg-slate-200 p-0.5 dark:bg-neutral-800'
                }
              >
                <span className="block rounded-full bg-white p-0.5 dark:bg-black">
                  <Avatar user={group.user} size="lg" />
                </span>
              </span>
              <span className="w-full truncate text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {displayName(group.user)}
              </span>
            </button>
          ))}

          {stories.isLoading && <p className="self-center px-3 text-sm text-slate-500 dark:text-slate-500 italic">{t('stories.loading')}</p>}
          {stories.data?.length === 0 && <p className="self-center px-3 text-sm text-slate-500 dark:text-slate-500 italic">{t('stories.empty')}</p>}
        </div>
      </Card>

      {storyFile && (
        <CreateStoryModal
          file={storyFile}
          caption={storyCaption}
          onCaptionChange={setStoryCaption}
          onClose={() => {
            setStoryFile(null);
            setStoryCaption('');
          }}
          onSubmit={() => createStory.mutate()}
          pending={createStory.isPending}
          error={createStory.error}
        />
      )}

      {activeGroup && activeStory && (
        <StoryViewer
          group={activeGroup}
          story={activeStory}
          activeIndex={activeIndex}
          isOwner={Boolean(isOwner)}
          viewers={viewers.data ?? []}
          viewersOpen={viewersOpen}
          onClose={closeViewer}
          onPrev={() => {
            if (activeIndex > 0) {
              setActiveIndex(activeIndex - 1);
            } else {
              handlePrevGroup();
            }
          }}
          onNext={() => {
            if (activeIndex < activeGroup.stories.length - 1) {
              setActiveIndex(activeIndex + 1);
            } else {
              handleNextGroup();
            }
          }}
          onToggleViewers={() => setViewersOpen((value) => !value)}
          onDelete={() => deleteStory.mutate(activeStory.id)}
          deletePending={deleteStory.isPending}
        />
      )}
    </>
  );
}

function StoryViewer({
  group,
  story,
  activeIndex,
  isOwner,
  viewers,
  viewersOpen,
  onClose,
  onPrev,
  onNext,
  onToggleViewers,
  onDelete,
  deletePending,
}: {
  group: UserStoriesDto;
  story: StoryDto;
  activeIndex: number;
  isOwner: boolean;
  viewers: StoryViewDto[];
  viewersOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleViewers: () => void;
  onDelete: () => void;
  deletePending: boolean;
}) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  
  const isVideo = story.media[0]?.type === 'video';
  const duration = isVideo ? (videoDuration ? videoDuration * 1000 : 15000) : 5000;

  useEffect(() => {
    setProgress(0);
    setShowMenu(false);
    setVideoDuration(null);
  }, [story.id]);

  useEffect(() => {
    if (isPaused || viewersOpen || showMenu) return;

    const interval = 100;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onNext();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [story.id, isPaused, duration, onNext, viewersOpen, showMenu]);

  const media = story.media[0];
  const backgroundUrl = media?.thumbnailUrl ?? media?.url;
  const hashtags = useMemo(() => extractHashtags(story.caption), [story.caption]);

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden bg-black text-white select-none">
      {backgroundUrl && (
        <img
          src={backgroundUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-3xl"
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0),rgba(0,0,0,0.9)_80%)]" />

      <div className="relative z-10 grid h-full grid-cols-1 items-center gap-8 px-5 py-8 lg:grid-cols-[260px_minmax(320px,460px)_320px] xl:grid-cols-[300px_minmax(360px,500px)_360px]">
        <aside className="hidden self-start pt-4 lg:block">
          <div className="text-2xl font-black tracking-tight opacity-40">LinkUp</div>
          <div className="mt-4 h-px w-10 bg-white/10" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.24em] text-white/20">{t('stories.global_label')}</p>
        </aside>

        <div className="relative mx-auto flex w-full max-w-[430px] items-center justify-center">
          <button
            type="button"
            className="absolute -left-16 hidden h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white md:flex"
            aria-label="Previous story"
            onClick={onPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div 
            className="relative aspect-[9/16] max-h-[86vh] w-full overflow-hidden rounded-[2rem] border border-white/5 bg-black shadow-2xl"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div className="absolute left-0 right-0 top-0 z-20 bg-gradient-to-b from-black/60 via-black/20 to-transparent p-5 pb-16">
              <div className="mb-5 flex gap-1">
                {group.stories.map((item, index) => (
                  <div key={item.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-white/80 transition-all duration-100 ease-linear"
                      style={{
                        width: index < activeIndex ? '100%' : index === activeIndex ? `${progress}%` : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-full ring-1 ring-white/10 p-0.5">
                    <Avatar user={group.user} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold tracking-tight">{displayName(group.user)}</p>
                    <p className="text-[9px] font-medium text-white/40">{formatDateTime(story.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isVideo && (
                    <button
                      type="button"
                      className="rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                  )}
                  <div className="relative">
                    <button 
                      type="button" 
                      className="rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition-all" 
                      aria-label="More"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 mt-3 w-44 overflow-hidden rounded-2xl bg-neutral-900/90 border border-white/5 shadow-2xl backdrop-blur-xl z-50">
                        {isOwner && (
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-bold text-red-400/90 hover:bg-white/5 transition-colors border-b border-white/5"
                            onClick={() => {
                              onDelete();
                              setShowMenu(false);
                            }}
                            disabled={deletePending}
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('common.delete')}
                          </button>
                        )}
                        {isOwner && (
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-bold text-white/80 hover:bg-white/5 transition-colors"
                            onClick={() => {
                              onToggleViewers();
                              setShowMenu(false);
                            }}
                          >
                            <Plus className="h-4 w-4 rotate-45" /> {t('stories.viewers')} ({viewers.length})
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <button type="button" className="rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition-all" onClick={onClose} aria-label="Close">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <StoryMedia 
              story={story} 
              isPaused={isPaused || viewersOpen || showMenu} 
              isMuted={isMuted}
              onDurationChange={setVideoDuration} 
            />

            {!isOwner && (
              <div className="absolute bottom-5 left-5 right-5 z-30 flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    className="w-full rounded-full border border-white/5 bg-white/5 px-4 py-2.5 text-xs text-white outline-none backdrop-blur-xl placeholder:text-white/20 focus:bg-white/10 transition-all"
                    placeholder={t('stories.send_reply')}
                    onFocus={() => setIsPaused(true)}
                    onBlur={() => setIsPaused(false)}
                  />
                </div>
                <button type="button" className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/40 backdrop-blur-xl transition-all hover:bg-white/10 hover:text-white" aria-label="Like story">
                  <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
                </button>
                <button type="button" className="group flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg transition-all hover:bg-slate-200 active:scale-95" aria-label="Send story reply">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}

            {isOwner && (
              <div className="absolute bottom-5 left-5 z-30">
                <button
                  type="button"
                  className="group flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/5 backdrop-blur-xl hover:bg-white/10 transition-all active:scale-95"
                  onClick={onToggleViewers}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                    {viewers.length} {t('stories.viewers')}
                  </span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="absolute -right-16 hidden h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white md:flex"
            aria-label="Next story"
            onClick={onNext}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <aside className="hidden space-y-6 self-start pt-3 lg:block">
          <div className="rounded-[2rem] border border-white/5 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{t('stories.story_context')}</p>
            <h2 className="mt-5 text-xl font-black tracking-tight">{displayName(group.user)}</h2>
            <p className="mt-4 text-[13px] leading-relaxed text-white/40 font-medium">
              {formatDateTime(story.createdAt)}
            </p>
            {hashtags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/5 bg-white/5 px-3.5 py-1.5 text-[9px] font-bold text-white/30 tracking-wider">
                    #{tag.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="absolute inset-y-0 left-0 z-20 w-1/4 md:hidden" onClick={onPrev} />
      <div className="absolute inset-y-0 right-0 z-20 w-1/4 md:hidden" onClick={onNext} />

      {viewersOpen && isOwner && (
        <div className="fixed bottom-10 left-1/2 z-[80] max-h-[380px] w-[min(94vw,440px)] -translate-x-1/2 overflow-hidden rounded-[2rem] border border-white/10 bg-black/95 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-white/40">{t('stories.viewers')}</h3>
            <button onClick={onToggleViewers} className="rounded-full p-1 text-white/40 hover:bg-white/5 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-5 space-y-4">
            {viewers.map((view) => (
              <div key={`${view.user.id}-${view.viewedAt}`} className="flex items-center gap-4 group">
                <Avatar user={view.user} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold group-hover:text-blue-400 transition-colors">{displayName(view.user)}</p>
                  <p className="text-[11px] font-medium text-white/30">{formatDateTime(view.viewedAt)}</p>
                </div>
              </div>
            ))}
            {viewers.length === 0 && <p className="text-center py-4 text-xs font-bold text-white/20 italic">{t('stories.no_viewers')}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateStoryModal({
  file,
  caption,
  onCaptionChange,
  onClose,
  onSubmit,
  pending,
  error,
}: {
  file: File;
  caption: string;
  onCaptionChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  pending: boolean;
  error: unknown;
}) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-black border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-black tracking-tight text-white">{t('stories.create')}</h2>
          <button type="button" className="rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white transition-colors" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="relative aspect-[4/5] bg-neutral-900 mx-6 overflow-hidden rounded-2xl border border-white/5">
          {file.type.startsWith('video/') ? (
            <video className="h-full w-full object-contain" src={previewUrl} controls muted />
          ) : (
            <img className="h-full w-full object-contain" src={previewUrl} alt="Story preview" />
          )}
        </div>

        <div className="p-6 space-y-5">
          <textarea
            className="min-h-24 w-full resize-none rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/10 focus:bg-white/10 transition-all placeholder:text-white/20"
            placeholder={t('stories.caption_placeholder')}
            value={caption}
            onChange={(event) => onCaptionChange(event.target.value)}
          />
          
          {Boolean(error) && (
            <p className="text-sm font-bold text-red-500/60 italic">
              {String(apiMessage(error, String(t('stories.could_not_create'))))}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="rounded-full px-6 bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white">
              {t('common.cancel')}
            </Button>
            <Button type="button" disabled={pending} onClick={onSubmit} className="rounded-full px-8 bg-white text-black hover:bg-slate-200">
              {pending ? t('stories.uploading') : t('post.post')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryMedia({ 
  story, 
  isPaused, 
  isMuted,
  onDurationChange 
}: { 
  story: StoryDto; 
  isPaused: boolean;
  isMuted: boolean;
  onDurationChange: (duration: number) => void;
}) {
  const media = story.media[0];
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused]);

  if (!media) {
    return <div className="flex h-full items-center justify-center p-8 text-center text-sm text-white/40 italic">{story.caption}</div>;
  }

  if (media.type === 'video') {
    return (
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        src={media.url}
        poster={media.thumbnailUrl ?? undefined}
        onLoadedMetadata={(e) => onDurationChange(e.currentTarget.duration)}
        autoPlay
        playsInline
        muted={isMuted}
      />
    );
  }

  return <img className="h-full w-full object-contain" src={media.url} alt={story.caption ?? 'Story'} />;
}

function extractHashtags(caption: string | null) {
  if (!caption) return [];
  return Array.from(new Set(Array.from(caption.matchAll(/#([\p{L}\p{N}_]+)/gu)).map((match) => match[1]))).slice(0, 6);
}
