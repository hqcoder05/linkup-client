import { apiClient, unwrap } from '@/api/client';
import type { CommentDto, MediaDto, PostDto, PostMediaRequest, TrendingHashtagDto } from '@/types/api';

export const postsApi = {
  feed: (page = 0, size = 20) =>
    unwrap<PostDto[]>(apiClient.get('/posts/feed', { params: { page, size } })),
  explore: (page = 0, size = 20) =>
    unwrap<PostDto[]>(apiClient.get('/posts/explore', { params: { page, size } })),
  get: (postId: number) => unwrap<PostDto>(apiClient.get(`/posts/${postId}`)),
  byUser: (userId: number, page = 0, size = 100) =>
    unwrap<PostDto[]>(apiClient.get(`/users/${userId}/posts`, { params: { page, size } })),
  saved: (page = 0, size = 20) =>
    unwrap<PostDto[]>(apiClient.get('/posts/saved', { params: { page, size } })),
  search: (keyword: string, page = 0, size = 20) =>
    unwrap<PostDto[]>(apiClient.get('/posts/search', { params: { keyword, page, size } })),
  byHashtag: (name: string, page = 0, size = 20) =>
    unwrap<PostDto[]>(apiClient.get(`/hashtags/${encodeURIComponent(name)}/posts`, { params: { page, size } })),
  create: (input: { caption?: string; media?: PostMediaRequest[]; tags?: unknown[] }) =>
    unwrap<PostDto>(apiClient.post('/posts', input)),
  update: (postId: number, input: { caption: string }) =>
    unwrap<PostDto>(apiClient.put(`/posts/${postId}`, input)),
  remove: (postId: number) => unwrap<void>(apiClient.delete(`/posts/${postId}`)),
  like: (postId: number) =>
    unwrap<{ liked: boolean; likesCount: number }>(apiClient.post(`/posts/${postId}/likes`)),
  unlike: (postId: number) =>
    unwrap<{ liked: boolean; likesCount: number }>(apiClient.delete(`/posts/${postId}/likes`)),
  save: (postId: number) => unwrap<void>(apiClient.post(`/posts/${postId}/save`)),
  unsave: (postId: number) => unwrap<void>(apiClient.delete(`/posts/${postId}/save`)),
  comments: (postId: number) => unwrap<CommentDto[]>(apiClient.get(`/posts/${postId}/comments`)),
  comment: (postId: number, content: string) =>
    unwrap<CommentDto>(apiClient.post(`/posts/${postId}/comments`, { content })),
  updateComment: (commentId: number, content: string) =>
    unwrap<CommentDto>(apiClient.put(`/comments/${commentId}`, { content })),
  deleteComment: (commentId: number) => unwrap<void>(apiClient.delete(`/comments/${commentId}`)),
  trendingHashtags: (limit = 10) =>
    unwrap<TrendingHashtagDto[]>(apiClient.get('/hashtags/trending', { params: { limit } })),
  deleteMedia: (mediaId: number) => unwrap<void>(apiClient.delete(`/media/${mediaId}`)),
  uploadVideo: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return unwrap<MediaDto>(
      apiClient.post('/media/videos', body, { headers: { 'Content-Type': 'multipart/form-data' } }),
    );
  },
  uploadImage: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return unwrap<MediaDto>(
      apiClient.post('/media/images', body, { headers: { 'Content-Type': 'multipart/form-data' } }),
    );
  },
};

