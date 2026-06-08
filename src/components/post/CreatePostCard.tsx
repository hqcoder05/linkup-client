import { ImagePlus, Send, Video, X } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { postsApi } from '@/api/posts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/stores/authStore';

export function CreatePostCard() {
  const { t } = useTranslation();
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const mutation = useMutation({
    mutationFn: async () => {
      const mediaItems = [];
      if (file) {
        const media = await postsApi.uploadImage(file);
        mediaItems.push({
          url: media.url,
          thumbnailUrl: media.thumbnailUrl,
          type: media.type || 'image',
          width: null,
          height: null,
        });
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

  return (
    <Card className="rounded-lg p-4 shadow-sm">
      <div className="flex gap-3">
        <Avatar user={user} size="md" />
        <textarea
          className="min-h-20 flex-1 resize-none border-0 bg-transparent pt-2 text-base leading-6 text-slate-900 outline-none placeholder:text-slate-400"
          placeholder={t('post.share_update')}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
      </div>
      {file && (
        <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600 sm:ml-12">
          <span className="truncate">{file.name}</span>
          <button onClick={() => setFile(null)} aria-label="Remove file">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 sm:ml-12">
        <div className="flex flex-wrap items-center gap-5">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950">
            <ImagePlus className="h-5 w-5" />
            {t('post.add_image')}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950">
            <Video className="h-5 w-5" />
            {t('post.video')}
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
          className="h-10 rounded-lg bg-black px-5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {t('post.post')} <Send className="h-4 w-4" />
        </Button>
      </div>
      {mutation.isError && <p className="mt-2 text-sm text-red-600">{t('post.could_not_create')}</p>}
    </Card>
  );
}
