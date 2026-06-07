import { CalendarDays, Lightbulb, Newspaper, UserRoundPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { postsApi } from '@/api/posts';
import { CreatePostCard } from '@/components/post/CreatePostCard';
import { PostCard } from '@/components/post/PostCard';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/common/Avatar';
import { displayName } from '@/utils/format';

const suggestedPeople = [
  {
    name: 'Sarah Chen',
    title: 'CTO at TechBridge',
  },
  {
    name: 'Marcus Thorne',
    title: 'Venture Capital Partner',
  },
];

export function FeedPage() {
  const user = useAuthStore((state) => state.user);
  const feed = useQuery({ queryKey: ['feed'], queryFn: () => postsApi.feed(0, 20) });

  return (
    <div className="min-h-[calc(100vh-144px)]">
      <div className="grid gap-8 lg:grid-cols-[326px_minmax(0,684px)] xl:grid-cols-[326px_minmax(0,684px)_326px]">
        <aside className="hidden space-y-8 lg:block">
          <Card className="overflow-hidden rounded-lg text-center shadow-sm">
            <div className="h-20 bg-slate-950" />
            <div className="-mt-12 px-8 pb-5">
              <div className="inline-flex rounded-[14px] bg-white p-1">
                <Avatar user={user} size="xl" />
              </div>
              <h2 className="mt-4 truncate text-[28px] font-bold leading-tight text-black">
                {displayName(user)}
              </h2>
              <p className="truncate text-[17px] text-slate-800">{user?.email}</p>
              <div className="mt-8 space-y-4 border-y border-slate-200 py-7 text-[17px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900">Connections</span>
                  <strong className="font-bold text-black">1,284</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-900">Profile views</span>
                  <strong className="font-bold text-black">342</strong>
                </div>
              </div>
              <Link
                to="/profile/me"
                className="mt-5 inline-flex text-[18px] font-medium text-slate-700 hover:text-black"
              >
                View Full Profile
              </Link>
            </div>
          </Card>

          <Card className="rounded-lg p-8 shadow-sm">
            <h2 className="text-[18px] font-bold text-black">Recent</h2>
            <div className="mt-4 space-y-3 text-[15px] font-medium text-slate-900">
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">#</span>
                <span>#ExecutiveLeadership</span>
              </div>
              <div className="flex items-center gap-3">
                <UserRoundPlus className="h-5 w-5" />
                <span>FinTech Innovations</span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5" />
                <span>GDC 2024 Networking</span>
              </div>
            </div>
          </Card>
        </aside>

        <section className="space-y-8">
          <CreatePostCard />
          {feed.isLoading && <Card className="rounded-lg p-8 text-sm text-slate-500">Loading feed...</Card>}
          {feed.data?.length === 0 && (
            <Card className="rounded-lg px-6 py-16 text-center shadow-sm sm:py-20">
              <div className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
                <Newspaper className="h-14 w-14" />
              </div>
              <h1 className="mt-8 text-[30px] font-bold leading-tight text-black">No posts yet</h1>
              <p className="mx-auto mt-3 max-w-[440px] text-[21px] leading-[1.42] text-slate-800">
                Create the first update or connect with more people to build your professional feed.
              </p>
              <Link
                to="/connections"
                className="mt-8 inline-flex h-12 min-w-[230px] items-center justify-center rounded-[14px] border border-black px-8 text-[18px] font-medium text-black transition-colors hover:bg-black hover:text-white"
              >
                Find Connections
              </Link>
            </Card>
          )}
          {feed.data?.map((post) => <PostCard key={post.id} post={post} />)}
        </section>

        <aside className="hidden space-y-8 xl:block">
          <Card className="rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-black" />
              <h2 className="text-[17px] font-bold uppercase tracking-[0.12em] text-black">
                Professional Tips
              </h2>
            </div>
            <p className="mt-5 text-[21px] leading-[1.55] text-slate-900">
              Keep posts concise, add context, and continue conversations in comments or messages to maximize engagement.
            </p>
          </Card>

          <Card className="rounded-lg p-8 shadow-sm">
            <h2 className="text-[18px] font-bold text-black">Suggested for you</h2>
            <div className="mt-8 space-y-8">
              {suggestedPeople.map((person, index) => (
                <div key={person.name} className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded bg-slate-900 text-sm font-bold text-white">
                      {index === 0 ? 'SC' : 'MT'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[18px] font-bold leading-tight text-black">{person.name}</h3>
                      <p className="text-[15px] leading-tight text-slate-800">{person.title}</p>
                    </div>
                  </div>
                  <button
                    className="shrink-0 rounded-full p-2 text-black transition-colors hover:bg-slate-100"
                    aria-label={`Connect with ${person.name}`}
                  >
                    <UserRoundPlus className="h-6 w-6" />
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-10 w-full text-center text-[18px] font-medium text-slate-700 hover:text-black">
              View more
            </button>
          </Card>
        </aside>
      </div>

      <footer className="-mx-4 mt-52 border-t border-slate-200 px-4 py-9 text-center sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-[786px] flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <span className="text-[31px] font-bold text-black">LinkUp</span>
          {['About', 'Accessibility', 'Help Center', 'Privacy & Terms', 'Ad Choices', 'Advertising'].map((item) => (
            <a key={item} href="#" className="text-[15px] font-medium text-slate-900 hover:text-black">
              {item}
            </a>
          ))}
        </div>
        <p className="mt-12 text-[15px] font-medium text-slate-900">&copy; 2024 LinkUp Executive Network</p>
      </footer>
    </div>
  );
}
