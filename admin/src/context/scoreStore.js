import { create } from 'zustand';
import api from '../utils/api';

const useScoreStore = create((set, get) => ({
  scores: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchScores: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/scores');
      set({ scores: data.scores, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/scores/stats');
      set({ stats: data.stats });
    } catch {}
  },

  addScore: async (value, date) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/scores', { value, date });
      set({ scores: data.scores, isLoading: false });
      await get().fetchStats();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add score.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  updateScore: async (scoreId, value, date) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/scores/${scoreId}`, { value, date });
      set({ scores: data.scores, isLoading: false });
      await get().fetchStats();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update score.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  deleteScore: async (scoreId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/scores/${scoreId}`);
      set({ scores: data.scores, isLoading: false });
      await get().fetchStats();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete score.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useScoreStore;
