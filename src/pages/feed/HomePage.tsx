import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Rss, Users, UserCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const heroImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroImgRef.current) {
        const scrollPos = window.scrollY;
        heroImgRef.current.style.transform = `translateY(${scrollPos * 0.03}px)`;
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
    <div className="pb-8 font-['Inter',_sans-serif]">
      {/* Hero Section */}
      <div className="grid min-h-[60vh] grid-cols-1 items-center gap-12 pt-8 lg:grid-cols-12">
        {/* Left: Content */}
        <div className="space-y-6 lg:col-span-7 lg:pr-12">
          <h1 className="font-['Plus_Jakarta_Sans',_sans-serif] text-[48px] font-extrabold leading-[1.05] tracking-tight text-[#0f172a] sm:text-[64px]">
            LinkUp helps people share work, discover peers, and keep the conversation moving.
          </h1>
          <p className="max-w-2xl text-[18px] font-medium leading-relaxed text-slate-500">
            A modern React version of the original social flow: feed, profiles, connections, notifications, and realtime chat.
          </p>
          <div className="pt-4">
            <Link to={user ? '/feed' : '/register'} className="group inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-8 py-4 text-[15px] font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/30">
              {user ? 'Open feed' : 'Join LinkUp'}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right: Feature Grid (Bento Style) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-5">
          {features.map((item, index) => (
            <div key={item.title} className={`group rounded-[20px] border border-slate-200/60 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-md ${index % 2 !== 0 ? 'sm:mt-8' : ''}`}>
              <div className="mb-5 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#eff6ff] transition-transform group-hover:scale-110">
                <item.icon className="h-[22px] w-[22px] text-[#2563EB]" strokeWidth={2} />
              </div>
              <h3 className="mb-2 font-['Plus_Jakarta_Sans',_sans-serif] text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="text-[14px] leading-relaxed text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contextual Dashboard Preview */}
      <section className="relative mt-28 overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]">
        <img
          ref={heroImgRef}
          alt="LinkUp Platform Interface"
          className="w-full object-cover transition-transform duration-700"
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
        />
      </section>

      {/* Metrics / Trust Section */}
      <section className="mt-28 grid grid-cols-2 gap-8 border-t border-slate-200/60 pt-16 md:grid-cols-4">
        {[
          { value: '500k+', label: 'Active Users' },
          { value: '2.4M', label: 'Connections' },
          { value: '120+', label: 'Industries' },
          { value: '99.9%', label: 'Uptime' },
        ].map((metric) => (
          <div key={metric.label} className="flex flex-col items-center text-center">
            <span className="font-['Plus_Jakarta_Sans',_sans-serif] text-[42px] font-extrabold text-slate-900">{metric.value}</span>
            <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">{metric.label}</span>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-28 border-t border-slate-200/60 pb-6 pt-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="font-['Plus_Jakarta_Sans',_sans-serif] text-xl font-bold text-slate-900">LinkUp</span>
            <span className="text-[13px] font-medium text-slate-400">© 2024 LinkUp Professional Network. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link to="#" className="text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-900">Privacy Policy</Link>
            <Link to="#" className="text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-900">Terms of Service</Link>
            <Link to="#" className="text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-900">Cookie Policy</Link>
            <Link to="#" className="text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-900">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}