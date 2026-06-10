import { Search, UserRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { profileApi } from '@/api/profile';
import { postsApi } from '@/api/posts';
import { Avatar } from '@/components/common/Avatar';
import { EmptyState } from '@/components/common/EmptyState';
import { PostCard } from '@/components/post/PostCard';
import { Card } from '@/components/ui/Card';
import { displayName } from '@/utils/format';

export function SearchPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const keyword = params.get('keyword') ?? '';
  const tab = params.get('tab') ?? 'posts';

  const posts = useQuery({
    queryKey: ['posts', 'search', keyword],
    queryFn: () => postsApi.search(keyword, 0, 20),
    enabled: keyword.trim().length > 0 && tab === 'posts',
    retry: false,
  });
  const people = useQuery({
    queryKey: ['user-search', keyword],
    queryFn: () => profileApi.searchUsers(keyword),
    enabled: keyword.trim().length > 0 && tab === 'people',
    retry: false,
  });

  const setTab = (nextTab: string) => setParams({ keyword, tab: nextTab });

  return (
    <div className="mx-auto max-w-[720px] space-y-5">
      <Card className="p-4">
        <h1 className="text-2xl font-bold text-slate-950">{t('search.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{keyword ? t('search.results_for', { keyword }) : t('search.empty_query')}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className={tab === 'posts' ? 'rounded-full bg-black px-4 py-2 text-sm font-semibold text-white' : 'rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700'}
            onClick={() => setTab('posts')}
          >
            {t('search.posts')}
          </button>
          <button
            type="button"
            className={tab === 'people' ? 'rounded-full bg-black px-4 py-2 text-sm font-semibold text-white' : 'rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700'}
            onClick={() => setTab('people')}
          >
            {t('search.people')}
          </button>
        </div>
      </Card>

      {tab === 'posts' && posts.data?.map((post) => <PostCard key={post.id} post={post} />)}
      {tab === 'posts' && posts.data?.length === 0 && (
        <EmptyState icon={<Search className="h-10 w-10" />} title={t('search.no_posts')} text="" />
      )}

      {tab === 'people' && (
        <Card className="divide-y divide-slate-100 overflow-hidden">
          {people.data?.map((user) => (
            <Link key={user.id} to={`/profile/${user.id}`} className="flex items-center gap-3 p-4 hover:bg-slate-50">
              <Avatar user={user} size="md" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{displayName(user)}</p>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
              </div>
            </Link>
          ))}
          {people.data?.length === 0 && (
            <EmptyState icon={<UserRound className="h-10 w-10" />} title={t('search.no_people')} text="" />
          )}
        </Card>
      )}
    </div>
  );
}
