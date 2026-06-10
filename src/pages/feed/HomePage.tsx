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
    <div className="min-h-screen bg-[#fafafa] pb-24 pt-[120px]">
      <div className="mx-auto max-w-[1200px] px-6 xl:px-0">

        {/* Hero Section */}
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left: Content */}
          <div className="space-y-8">
            <h1 className="text-[52px] font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-[64px]">
              {t('home.title')}
            </h1>
            <p className="max-w-[540px] text-[18px] font-medium leading-relaxed text-slate-500">
              {t('home.subtitle')}
            </p>
            <div className="pt-4">
              <Link to={user ? '/feed' : '/register'} className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4.5 text-[16px] font-bold text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/30">
                {user ? t('home.open_feed_btn') : t('home.join_btn')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right: Feature Grid (Bento Style) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map((item, index) => (
              <div key={item.title} className={`group rounded-[32px] border border-slate-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-600/5 ${index % 2 !== 0 ? 'sm:mt-12' : ''}`}>   
                <div className="mb-8 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-slate-50 text-slate-700 transition-all group-hover:bg-blue-600 group-hover:text-white">
                  <item.icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">{item.title}</h3>
                <p className="text-[15px] leading-relaxed text-slate-500 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contextual Dashboard Preview */}
        <section className="relative mt-40 overflow-hidden rounded-[40px] border border-slate-200/40 bg-white p-4 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)]">
          <div className="overflow-hidden rounded-[24px]">
            <img
              ref={heroImgRef}
              alt="LinkUp Platform Interface"
              className="w-full object-cover transition-transform duration-700"
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"    
            />
          </div>
        </section>

        {/* Metrics / Trust Section */}
        <section className="mt-40 grid grid-cols-2 gap-12 border-t border-slate-200/60 pt-20 md:grid-cols-4">    
          {[
            { value: '500k+', label: 'Active Users' },
            { value: '2.4M', label: 'Followers' },
            { value: '1M+', label: 'Moments' },
            { value: '99.9%', label: 'Uptime' },
          ].map((metric) => (
            <div key={metric.label} className="flex flex-col items-center text-center">
              <span className="text-[56px] font-extrabold text-slate-900 leading-none">{metric.value}</span>
              <span className="mt-4 block text-[13px] font-bold uppercase tracking-[0.2em] text-blue-600">{metric.label}</span>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-40 border-t border-slate-200/60 pb-12 pt-16">
          <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-start">
            <div className="flex flex-col items-center gap-3 md:items-start">
              <span className="text-2xl font-bold text-slate-900">LinkUp</span>
              <span className="text-[14px] font-medium text-slate-400">© 2024 LinkUp Social Platform. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-12">
              <Link to="#" className="text-[14px] font-bold text-slate-500 transition-colors hover:text-blue-600">Privacy Policy</Link>
              <Link to="#" className="text-[14px] font-bold text-slate-500 transition-colors hover:text-blue-600">Terms of Service</Link>
              <Link to="#" className="text-[14px] font-bold text-slate-500 transition-colors hover:text-blue-600">Cookie Policy</Link>
              <Link to="#" className="text-[14px] font-bold text-slate-500 transition-colors hover:text-blue-600">Contact Us</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
