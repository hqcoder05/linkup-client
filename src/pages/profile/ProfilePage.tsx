import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Image, Link as LinkIcon, Mail, MapPin, MoreHorizontal, Pencil, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { followApi } from '@/api/follow';
import { profileApi } from '@/api/profile';
import { postsApi } from '@/api/posts';
import { Avatar } from '@/components/common/Avatar';
import { CreatePostCard } from '@/components/post/CreatePostCard';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { apiMessage, apiStatus } from '@/api/client';
import { displayName } from '@/utils/format';
import type { ProfileDto, UserDto } from '@/types/api';
import { validateProfileImage } from '@/utils/mediaValidation';

export function ProfilePage({ me = false }: { me?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [uploadError, setUploadError] = useState('');
  const currentUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const userId = me ? currentUser?.id : Number(params.id);
  const queryClient = useQueryClient();

  const myProfile = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.mine, enabled: me, retry: false });
  const publicProfile = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileApi.byUser(userId!),
    enabled: !me && Boolean(userId),
    retry: false,
  });
  const posts = useQuery({
    queryKey: ['profile-posts', userId],
    queryFn: () => postsApi.byUser(userId!),
    enabled: Boolean(userId),
    retry: false,
  });
  const followers = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => followApi.getFollowers(userId!),
    enabled: Boolean(userId),
    retry: false,
  });
  const following = useQuery({
    queryKey: ['following', userId],
    queryFn: () => followApi.getFollowing(userId!),
    enabled: Boolean(userId),
    retry: false,
  });
  const followStatus = useQuery({
    queryKey: ['follow-status', userId],
    queryFn: () => followApi.getFollowStatus(userId!),
    enabled: !me && Boolean(userId) && Boolean(token),
    retry: false,
  });

  const avatarMutation = useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: (media) => {
      if (currentUser) {
        setUser({ ...currentUser, avatarUrl: media.url });
      }
      queryClient.setQueryData<ProfileDto>(['profile', 'me'], (old) =>
        old ? { ...old, user: { ...old.user, avatarUrl: media.url } } : old,
      );
      queryClient.setQueryData<UserDto>(['users', userId], (old) =>
        old ? { ...old, avatarUrl: media.url } : old,
      );
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      void queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });

  const coverMutation = useMutation({
    mutationFn: profileApi.uploadCover,
    onSuccess: (media) => {
      if (currentUser) {
        setUser({ ...currentUser, coverUrl: media.url });
      }
      queryClient.setQueryData<ProfileDto>(['profile', 'me'], (old) =>
        old ? { ...old, user: { ...old.user, coverUrl: media.url } } : old,
      );
      queryClient.setQueryData<UserDto>(['users', userId], (old) =>
        old ? { ...old, coverUrl: media.url } : old,
      );
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      void queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });

  const follow = useMutation({
    mutationFn: async () => {
      const status = followStatus.data?.status ?? 'NONE';
      return status === 'ACCEPTED' || status === 'PENDING'
        ? followApi.unfollowUser(userId!)
        : followApi.followUser(userId!);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      void queryClient.invalidateQueries({ queryKey: ['users', userId] });
      void queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      void queryClient.invalidateQueries({ queryKey: ['following', userId] });
      void queryClient.invalidateQueries({ queryKey: ['follow-status', userId] });
    },
  });

  const profile = me ? myProfile.data : publicProfile.data;
  const user = useMemo(
    () => (me ? myProfile.data?.user ?? currentUser : publicProfile.data?.user),
    [me, myProfile.data, currentUser, publicProfile.data],
  );

  if (!user && (myProfile.isLoading || publicProfile.isLoading)) {
    return <Card className="p-4 text-sm text-slate-500">Loading profile...</Card>;
  }

  if (!user) {
    return (
      <Card className="p-5">
        <h1 className="text-lg font-semibold text-slate-900">{t('profile.unavailable_title')}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {apiMessage(myProfile.error ?? publicProfile.error, t('profile.unavailable_body'))}
        </p>
      </Card>
    );
  }

  const followersCount = profile?.followersCount ?? followers.data?.length ?? 0;
  const followingCount = profile?.followingCount ?? following.data?.length ?? 0;
  const isFollowing = followStatus.data?.status === 'ACCEPTED';
  const isRequested = followStatus.data?.status === 'PENDING';
  const gallery = (posts.data ?? []).flatMap((post) => post.media ?? []).slice(0, 6);
  const tags = Array.from(new Set((posts.data ?? []).flatMap((post) => post.hashtags ?? []))).slice(0, 6);
  const followerPreview = (followers.data ?? []).slice(0, 6);
  const followingPreview = (following.data ?? []).slice(0, 4);
  const postsForbidden = apiStatus(posts.error) === 403;

  return (
    <div className="mx-auto max-w-[1080px] space-y-8">
      <Card className="overflow-hidden rounded-xl border-none shadow-sm">
        <div className="relative group">
          <div className="h-52 bg-slate-900 sm:h-64 overflow-hidden">
            {user.coverUrl ? (
              <img src={user.coverUrl} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            )}
          </div>
          {me && (
            <label className="absolute right-4 bottom-4 flex h-10 px-4 cursor-pointer items-center gap-2 rounded-lg bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 border border-white/10 opacity-0 group-hover:opacity-100">
              <Camera className="h-4 w-4" />
              <span className="text-sm font-semibold">{coverMutation.isPending ? 'Uploading...' : 'Change cover'}</span>
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    const message = validateProfileImage(file);
                    if (message) setUploadError(message);
                    else {
                      setUploadError('');
                      coverMutation.mutate(file);
                    }
                  }
                  event.target.value = '';
                }}
              />
            </label>
          )}
        </div>
        <div className="flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-10">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative -mt-16 shrink-0 rounded-full bg-white p-1 shadow-xl group/avatar">
              <Avatar user={user} size="xl" />
              {me && (
                <label className="absolute inset-1 flex cursor-pointer items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover/avatar:opacity-100">
                  <Camera className="h-6 w-6" />
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        const message = validateProfileImage(file);
                        if (message) setUploadError(message);
                        else {
                          setUploadError('');
                          avatarMutation.mutate(file);
                        }
                      }
                      event.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-3xl font-bold tracking-tight text-slate-950">{displayName(user)}</h1>
              <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-slate-800">
                <span>{followersCount} Followers</span>
                <span>{followingCount} Following</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:pb-1">
            {me ? (
              <Button className="rounded-full bg-black px-6 text-white hover:bg-slate-800" onClick={() => navigate('/settings')}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            ) : (
              <Button
                className="rounded-full bg-black px-7 text-white hover:bg-slate-800"
                disabled={follow.isPending}
                onClick={() => follow.mutate()}
              >
                {isFollowing ? t('common.following') : isRequested ? t('profile.requested') : t('common.follow')}
              </Button>
            )}
            <Link
              to="/chat"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 transition-colors hover:bg-slate-50"
              aria-label="Message"
            >
              <Mail className="h-5 w-5" />
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 transition-colors hover:bg-slate-50"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>
      {(uploadError || avatarMutation.isError || coverMutation.isError) && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {uploadError || apiMessage(avatarMutation.error ?? coverMutation.error, t('post.could_not_create'))}
        </Card>
      )}

      {me && myProfile.isError && (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {t('profile.details_unavailable')}
        </Card>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)_250px]">
        <aside className="space-y-6">
          <Card className="rounded-xl p-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('profile.about')}</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-800">
              {profile?.bio || profile?.headline || t('profile.no_bio')}
            </p>
            <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-700">
              {profile?.location && (
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
              {profile?.websiteUrl && (
                <a className="flex items-center gap-2 hover:text-slate-950" href={profile.websiteUrl}>
                  <LinkIcon className="h-4 w-4" />
                  {profile.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </Card>

          <Card className="rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('profile.gallery')}</h2>
              <span className="text-xs font-semibold text-slate-700">{t('common.see_all')}</span>
            </div>
            {gallery.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {gallery.map((item) => (
                  <div key={item.id} className="aspect-square overflow-hidden rounded-md bg-slate-100">
                    {item.type?.startsWith('video') ? (
                      <video src={item.url} className="h-full w-full object-cover" muted />
                    ) : (
                      <img src={item.url} alt="Gallery item" className="h-full w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex h-28 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <Image className="h-7 w-7" />
              </div>
            )}
          </Card>
        </aside>

        <section className="space-y-6">
          {me && <CreatePostCard />}
          {posts.isLoading && <Card className="p-5 text-sm text-slate-500">{t('profile.loading_posts')}</Card>}
          {postsForbidden && (
            <Card className="rounded-xl p-8 text-center text-sm text-slate-500">
              {t('profile.private_content')}
            </Card>
          )}
          {posts.data?.length === 0 && (
            <Card className="rounded-xl p-8 text-center text-sm text-slate-500">{t('profile.no_posts')}</Card>
          )}
          {!postsForbidden && posts.data?.map((post) => <PostCard key={post.id} post={post} />)}
        </section>

        <aside className="space-y-6">
          <Card className="rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('common.followers')}</h2>
              <Link to="/connections/followers" className="text-xs font-semibold text-slate-700 hover:text-slate-950">
                {t('common.see_all')}
              </Link>
            </div>
            <div className="mt-4 flex -space-x-2">
              {followerPreview.map((item) => (
                <Link key={item.id} to={`/profile/${item.id}`} className="rounded-full bg-white p-0.5">
                  <Avatar user={item} size="md" />
                </Link>
              ))}
              {followerPreview.length === 0 && <p className="text-sm text-slate-500">{t('profile.no_followers')}</p>}
            </div>
          </Card>

          <Card className="rounded-xl p-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('common.following')}</h2>
            <div className="mt-4 space-y-4">
              {followingPreview.map((item) => (
                <Link key={item.id} to={`/profile/${item.id}`} className="flex items-center gap-3">
                  <Avatar user={item} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{displayName(item)}</div>
                    <div className="text-xs text-slate-500">{t('common.following')}</div>
                  </div>
                </Link>
              ))}
              {followingPreview.length === 0 && <p className="text-sm text-slate-500">{t('profile.not_following')}</p>}
            </div>
          </Card>

          {tags.length > 0 && (
            <Card className="rounded-xl p-5">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

