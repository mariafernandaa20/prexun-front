import { create } from 'zustand';
import { Campus, Grupo } from '../types';
import { useAuthStore } from './auth-store';
import axiosInstance from '../api/axiosConfig';

interface ActiveCampusStore {
  activeCampus: Campus | null;
  setActiveCampus: (campus: Campus | null) => void;
  updateGruposByCampus: (campusId: number) => Promise<void>;
}

export const useActiveCampusStore = create<ActiveCampusStore>((set, get) => ({
  activeCampus: null,
  setActiveCampus: (campus) => {
    set({ activeCampus: campus });
    if (campus) {
      get().updateGruposByCampus(campus.id);
    } else {
      useAuthStore.getState().setGrupos([]);
    }
  },
  updateGruposByCampus: async (campusId: number) => {
    try {
      const response = await axiosInstance.get('/grupos', {
        params: {
          plantel_id: campusId,
        },
      });
      const grupos: Grupo[] = response.data;
      useAuthStore.getState().setGrupos(grupos);
    } catch (error) {
      console.error('Error fetching grupos by campus:', error);
      useAuthStore.getState().setGrupos([]);
    }
  },
}));