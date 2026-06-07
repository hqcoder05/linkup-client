import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Rss, Users, UserCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const heroImgRef = useRef<HTMLImageElement>(null);

  // Hiệu ứng Parallax cho ảnh khi scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroImgRef.current) {
        const scrollPos = window.scrollY;
        heroImgRef.current.style.transform = `translateY(${scrollPos * 0.05}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Rss, title: 'Feed', text: 'Stay updated with curated industry insights and professional updates.' },
    { icon: Users, title: 'Connections', text: 'Build your high-value network with industry leading professionals.' },
    { icon: UserCircle, title: 'Profiles', text: 'Showcase your career milestones in a clean, minimalist portfolio.' },
    { icon: MessageSquare, title: 'Messages', text: 'Communicate securely with real-time encrypted professional chat.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* TopNavBar */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tight text-slate-950">LinkUp</span>
            <div className="hidden items-center gap-6 md:flex">
              <Link to="/feed" className="border-b-2 border-blue-600 pb-1 text-sm font-medium text-slate-950 transition-transform active:scale-95">
                Feed
              </Link>
              <Link to="/connections" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950 active:scale-95">
                Connections
              </Link>
              <Link to="/network" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950 active:scale-95">
                Network
              </Link>
              <Link to="/messages" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950 active:scale-95">
                Messages
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 active:scale-95">
                  Login
                </Link>
                <Link to="/register" className="cursor-pointer rounded-full bg-slate-950 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95">
                  Register
                </Link>
              </>
            ) : (
              <Link to="/profile" className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 active:scale-95">
                <UserCircle className="h-5 w-5" />
                <span>My Account</span>
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="pb-16 pt-32">
        <div className="mx-auto max-w-7xl px-6">
          {/* Hero Section */}
          <div className="grid min-h-[60vh] grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left: Content */}
            <div className="space-y-6 pr-0 lg:col-span-7 lg:pr-12">
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">
                LinkUp helps people share work, discover peers, and keep the conversation moving.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
                A modern React version of the original social flow: feed, profiles, connections, notifications, and realtime chat.
              </p>
              <div className="pt-4">
                <Link to={user ? '/feed' : '/register'} className="group inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/30">
                  {user ? 'Open feed' : 'Join LinkUp'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right: Feature Grid (Bento Style) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-5">
              {features.map((item, index) => (
                <div key={item.title} className={`group rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:shadow-lg ${index % 2 !== 0 ? 'sm:mt-8' : ''}`}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 transition-transform group-hover:scale-110">
                    <item.icon className="h-6 w-6 text-blue-600" strokeWidth={2} />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contextual Dashboard Preview */}
          <section className="relative mt-24 overflow-hidden rounded-xl border border-slate-200 shadow-2xl">
            <img
              ref={heroImgRef}
              alt="LinkUp Platform Interface"
              className="w-full object-cover grayscale-[20%] transition-all duration-700 hover:grayscale-0"
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
          </section>

          {/* Metrics / Trust Section */}
          <section className="mt-24 grid grid-cols-2 gap-8 border-t border-slate-200 pt-16 md:grid-cols-4">
            {[
              { value: '500k+', label: 'Active Users' },
              { value: '2.4M', label: 'Connections' },
              { value: '120+', label: 'Industries' },
              { value: '99.9%', label: 'Uptime' },
            ].map((metric) => (
              <div key={metric.label} className="text-center">
                <span className="block text-4xl font-bold text-slate-950">{metric.value}</span>
                <span className="mt-1 block text-sm font-semibold uppercase tracking-widest text-slate-500">{metric.label}</span>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="text-xl font-bold text-slate-950">LinkUp</span>
            <span className="text-sm text-slate-500">© 2024 LinkUp Professional Network. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="#" className="text-sm text-slate-500 transition-all duration-200 hover:text-slate-950">Privacy Policy</Link>
            <Link to="#" className="text-sm text-slate-500 transition-all duration-200 hover:text-slate-950">Terms of Service</Link>
            <Link to="#" className="text-sm text-slate-500 transition-all duration-200 hover:text-slate-950">Cookie Policy</Link>
            <Link to="#" className="text-sm text-slate-500 transition-all duration-200 hover:text-slate-950">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}