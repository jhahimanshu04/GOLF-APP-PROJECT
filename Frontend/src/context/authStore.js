import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // --- Register ---
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          set({ user: data.user, token: data.token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // --- Login ---
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // --- Logout ---
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('golf-auth');
      },

      // --- Fetch current user ---
      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {
          set({  token: null });
        }
      },

      // --- Update profile ---
      updateProfile: async (updates) => {
        try {
          const { data } = await api.put('/auth/me', updates);
          set({ user: data.user });
          return { success: true };
        } catch (err) {
          return { success: false, message: err.response?.data?.message };
        }
      },

      clearError: () => set({ error: null }),

      isAuthenticated: () => !!get().token ,
      isAdmin: () => get().user?.role === 'admin',
      isSubscribed: () => {
        const user = get().user;
        return (
          user?.subscription?.status === 'active' &&
          user?.subscription?.currentPeriodEnd &&
          new Date(user.subscription.currentPeriodEnd) > new Date()
        );
      },
    }),
    {
      name: 'golf-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export default useAuthStore;
