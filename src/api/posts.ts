import { apiClient, unwrap } from '@/api/client';
import type { CommentDto, MediaDto, PostDto, PostMediaRequest } from '@/types/api';

export const postsApi = {
  feed: (page = 0, size = 20) =>
    unwrap<PostDto[]>(apiClient.get('/posts/feed', { params: { page, size } })),
  byUser: (userId: number, page = 0, size = 100) =>
    unwrap<PostDto[]>(apiClient.get(`/users/${userId}/posts`, { params: { page, size } })),
  create: (input: { caption?: string; media?: PostMediaRequest[]; tags?: unknown[] }) =>
    unwrap<PostDto>(apiClient.post('/posts', input)),
  update: (postId: number, input: { caption: string }) =>
    unwrap<PostDto>(apiClient.put(`/posts/${postId}`, input)),
  remove: (postId: number) => unwrap<void>(apiClient.delete(`/posts/${postId}`)),
  like: (postId: number) =>
    unwrap<{ liked: boolean; likesCount: number }>(apiClient.post(`/posts/${postId}/likes`)),
  unlike: (postId: number) =>
    unwrap<{ liked: boolean; likesCount: number }>(apiClient.delete(`/posts/${postId}/likes`)),
  comments: (postId: number) => unwrap<CommentDto[]>(apiClient.get(`/posts/${postId}/comments`)),
  comment: (postId: number, content: string) =>
    unwrap<CommentDto>(apiClient.post(`/posts/${postId}/comments`, { content })),
  uploadImage: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return unwrap<MediaDto>(
      apiClient.post('/media/images', body, { headers: { 'Content-Type': 'multipart/form-data' } }),
    );
  },
};
