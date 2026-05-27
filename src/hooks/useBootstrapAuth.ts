import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

export function useBootstrapAuth() {
  const token = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);

  return useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const session = await authApi.me();
      setSession(session);
      return session;
    },
    enabled: Boolean(token),
    retry: false,
  });
}
