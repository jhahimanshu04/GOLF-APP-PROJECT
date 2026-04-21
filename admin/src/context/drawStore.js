import { create } from 'zustand';
import api from '../utils/api';

const useDrawStore = create((set, get) => ({
  draws: [],
  upcomingDraw: null,
  myHistory: [],
  isLoading: false,
  error: null,

  // ── User actions ──
  fetchDraws: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/draws');
      set({ draws: data.draws, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUpcoming: async () => {
    try {
      const { data } = await api.get('/draws/upcoming');
      set({ upcomingDraw: data.draw });
    } catch {}
  },

  fetchMyHistory: async () => {
    try {
      const { data } = await api.get('/draws/my-history');
      set({ myHistory: data.winnings });
    } catch {}
  },

  uploadProof: async (winningId, file) => {
    const formData = new FormData();
    formData.append('proof', file);
    try {
      await api.post(`/draws/proof/${winningId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().fetchMyHistory();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  // ── Admin actions ──
  adminFetchAll: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/draws/admin/all');
      set({ draws: data.draws, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  adminCreateDraw: async (month, year, drawLogic) => {
    try {
      const { data } = await api.post('/draws/admin/create', { month, year, drawLogic });
      await get().adminFetchAll();
      return { success: true, draw: data.draw };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  adminSimulate: async (drawId, logic) => {
    try {
      const { data } = await api.post(`/draws/admin/simulate/${drawId}`, { logic });
      return { success: true, simulation: data.simulation };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  adminRunDraw: async (drawId, logic) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post(`/draws/admin/run/${drawId}`, { logic });
      await get().adminFetchAll();
      return { success: true, draw: data.draw };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message };
    }
  },

  adminPublish: async (drawId) => {
    try {
      await api.put(`/draws/admin/publish/${drawId}`);
      await get().adminFetchAll();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  adminVerifyWinner: async (drawId, winnerId, action) => {
    try {
      await api.put(`/draws/admin/verify-winner/${drawId}/${winnerId}`, { action });
      await get().adminFetchAll();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  adminMarkPaid: async (drawId, winnerId) => {
    try {
      await api.put(`/draws/admin/mark-paid/${drawId}/${winnerId}`);
      await get().adminFetchAll();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },
}));

export default useDrawStore;
