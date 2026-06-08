import { Check, Search, UserCheck, UserPlus, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { followApi } from '@/api/follow';
import { profileApi } from '@/api/profile';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { displayName } from '@/utils/format';

export function ConnectionsPage() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  
  const users = useQuery({
    queryKey: ['user-search', keyword],
    queryFn: () => profileApi.searchUsers(keyword),
    enabled: keyword.trim().length > 0,
  });
  const following = useQuery({
    queryKey: ['following', currentUser?.id],
    queryFn: () => followApi.getFollowing(currentUser!.id),
    enabled: Boolean(currentUser),
  });
  const followers = useQuery({
    queryKey: ['followers', currentUser?.id],
    queryFn: () => followApi.getFollowers(currentUser!.id),
    enabled: Boolean(currentUser),
  });
  const requests = useQuery({
    queryKey: ['follow-requests'],
    queryFn: followApi.getPendingRequests,
    enabled: Boolean(currentUser),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['followers'] });
    void queryClient.invalidateQueries({ queryKey: ['following'] });
    void queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
    void queryClient.invalidateQueries({ queryKey: ['user-search'] });
  };
  
  const follow = useMutation({ mutationFn: followApi.followUser, onSuccess: refresh });
  const unfollow = useMutation({ mutationFn: followApi.unfollowUser, onSuccess: refresh });
  const approve = useMutation({ mutationFn: followApi.approveFollow, onSuccess: refresh });
  const decline = useMutation({ mutationFn: followApi.declineFollow, onSuccess: refresh });

  const relation = (id: number) => {
    if (id === currentUser?.id) return 'me';
    if (following.data?.some((user) => user.id === id)) return 'following';
    return 'none';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Main Search Area */}
        <div className="space-y-6">
          <Card className="p-6">
            <h1 className="text-xl font-bold text-slate-900">{t('connections.find_people')}</h1>
            <p className="text-sm text-slate-500 mb-4">{t('connections.find_people_body')}</p>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input 
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" 
                value={keyword} 
                onChange={(e) => setKeyword(e.target.value)} 
                placeholder={t('connections.search_placeholder')}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-bold text-slate-900">{t('connections.search_results')}</h2>
            <div className="grid gap-3">
              {(users.data ?? []).map((user) => {
                const state = relation(user.id);
                return (
                  <div key={user.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                    <Link to={`/profile/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar user={user} size="md" />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">{displayName(user)}</div>
                        <div className="truncate text-xs text-slate-500">{user.email}</div>
                      </div>
                    </Link>
                    {state === 'following' && (
                      <Button variant="secondary" onClick={() => unfollow.mutate(user.id)}>
                        <UserCheck className="h-4 w-4" /> {t('common.following')}
                      </Button>
                    )}
                    {state === 'none' && (
                      <Button onClick={() => follow.mutate(user.id)}>
                        <UserPlus className="h-4 w-4" /> {t('common.follow')}
                      </Button>
                    )}
                  </div>
                );
              })}
              {!keyword && <p className="text-sm text-slate-500 py-4">{t('connections.enter_keyword')}</p>}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold text-slate-900">{t('connections.follow_requests')}</h2>
            <div className="mt-4 space-y-3">
              {(requests.data ?? []).map((request) => (
                <div key={request.follower.id} className="rounded-lg border border-slate-100 p-3">
                  <Link to={`/profile/${request.follower.id}`} className="flex items-center gap-3">
                    <Avatar user={request.follower} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">{displayName(request.follower)}</div>
                      <div className="truncate text-xs text-slate-500">{request.follower.email}</div>
                    </div>
                  </Link>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      className="px-3"
                      onClick={() => approve.mutate(request.follower.id)}
                      disabled={approve.isPending || decline.isPending}
                    >
                      <Check className="h-4 w-4" /> {t('connections.approve')}
                    </Button>
                    <Button
                      className="px-3"
                      variant="secondary"
                      onClick={() => decline.mutate(request.follower.id)}
                      disabled={approve.isPending || decline.isPending}
                    >
                      <X className="h-4 w-4" /> {t('connections.decline')}
                    </Button>
                  </div>
                </div>
              ))}
              {requests.data?.length === 0 && <p className="text-sm text-slate-500">{t('connections.no_pending')}</p>}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-slate-900">{t('common.followers')}</h2>
            <div className="mt-4 space-y-3">
              {(followers.data ?? []).slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{displayName(item)}</span>
                </div>
              ))}
              {followers.data?.length === 0 && <p className="text-sm text-slate-500">{t('connections.no_followers')}</p>}
            </div>
          </Card>
          
          <Card className="p-5">
            <h2 className="font-bold text-slate-900">{t('common.following')}</h2>
            <p className="mt-2 text-sm text-slate-600">{t('connections.people_you_follow', { count: following.data?.length ?? 0 })}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
