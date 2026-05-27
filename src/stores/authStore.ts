import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '@/types/api';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDto | null;
  setSession: (session: { accessToken: string; refreshToken: string; user: UserDto }) => void;
  setUser: (user: UserDto | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (session) => set(session),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'linkup-auth',
    },
  ),
);
