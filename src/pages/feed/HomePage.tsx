import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Rss, Users, UserCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';

export function HomePage() {
  const { t } = useTranslation();
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
    { icon: Rss, title: t('home.features.feed'), text: t('home.features.feed_text') },
    { icon: Users, title: t('home.features.follow'), text: t('home.features.follow_text') },
    { icon: UserCircle, title: t('home.features.profiles'), text: t('home.features.profiles_text') },
    { icon: MessageSquare, title: t('home.features.messages'), text: t('home.features.messages_text') },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-12 pt-[120px] font-['Inter',_sans-serif]">
      <div className="mx-auto max-w-[1200px] px-6 xl:px-0">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left: Content */}
          <div className="space-y-6">
            <h1 className="font-['Plus_Jakarta_Sans',_sans-serif] text-[48px] font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-[56px]">
              {t('home.title')}
            </h1>
            <p className="max-w-[500px] text-[17px] font-medium leading-relaxed text-slate-500">
              {t('home.subtitle')}
            </p>
            <div className="pt-2">
              <Link to={user ? '/feed' : '/register'} className="group inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-7 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30">
                {user ? t('home.open_feed_btn') : t('home.join_btn')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right: Feature Grid (Bento Style) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {features.map((item, index) => (
              <div key={item.title} className={`group rounded-[20px] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md ${index % 2 !== 0 ? 'sm:mt-8' : ''}`}>
                <div className="mb-6 flex h-[46px] w-[46px] items-center justify-center rounded-lg bg-slate-100 transition-transform group-hover:scale-110">
                  <item.icon className="h-[22px] w-[22px] text-slate-700" strokeWidth={2} />
                </div>
                <h3 className="mb-2 font-['Plus_Jakarta_Sans',_sans-serif] text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contextual Dashboard Preview */}
        <section className="relative mt-32 overflow-hidden rounded-[24px] border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <img
            ref={heroImgRef}
            alt="LinkUp Platform Interface"
            className="w-full object-cover transition-transform duration-700"
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
          />
        </section>

        {/* Metrics / Trust Section */}
        <section className="mt-32 grid grid-cols-2 gap-8 border-t border-slate-200/80 pt-16 md:grid-cols-4">
          {[
            { value: '500k+', label: 'Active Users' },
            { value: '2.4M', label: 'Follows' },
            { value: '120+', label: 'Industries' },
            { value: '99.9%', label: 'Uptime' },
          ].map((metric) => (
            <div key={metric.label} className="flex flex-col items-center text-center">
              <span className="font-['Plus_Jakarta_Sans',_sans-serif] text-[48px] font-extrabold text-slate-900">{metric.value}</span>
              <span className="mt-2 block text-[12px] font-bold uppercase tracking-[0.15em] text-slate-500">{metric.label}</span>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-32 border-t border-slate-200/80 pb-6 pt-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
            <div className="flex flex-col items-center gap-2 md:items-start">
              <span className="font-['Plus_Jakarta_Sans',_sans-serif] text-xl font-bold text-slate-900">LinkUp</span>
              <span className="text-[13px] font-medium text-slate-500">© 2024 LinkUp Professional Network. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link to="#" className="text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900">Privacy Policy</Link>
              <Link to="#" className="text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900">Terms of Service</Link>
              <Link to="#" className="text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900">Cookie Policy</Link>
              <Link to="#" className="text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900">Contact Us</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
