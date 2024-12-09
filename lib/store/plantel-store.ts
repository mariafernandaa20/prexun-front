import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campus } from '../types';

interface ActiveCampusStore {
  activeCampus: Campus | null;
  setActiveCampus: (campus: Campus | null) => void;
}

export const useActiveCampusStore = create<ActiveCampusStore>()(
  persist(
    (set) => ({
      activeCampus: null,
      setActiveCampus: (campus) => set({ activeCampus: campus }),
    }),
    {
      name: 'active-campus-storage',
    }
  )
);