import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { authApi } from '@/api/auth';
import { apiMessage } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/feed';
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = form.handleSubmit(async (values) => {
    setError('');
    try {
      const session = await authApi.login(values);
      setSession(session);
      navigate(from, { replace: true });
    } catch (err) {
      setError(apiMessage(err, t('login.error_failed', 'Login failed')));
    }
  });

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 font-['Inter',_sans-serif]">
      <div className="w-full max-w-[480px] rounded-2xl border border-slate-100 bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-12">
        
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans',_sans-serif] text-[28px] font-bold text-slate-900">
            {t('login.title', 'Welcome back')}
          </h1>
          <p className="mt-2 text-[15px] text-slate-500">{t('login.subtitle', 'Sign in to continue building your network.')}</p>
        </div>

        {error && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-700">{t('login.email', 'Email')}</label>
            <input 
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-[15px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black" 
              placeholder="name@company.com" 
              type="email"
              autoComplete="email"
              {...form.register('email')} 
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-700">{t('login.password', 'Password')}</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-3 pr-12 text-[15px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...form.register('password')}
              />
              <button 
                type="button" 
                className="absolute right-4 top-3.5 text-slate-400" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-black" /> {t('login.remember', 'Remember me')}
            </label>
            <span className="font-semibold cursor-pointer hover:underline">{t('login.forgot', 'Forgot password?')}</span>
          </div>

          <button type="submit" className="w-full rounded-lg bg-black py-3.5 text-[15px] font-semibold text-white transition hover:bg-slate-800 active:scale-95">
            {t('login.submit', 'Login')}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4 text-slate-300">
          <div className="h-px w-full bg-slate-100"></div>
          <span className="text-[11px] font-medium uppercase text-slate-400">OR CONTINUE WITH</span>
          <div className="h-px w-full bg-slate-100"></div>
        </div>

        <div className="space-y-3">
          <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 py-3 text-[14px] font-medium transition hover:bg-slate-50">
            <FcGoogle className="h-5 w-5" /> Google
          </button>
          <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 py-3 text-[14px] font-medium transition hover:bg-slate-50">
            <FaFacebook className="h-5 w-5 text-[#1877F2]" /> Facebook
          </button>
        </div>

        <p className="mt-8 text-center text-[14px] text-slate-500">
          {t('login.new_to_linkup', 'New to LinkUp?')} <Link to="/register" className="font-bold text-black hover:underline">{t('login.register', 'Register')}</Link>
        </p>
      </div>
    </div>
  );
}
