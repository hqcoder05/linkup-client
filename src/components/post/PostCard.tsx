import { Bookmark, Heart, MessageCircle, MoreHorizontal, Pencil, Send, Share2, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { postsApi } from '@/api/posts';
import type { PostDto } from '@/types/api';
import { displayName, formatDateTime } from '@/utils/format';
import { useAuthStore } from '@/stores/authStore';

export function PostCard({ post }: { post: PostDto }) {
  const { t } = useTranslation();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [editingPost, setEditingPost] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(post.caption ?? '');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [saved, setSaved] = useState(Boolean(post.savedByCurrentUser));
  const [showOptions, setShowMenu] = useState(false);
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

  const save = useMutation({
    mutationFn: () => (saved ? postsApi.unsave(post.id) : postsApi.save(post.id)),
    onMutate: () => setSaved((value) => !value),
    onError: () => setSaved((value) => !value),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts', 'saved'] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
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

  const updatePost = useMutation({
    mutationFn: () => postsApi.update(post.id, { caption: captionDraft.trim() }),
    onSuccess: () => {
      setEditingPost(false);
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      void queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
    },
  });

  const updateComment = useMutation({
    mutationFn: () => postsApi.updateComment(editingCommentId!, commentDraft.trim()),
    onSuccess: () => {
      setEditingCommentId(null);
      setCommentDraft('');
      void queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: postsApi.deleteComment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const primaryMedia = post.media?.[0];

  return (
    <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:bg-slate-900/80 dark:ring-1 dark:ring-white/5">
      <div className="flex items-center justify-between p-4 pb-3">
        <Link to={`/profile/${post.user.id}`} className="group flex items-center gap-3">
          <div className="relative">
            <Avatar user={post.user} size="lg" />
            <div className="absolute inset-0 rounded-full ring-2 ring-transparent transition-all group-hover:ring-blue-500/30" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
              {displayName(post.user)}
            </h2>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {formatDateTime(post.createdAt)}
            </p>
          </div>
        </Link>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showOptions)}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            aria-label="Post options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              {mine ? (
                <>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => {
                      setCaptionDraft(post.caption ?? '');
                      setEditingPost(true);
                      setShowMenu(false);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> {t('post.edit_post')}
                  </button>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      remove.mutate();
                      setShowMenu(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> {t('post.delete_post')}
                  </button>
                </>
              ) : (
                <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                  <Bookmark className="h-4 w-4" /> {t('post.save')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-1">
        {editingPost ? (
          <div className="space-y-3 pb-3">
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-all"
              value={captionDraft}
              onChange={(event) => setCaptionDraft(event.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingPost(false)} className="rounded-full px-5 text-xs font-bold uppercase tracking-wider">
                {t('common.cancel')}
              </Button>
              <Button disabled={updatePost.isPending} onClick={() => updatePost.mutate()} className="rounded-full px-6 bg-blue-600 text-xs font-bold uppercase tracking-wider">
                {t('common.save')}
              </Button>
            </div>
          </div>
        ) : (
          post.caption && (
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-slate-700 dark:text-slate-300">
              {post.caption}
            </p>
          )
        )}
      </div>

      {primaryMedia && (
        <div className="mt-3 overflow-hidden border-y border-slate-50 dark:border-slate-800/50">
          {primaryMedia.type?.startsWith('video') ? (
            <div className="relative bg-black flex justify-center">
              <video 
                src={primaryMedia.url} 
                className="w-full max-h-[720px] object-contain" 
                controls 
              />
            </div>
          ) : (
            <img 
              src={primaryMedia.url} 
              alt="Post content" 
              className="h-auto w-full max-h-[720px] object-contain bg-slate-50 dark:bg-slate-900" 
              loading="lazy"
            />
          )}
        </div>
      )}

      {post.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3">
          {post.hashtags.map((tag) => (
            <Link 
              key={tag} 
              to={`/hashtags/${encodeURIComponent(tag)}`} 
              className="text-[12px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center gap-1">
          <button
            className={`group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all hover:bg-red-50 dark:hover:bg-red-900/10 ${
              post.likedByCurrentUser ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'
            }`}
            onClick={() => like.mutate()}
          >
            <Heart 
              className={`h-[18px] w-[18px] transition-transform group-active:scale-125 ${post.likedByCurrentUser ? 'fill-current' : ''}`} 
            />
            <span>{post.likesCount || ''}</span>
          </button>
          
          <button 
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setCommentsOpen(!commentsOpen)}
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span>{post.commentsCount || ''}</span>
          </button>

          <button className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        </div>

        <button 
          className={`rounded-full p-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
            saved ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'
          }`} 
          onClick={() => save.mutate()} 
          aria-label={t('post.save')}
        >
          <Bookmark className={`h-[18px] w-[18px] ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {commentsOpen && (
        <div className="border-t border-slate-50 bg-slate-50/30 p-4 dark:border-slate-800/50 dark:bg-slate-900/30">
          <div className="space-y-4">
            {comments.data?.map((item) => (
              <div key={item.id} className="flex gap-3">
                <Avatar user={item.user} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-white/5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                        {displayName(item.user)}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    
                    {editingCommentId === item.id ? (
                      <div className="mt-2 space-y-2">
                        <input
                          className="w-full rounded-lg border-none bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-blue-500 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
                          value={commentDraft}
                          onChange={(event) => setCommentDraft(event.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button className="text-[11px] font-bold uppercase tracking-tight text-slate-500" onClick={() => setEditingCommentId(null)}>
                            {t('common.cancel')}
                          </button>
                          <button
                            className="text-[11px] font-bold uppercase tracking-tight text-blue-600"
                            disabled={!commentDraft.trim() || updateComment.isPending}
                            onClick={() => updateComment.mutate()}
                          >
                            {t('common.save')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">{item.content}</p>
                    )}
                  </div>
                  
                  {item.user.id === currentUser?.id && editingCommentId !== item.id && (
                    <div className="ml-2 mt-1 flex gap-4">
                      <button
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => {
                          setEditingCommentId(item.id);
                          setCommentDraft(item.content);
                        }}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors"
                        onClick={() => deleteComment.mutate(item.id)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {comments.isLoading && <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />}
            {comments.data?.length === 0 && !comments.isLoading && (
              <p className="text-center py-2 text-xs font-medium text-slate-400 italic">
                {t('post.no_comments')}
              </p>
            )}
          </div>
          
          <div className="mt-5 flex items-center gap-3">
            <Avatar user={currentUser} size="sm" />
            <div className="relative flex-1">
              <input
                className="w-full rounded-full border-none bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-950 dark:text-slate-100 dark:ring-white/10"
                placeholder={t('post.write_comment')}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && comment.trim()) addComment.mutate();
                }}
              />
              <button 
                disabled={!comment.trim() || addComment.isPending} 
                onClick={() => addComment.mutate()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-blue-600 hover:bg-blue-50 disabled:text-slate-300 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
