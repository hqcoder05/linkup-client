import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

export function useBootstrapAuth() {
  const token = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const session = await authApi.me();
      setUser(session.user);
      return session;
    },
    enabled: Boolean(token),
    retry: false,
  });
}
