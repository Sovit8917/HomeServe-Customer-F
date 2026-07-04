import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WorkerUser } from "@/types";

interface AuthState {
  user: WorkerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: WorkerUser, token: string) => void;
  updateUser: (user: Partial<WorkerUser>) => void;
  logout: () => void;
  setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: !!(user && token) }),
      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: "worker-auth-storage",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
