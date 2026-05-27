import { Link } from 'react-router-dom';
import { BriefcaseBusiness, MessageSquare, Newspaper, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';

export function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Professional networking</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold text-slate-950 sm:text-5xl">
          LinkUp helps people share work, discover peers, and keep the conversation moving.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          A modern React version of the original social flow: feed, profiles, connections, notifications, and realtime chat.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={user ? '/feed' : '/register'}>
            <Button>{user ? 'Open feed' : 'Join LinkUp'}</Button>
          </Link>
          <Link to={user ? '/connections' : '/login'} className="btn-secondary">
            {user ? 'Find people' : 'Login'}
          </Link>
        </div>
      </section>
      <Card className="p-4">
        <div className="grid gap-3">
          {[
            { icon: Newspaper, title: 'Feed', text: 'Create posts, add media, react, and comment.' },
            { icon: Search, title: 'Connections', text: 'Search users and manage requests.' },
            { icon: BriefcaseBusiness, title: 'Profiles', text: 'Show headline, bio, location, website, and resumes.' },
            { icon: MessageSquare, title: 'Messages', text: 'Two-pane chat with STOMP realtime delivery.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 rounded-lg border border-slate-200 p-3">
              <item.icon className="h-5 w-5 text-brand-600" />
              <div>
                <h2 className="font-semibold text-slate-900">{item.title}</h2>
                <p className="text-sm text-slate-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
