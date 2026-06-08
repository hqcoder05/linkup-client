import { MessageCircle, Heart } from 'lucide-react';
import type { PostDto } from '@/types/api';

export function ProfilePostGrid({ posts }: { posts: PostDto[] }) {
  if (posts.length === 0) {
    return <div className="surface-card p-8 text-center text-sm text-slate-500">No posts to show.</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <article key={post.id} className="group relative aspect-square overflow-hidden bg-slate-900">
          {post.media?.[0]?.type?.startsWith('video') ? (
            <video src={post.media[0].url} className="h-full w-full object-cover" muted />
          ) : post.media?.[0] ? (
            <img src={post.media[0].url} alt="Profile post" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-brand-600 p-3 text-center text-sm font-semibold text-white">
              {post.caption || 'Text update'}
            </div>
          )}
          <div className="absolute inset-0 hidden items-end justify-end gap-3 bg-black/35 p-3 text-sm font-semibold text-white group-hover:flex">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-4 w-4" /> {post.likesCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" /> {post.commentsCount}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
