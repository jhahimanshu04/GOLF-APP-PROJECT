import { create } from 'zustand';
import api from '../utils/api';

const useSubscriptionStore = create((set, get) => ({
  subscription: null,
  isLoading: false,
  error: null,

  fetchSubscription: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/stripe/subscription');
      set({ subscription: data.subscription, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  startCheckout: async (plan) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/stripe/create-checkout', { plan });
      window.location.href = data.url; // redirect to Stripe
    } catch (err) {
      set({ error: err.response?.data?.message || 'Checkout failed', isLoading: false });
    }
  },

  openPortal: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/stripe/portal');
      window.location.href = data.url;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Could not open billing portal', isLoading: false });
    }
  },

  cancelSubscription: async () => {
    set({ isLoading: true });
    try {
      await api.post('/stripe/cancel');
      await get().fetchSubscription();
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message };
    }
  },

  resumeSubscription: async () => {
    set({ isLoading: true });
    try {
      await api.post('/stripe/resume');
      await get().fetchSubscription();
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message };
    }
  },
}));

export default useSubscriptionStore;
