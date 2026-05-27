import { Newspaper } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/api/posts';
import { CreatePostCard } from '@/components/post/CreatePostCard';
import { PostCard } from '@/components/post/PostCard';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/common/Avatar';

export function FeedPage() {
  const user = useAuthStore((state) => state.user);
  const feed = useQuery({ queryKey: ['feed'], queryFn: () => postsApi.feed(0, 20) });

  return (
    <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,680px)_1fr]">
      <aside className="hidden lg:block">
        <Card className="p-4 text-center">
          <Avatar user={user} size="xl" />
          <h2 className="mt-3 font-semibold text-slate-900">{user?.fullName}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </Card>
      </aside>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Feed</h1>
            <p className="text-sm text-slate-500">Updates from your professional network.</p>
          </div>
        </div>
        <CreatePostCard />
        {feed.isLoading && <Card className="p-4 text-sm text-slate-500">Loading feed...</Card>}
        {feed.data?.length === 0 && (
          <Card>
            <EmptyState icon={<Newspaper className="h-10 w-10" />} title="No posts yet" text="Create the first update or connect with more people." />
          </Card>
        )}
        {feed.data?.map((post) => <PostCard key={post.id} post={post} />)}
      </section>
      <aside className="hidden xl:block">
        <Card className="p-4">
          <h2 className="font-semibold text-slate-900">LinkUp tips</h2>
          <p className="mt-2 text-sm text-slate-500">Keep posts concise, add context, and continue conversations in comments or messages.</p>
        </Card>
      </aside>
    </div>
  );
}
