import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { authApi } from '@/api/auth';
import { apiMessage } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
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
      setError(apiMessage(err, 'Login failed'));
    }
  });

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-brand-500 text-2xl font-extrabold text-white shadow-lift">
            in
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue building your network.</p>
        </div>
        <Card className="p-5">
          {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
              <input className="input-field" type="email" autoComplete="email" {...form.register('email')} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
              <div className="relative">
                <input
                  className="input-field pr-10"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...form.register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-slate-500"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-500">
                <input type="checkbox" className="rounded border-slate-300" /> Remember me
              </label>
              <span className="font-semibold text-brand-600">Forgot password?</span>
            </div>
            <Button className="w-full" disabled={form.formState.isSubmitting}>
              <LogIn className="h-4 w-4" /> Login
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            New to LinkUp?{' '}
            <Link to="/register" className="font-semibold text-brand-600">
              Register
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
