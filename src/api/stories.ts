import { apiClient, unwrap } from '@/api/client';
import type { CreateStoryRequest, StoryDto, StoryViewDto, UserStoriesDto } from '@/types/api';

export const storiesApi = {
  list: () => unwrap<UserStoriesDto[]>(apiClient.get('/stories')),
  get: (storyId: number) => unwrap<StoryDto>(apiClient.get(`/stories/${storyId}`)),
  create: (input: CreateStoryRequest) => unwrap<StoryDto>(apiClient.post('/stories', input)),
  remove: (storyId: number) => unwrap<void>(apiClient.delete(`/stories/${storyId}`)),
  viewers: (storyId: number) => unwrap<StoryViewDto[]>(apiClient.get(`/stories/${storyId}/viewers`)),
  seen: (storyId: number) => unwrap<void>(apiClient.post(`/stories/${storyId}/seen`)),
};
