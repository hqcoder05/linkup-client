import { Heart, MessageCircle, MoreVertical, Send, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { postsApi } from '@/api/posts';
import type { PostDto } from '@/types/api';
import { displayName, formatDateTime } from '@/utils/format';
import { useAuthStore } from '@/stores/authStore';

export function PostCard({ post }: { post: PostDto }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const mine = currentUser?.id === post.user.id;

  const comments = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () => postsApi.comments(post.id),
    enabled: commentsOpen,
  });

  const like = useMutation({
    mutationFn: () => (post.likedByCurrentUser ? postsApi.unlike(post.id) : postsApi.like(post.id)),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  const addComment = useMutation({
    mutationFn: () => postsApi.comment(post.id, comment.trim()),
    onSuccess: () => {
      setComment('');
      void queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const remove = useMutation({
    mutationFn: () => postsApi.remove(post.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between p-4">
        <Link to={`/profile/${post.user.id}`} className="flex items-center gap-3">
          <Avatar user={post.user} size="lg" />
          <div>
            <h2 className="font-semibold text-slate-900">{displayName(post.user)}</h2>
            <p className="text-xs text-slate-500">{formatDateTime(post.createdAt)}</p>
          </div>
        </Link>
        {mine && (
          <div className="group relative">
            <button className="btn-ghost px-2" aria-label="Post options">
              <MoreVertical className="h-4 w-4" />
            </button>
            <div className="absolute right-0 hidden w-44 rounded-md border border-slate-200 bg-white p-1 shadow-lift group-focus-within:block group-hover:block">
              <button
                className="btn-ghost w-full justify-start text-red-600"
                onClick={() => remove.mutate()}
              >
                <Trash2 className="h-4 w-4" /> Delete post
              </button>
            </div>
          </div>
        )}
      </div>
      {post.caption && <blockquote className="mx-4 border-l-4 border-brand-500 pl-3 text-slate-700">{post.caption}</blockquote>}
      {post.imageUrl && <img src={post.imageUrl} alt="Post" className="mt-4 max-h-[520px] w-full object-cover" />}
      {post.videoUrl && <video src={post.videoUrl} className="mt-4 max-h-[520px] w-full bg-black object-contain" controls />}
      <div className="mt-3 flex items-center justify-between border-t border-slate-200 px-4 py-2">
        <button
          className={post.likedByCurrentUser ? 'btn-ghost text-red-600' : 'btn-ghost'}
          onClick={() => like.mutate()}
        >
          <Heart className="h-4 w-4" fill={post.likedByCurrentUser ? 'currentColor' : 'none'} />
          Like {post.likesCount}
        </button>
        <button className="btn-ghost" onClick={() => setCommentsOpen((value) => !value)}>
          <MessageCircle className="h-4 w-4" /> Comment {post.commentsCount}
        </button>
      </div>
      {commentsOpen && (
        <div className="border-t border-slate-100 p-4">
          <div className="space-y-3">
            {comments.data?.map((item) => (
              <div key={item.id} className="flex gap-2">
                <Avatar user={item.user} size="sm" />
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <div className="text-sm font-semibold text-slate-900">{displayName(item.user)}</div>
                  <p className="text-sm text-slate-700">{item.content}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(item.createdAt)}</p>
                </div>
              </div>
            ))}
            {comments.data?.length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="input-field"
              placeholder="Write a comment..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && comment.trim()) addComment.mutate();
              }}
            />
            <Button disabled={!comment.trim() || addComment.isPending} onClick={() => addComment.mutate()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
