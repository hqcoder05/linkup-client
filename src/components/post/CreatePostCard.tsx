import { ImagePlus, Send, X } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/posts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function CreatePostCard() {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

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
    <Card className="p-4">
      <textarea
        className="input-field min-h-24 resize-none"
        placeholder="Share an update with your network..."
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
      />
      {file && (
        <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <span className="truncate">{file.name}</span>
          <button onClick={() => setFile(null)} aria-label="Remove file">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="btn-secondary cursor-pointer">
          <ImagePlus className="h-4 w-4" />
          Add image
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <Button
          disabled={mutation.isPending || (!caption.trim() && !file)}
          onClick={() => mutation.mutate()}
        >
          <Send className="h-4 w-4" /> Post
        </Button>
      </div>
      {mutation.isError && <p className="mt-2 text-sm text-red-600">Could not create post.</p>}
    </Card>
  );
}
