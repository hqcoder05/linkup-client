import { Camera, Globe, Lock, MapPin, Pencil, UserCheck, UserPlus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { profileApi } from '@/api/profile';
import type { FollowStatus, ProfileDto, UserDto } from '@/types/api';
import { displayName, formatDate } from '@/utils/format';

type ProfileHeaderProps = {
  profile?: ProfileDto;
  user: UserDto;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isMe?: boolean;
  followStatus?: FollowStatus;
  isFollowPending?: boolean;
  onEdit?: () => void;
  onToggleFollow?: () => void;
};

export function ProfileHeader({
  profile,
  user,
  postsCount,
  followersCount,
  followingCount,
  isMe,
  followStatus = 'NONE',
  isFollowPending,
  onEdit,
  onToggleFollow,
}: ProfileHeaderProps) {
  const queryClient = useQueryClient();
  const avatarMutation = useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });

  const isFollowing = followStatus === 'ACCEPTED';
  const isRequested = followStatus === 'PENDING';

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative self-start">
          <Avatar user={user} size="xl" />
          {isMe && (
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-500 text-white shadow-card">
              <Camera className="h-4 w-4" />
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) avatarMutation.mutate(file);
                }}
              />
            </label>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-950">{displayName(user)}</h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{user.email}</span>
            {isMe ? (
              <Button variant="secondary" onClick={onEdit}>
                <Pencil className="h-4 w-4" /> Edit profile
              </Button>
            ) : (
              <Button
                variant={isFollowing || isRequested ? 'secondary' : 'primary'}
                onClick={onToggleFollow}
                disabled={isFollowPending}
              >
                {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {isFollowing ? 'Following' : isRequested ? 'Requested' : 'Follow'}
              </Button>
            )}
          </div>
          <p className="mt-2 font-medium text-slate-700">{profile?.headline || 'Professional member'}</p>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{profile?.bio || 'No bio added yet.'}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>{postsCount} posts</span>
            <span>{followersCount} followers</span>
            <span>{followingCount} following</span>
            <span>Joined {formatDate(user.createdAt)}</span>
            {user.privateAccount && (
              <span className="inline-flex items-center gap-1">
                <Lock className="h-4 w-4" /> Private
              </span>
            )}
            {profile?.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {profile.location}
              </span>
            )}
            {profile?.websiteUrl && (
              <a className="inline-flex items-center gap-1 text-brand-600" href={profile.websiteUrl}>
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
