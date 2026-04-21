import { create } from 'zustand';
import api from '../utils/api';

const useCharityStore = create((set, get) => ({
  charities: [],
  featured: [],
  myCharity: null,
  myContributionPercent: 10,
  isLoading: false,
  error: null,

  // ── Public ──
  fetchCharities: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/charities?${params}`);
      set({ charities: data.charities, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchFeatured: async () => {
    try {
      const { data } = await api.get('/charities/featured');
      set({ featured: data.charities });
    } catch {}
  },

  // ── User ──
  fetchMyCharity: async () => {
    try {
      const { data } = await api.get('/charities/user/my-charity');
      set({
        myCharity: data.selectedCharity,
        myContributionPercent: data.contributionPercent,
      });
    } catch {}
  },

  selectCharity: async (charityId, contributionPercent) => {
    set({ isLoading: true });
    try {
      const { data } = await api.put('/charities/user/select', {
        charityId,
        contributionPercent,
      });
      set({
        myCharity: data.selectedCharity,
        myContributionPercent: data.contributionPercent,
        isLoading: false,
      });
      return { success: true, message: data.message };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // ── Admin ──
  adminFetchAll: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/charities/admin/all');
      set({ charities: data.charities, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  adminCreate: async (formData) => {
    try {
      const { data } = await api.post('/charities/admin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().adminFetchAll();
      return { success: true, charity: data.charity };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  adminUpdate: async (id, formData) => {
    try {
      const { data } = await api.put(`/charities/admin/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().adminFetchAll();
      return { success: true, charity: data.charity };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  adminDelete: async (id) => {
    try {
      await api.delete(`/charities/admin/${id}`);
      await get().adminFetchAll();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  adminAddEvent: async (charityId, formData) => {
    try {
      await api.post(`/charities/admin/${charityId}/events`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().adminFetchAll();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },
}));

export default useCharityStore;
