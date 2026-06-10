import { ImagePlus, Send, Video, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { postsApi } from '@/api/posts';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import type { PostMediaRequest } from '@/types/api';

export function CreatePostCard() {
  const { t } = useTranslation();
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const mutation = useMutation({
    mutationFn: async () => {
      const mediaItems: PostMediaRequest[] = [];
      const uploadedMediaIds: number[] = [];

      if (file) {
        const media = file.type.startsWith('video/') ? await postsApi.uploadVideo(file) : await postsApi.uploadImage(file);
        uploadedMediaIds.push(media.id);
        try {
          mediaItems.push({
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
            type: media.type || 'image',
            width: null,
            height: null,
          });
          return await postsApi.create({ caption, media: mediaItems });
        } catch (error) {
          await Promise.allSettled(uploadedMediaIds.map((id) => postsApi.deleteMedia(id)));
          throw error;
        }
      }

      return postsApi.create({ caption, media: mediaItems });
    },
    onSuccess: () => {
      setCaption('');
      setFile(null);
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      void queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
    },
  });

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <Card className="overflow-hidden border-none p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-slate-900/80 dark:ring-1 dark:ring-white/5">
      <div className="flex gap-4">
        <Avatar user={user} size="lg" />
        <div className="min-w-0 flex-1">
          <textarea
            className="w-full resize-none border-none bg-transparent pt-2 text-[15px] leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder={t('post.share_update')}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={2}
          />
          
          {file && (
            <div className="group relative mt-4 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="bg-black flex justify-center">
                {file.type.startsWith('video/') ? (
                  <video className="max-h-[520px] w-full object-contain" src={previewUrl} controls muted />
                ) : (
                  <img className="max-h-[520px] w-full object-contain" src={previewUrl} alt={file.name} />
                )}
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur-md transition-all hover:bg-black group-hover:scale-110"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4 dark:border-slate-800/50">
        <div className="flex items-center gap-1">
          <label className="group flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <ImagePlus className="h-5 w-5 text-blue-500 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">{t('post.add_image')}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="group flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <Video className="h-5 w-5 text-purple-500 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">{t('post.video')}</span>
            <input
              type="file"
              className="hidden"
              accept="video/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        
        <Button
          disabled={mutation.isPending || (!caption.trim() && !file)}
          onClick={() => mutation.mutate()}
          className="h-10 rounded-full bg-slate-950 px-6 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-none dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          {mutation.isPending ? t('common.saving') : t('post.post')}
          <Send className="ml-2 h-3.5 w-3.5" />
        </Button>
      </div>

      {mutation.isError && (
        <p className="mt-3 px-2 text-[12px] font-bold text-red-500 italic">
          {t('post.could_not_create')}
        </p>
      )}
    </Card>
  );
}
