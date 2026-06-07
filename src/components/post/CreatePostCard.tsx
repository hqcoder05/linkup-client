import { ImagePlus, Send, Video, X } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/posts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/stores/authStore';

export function CreatePostCard() {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const mutation = useMutation({
    mutationFn: async () => {
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;
      if (file) {
        const media = await postsApi.uploadImage(file);
        if (file.type.startsWith('video/')) videoUrl = media.url;
        else imageUrl = media.url;
      }
      return postsApi.create({ caption, imageUrl, videoUrl });
    },
    onSuccess: () => {
      setCaption('');
      setFile(null);
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      void queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
    },
  });

  return (
    <Card className="rounded-lg p-8 shadow-sm">
      <div className="flex gap-7">
        <Avatar user={user} size="lg" />
        <textarea
          className="min-h-24 flex-1 resize-none border-0 bg-transparent pt-3 text-[19px] leading-7 text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Share an update with your network..."
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
      </div>
      {file && (
        <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600 sm:ml-[76px]">
          <span className="truncate">{file.name}</span>
          <button onClick={() => setFile(null)} aria-label="Remove file">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:ml-[76px]">
        <div className="flex flex-wrap items-center gap-8">
          <label className="inline-flex cursor-pointer items-center gap-3 text-[17px] font-medium text-slate-900 transition-colors hover:text-slate-600">
            <ImagePlus className="h-5 w-5" />
            Add image
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-3 text-[17px] font-medium text-slate-900 transition-colors hover:text-slate-600">
            <Video className="h-5 w-5" />
            Video
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
          className="h-11 rounded-[14px] bg-black px-8 text-[17px] font-semibold text-white hover:bg-slate-800"
        >
          Post <Send className="h-5 w-5" />
        </Button>
      </div>
      {mutation.isError && <p className="mt-2 text-sm text-red-600">Could not create post.</p>}
    </Card>
  );
}
