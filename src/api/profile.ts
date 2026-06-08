import { apiClient, unwrap } from '@/api/client';
import type { MediaDto, ProfileDto, UpdateProfileRequest, UserDto } from '@/types/api';

export const profileApi = {
  mine: () => unwrap<ProfileDto>(apiClient.get('/profiles/me')),
  update: (input: UpdateProfileRequest) => unwrap<ProfileDto>(apiClient.put('/profiles/me', input)),
  user: (id: number) => unwrap<UserDto>(apiClient.get(`/users/${id}`)),
  searchUsers: (keyword: string) =>
    unwrap<UserDto[]>(apiClient.get('/users/search', { params: { keyword } })),
  uploadAvatar: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return unwrap<MediaDto>(
      apiClient.post('/media/avatar', body, { headers: { 'Content-Type': 'multipart/form-data' } }),
    );
  },
};
