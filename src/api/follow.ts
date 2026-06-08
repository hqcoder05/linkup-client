import { apiClient, unwrap } from '@/api/client';
import type { FollowDto, FollowStatus, UserDto } from '@/types/api';

export const followApi = {
  followUser: (userId: number) =>
    unwrap<FollowDto>(apiClient.post(`/follows/${userId}`)),
  approveFollow: (followerId: number) =>
    unwrap<FollowDto>(apiClient.post(`/follows/${followerId}/approve`)),
  declineFollow: (followerId: number) =>
    unwrap<void>(apiClient.post(`/follows/${followerId}/decline`)),
  unfollowUser: (userId: number) => unwrap<void>(apiClient.delete(`/follows/${userId}`)),
  getFollowers: (userId: number) => unwrap<UserDto[]>(apiClient.get(`/users/${userId}/followers`)),
  getFollowing: (userId: number) => unwrap<UserDto[]>(apiClient.get(`/users/${userId}/following`)),
  getPendingRequests: () => unwrap<FollowDto[]>(apiClient.get('/follows/requests')),
  getFollowStatus: (userId: number) =>
    unwrap<{ status: FollowStatus }>(apiClient.get(`/users/${userId}/follow-status`)),
};
