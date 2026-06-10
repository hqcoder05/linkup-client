import { Check, Search, Sparkles, UserCheck, UserPlus, UsersRound, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { followApi } from '@/api/follow';
import { profileApi } from '@/api/profile';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import type { FollowDto, SuggestionDto, UserDto } from '@/types/api';
import { displayName } from '@/utils/format';

export function ConnectionsPage() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const searchTerm = keyword.trim();

  const users = useQuery({
    queryKey: ['user-search', searchTerm],
    queryFn: () => profileApi.searchUsers(searchTerm),
    enabled: searchTerm.length > 0,
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
  const suggestions = useQuery({
    queryKey: ['user-suggestions'],
    queryFn: () => profileApi.suggestions(8),
    enabled: Boolean(currentUser),
    retry: false,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['followers'] });
    void queryClient.invalidateQueries({ queryKey: ['following'] });
    void queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
    void queryClient.invalidateQueries({ queryKey: ['user-search'] });
    void queryClient.invalidateQueries({ queryKey: ['user-suggestions'] });
  };

  const follow = useMutation({ mutationFn: followApi.followUser, onSuccess: refresh });
  const unfollow = useMutation({ mutationFn: followApi.unfollowUser, onSuccess: refresh });
  const approve = useMutation({ mutationFn: followApi.approveFollow, onSuccess: refresh });
  const decline = useMutation({ mutationFn: followApi.declineFollow, onSuccess: refresh });

  const followingIds = useMemo(() => new Set((following.data ?? []).map((user) => user.id)), [following.data]);
  const isCurrentUser = (user: UserDto) =>
    user.id === currentUser?.id || user.email?.toLowerCase() === currentUser?.email?.toLowerCase();
  const searchResults = (users.data ?? []).filter((user) => !isCurrentUser(user));
  const suggestedUsers = (suggestions.data ?? []).filter((item) => !isCurrentUser(item.user));

  const relation = (id: number) => {
    if (id === currentUser?.id) return 'me';
    if (followingIds.has(id)) return 'following';
    return 'none';
  };

  const actionProps = {
    relation,
    follow: (id: number) => follow.mutate(id),
    unfollow: (id: number) => unfollow.mutate(id),
    pending: follow.isPending || unfollow.isPending,
  };

  return (
    <div className="mx-auto max-w-[1180px] space-y-6 px-4 py-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  {t('connections.network_label')}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  {t('connections.find_people')}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {t('connections.find_people_body')}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2 text-center">
                <Metric value={followers.data?.length ?? 0} label={t('common.followers')} />
                <Metric value={following.data?.length ?? 0} label={t('common.following')} />
                <Metric value={requests.data?.length ?? 0} label={t('connections.requests_short')} />
              </div>
            </div>

            <label className="mt-6 flex h-14 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-500 transition focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100">
              <Search className="h-5 w-5 text-slate-500" />
              <input
                className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={t('connections.search_placeholder')}
              />
            </label>
          </div>

          <div className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-950">
                {searchTerm ? t('connections.search_results') : t('connections.suggestions')}
              </h2>
              {searchTerm && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {t('connections.result_count', { count: searchResults.length })}
                </span>
              )}
            </div>

            {searchTerm ? (
              <PeopleList
                users={searchResults}
                loading={users.isLoading}
                emptyText={t('search.no_people')}
                actionProps={actionProps}
              />
            ) : (
              <SuggestionList
                suggestions={suggestedUsers}
                loading={suggestions.isLoading}
                actionProps={actionProps}
              />
            )}
          </div>
        </Card>

        <aside className="space-y-5">
          <RequestsCard
            requests={requests.data ?? []}
            approve={(id) => approve.mutate(id)}
            decline={(id) => decline.mutate(id)}
            pending={approve.isPending || decline.isPending}
          />
          <MiniPeopleCard
            title={t('common.followers')}
            people={followers.data ?? []}
            empty={t('connections.no_followers')}
            to="/connections/followers"
          />
          <MiniPeopleCard
            title={t('common.following')}
            people={following.data ?? []}
            empty={t('connections.empty_following')}
            to="/connections/following"
          />
        </aside>
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[82px] rounded-lg bg-white px-3 py-2 shadow-sm">
      <div className="text-lg font-bold text-slate-950">{value}</div>
      <div className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{label}</div>
    </div>
  );
}

function PeopleList({
  users,
  loading,
  emptyText,
  actionProps,
}: {
  users: UserDto[];
  loading: boolean;
  emptyText: string;
  actionProps: PersonActionProps;
}) {
  const { t } = useTranslation();
  if (loading) return <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{t('connections.loading_people')}</div>;
  if (users.length === 0) return <EmptyPeopleState text={emptyText} />;
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
      {users.map((user) => (
        <PersonRow key={user.id} user={user} actionProps={actionProps} />
      ))}
    </div>
  );
}

function SuggestionList({
  suggestions,
  loading,
  actionProps,
}: {
  suggestions: SuggestionDto[];
  loading: boolean;
  actionProps: PersonActionProps;
}) {
  const { t } = useTranslation();
  if (loading) return <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{t('connections.loading_people')}</div>;
  if (suggestions.length === 0) return <EmptyPeopleState text={t('connections.no_suggestions')} />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {suggestions.map((suggestion) => (
        <PersonCard key={suggestion.user.id} suggestion={suggestion} actionProps={actionProps} />
      ))}
    </div>
  );
}

type PersonActionProps = {
  relation: (id: number) => 'me' | 'following' | 'none';
  follow: (id: number) => void;
  unfollow: (id: number) => void;
  pending: boolean;
};

function PersonRow({ user, actionProps }: { user: UserDto; actionProps: PersonActionProps }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-50">
      <PersonIdentity user={user} />
      <PersonAction user={user} {...actionProps} />
    </div>
  );
}

function PersonCard({ suggestion, actionProps }: { suggestion: SuggestionDto; actionProps: PersonActionProps }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 transition hover:border-slate-200 hover:shadow-sm">
      <PersonIdentity user={suggestion.user} />
      <p className="mt-3 min-h-5 truncate text-xs font-medium text-slate-500">
        {suggestion.mutualCount > 0
          ? t('connections.mutuals', { count: suggestion.mutualCount })
          : t('connections.suggested_reason')}
      </p>
      <div className="mt-4">
        <PersonAction user={suggestion.user} wide {...actionProps} />
      </div>
    </div>
  );
}

function PersonIdentity({ user }: { user: UserDto }) {
  return (
    <Link to={`/profile/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar user={user} size="lg" />
      <span className="min-w-0">
        <span className="block truncate font-bold text-slate-950">{displayName(user)}</span>
        <span className="mt-0.5 block truncate text-sm text-slate-500">{user.email}</span>
      </span>
    </Link>
  );
}

function PersonAction({
  user,
  relation,
  follow,
  unfollow,
  pending,
  wide,
}: PersonActionProps & { user: UserDto; wide?: boolean }) {
  const { t } = useTranslation();
  const state = relation(user.id);
  if (state === 'me') {
    return (
      <Button variant="secondary" disabled className={wide ? 'w-full' : undefined}>
        {t('common.profile')}
      </Button>
    );
  }
  if (state === 'following') {
    return (
      <Button variant="secondary" disabled={pending} onClick={() => unfollow(user.id)} className={wide ? 'w-full' : undefined}>
        <UserCheck className="h-4 w-4" />
        {t('common.following')}
      </Button>
    );
  }
  return (
    <Button disabled={pending} onClick={() => follow(user.id)} className={wide ? 'w-full' : undefined}>
      <UserPlus className="h-4 w-4" />
      {t('common.follow')}
    </Button>
  );
}

function RequestsCard({
  requests,
  approve,
  decline,
  pending,
}: {
  requests: FollowDto[];
  approve: (id: number) => void;
  decline: (id: number) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Card className="rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-950">{t('connections.follow_requests')}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{requests.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {requests.map((request) => (
          <div key={request.follower.id} className="rounded-xl border border-slate-100 p-3">
            <PersonIdentity user={request.follower} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button className="px-3" onClick={() => approve(request.follower.id)} disabled={pending}>
                <Check className="h-4 w-4" />
                {t('connections.approve')}
              </Button>
              <Button className="px-3" variant="secondary" onClick={() => decline(request.follower.id)} disabled={pending}>
                <X className="h-4 w-4" />
                {t('connections.decline')}
              </Button>
            </div>
          </div>
        ))}
        {requests.length === 0 && <p className="text-sm leading-6 text-slate-500">{t('connections.no_pending')}</p>}
      </div>
    </Card>
  );
}

function MiniPeopleCard({
  title,
  people,
  empty,
  to,
}: {
  title: string;
  people: UserDto[];
  empty: string;
  to: string;
}) {
  const { t } = useTranslation();
  return (
    <Card className="rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-950">{title}</h2>
        <Link to={to} className="text-xs font-bold text-slate-600 hover:text-slate-950">
          {t('common.see_all')}
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {people.slice(0, 4).map((user) => (
          <Link key={user.id} to={`/profile/${user.id}`} className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-slate-50">
            <Avatar user={user} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900">{displayName(user)}</span>
              <span className="block truncate text-xs text-slate-500">{user.email}</span>
            </span>
          </Link>
        ))}
        {people.length === 0 && <p className="text-sm leading-6 text-slate-500">{empty}</p>}
      </div>
    </Card>
  );
}

function EmptyPeopleState({ text }: { text: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
        <UsersRound className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{text}</p>
      <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
        <Sparkles className="h-3.5 w-3.5" />
        LinkUp
      </p>
    </div>
  );
}
