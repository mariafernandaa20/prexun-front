import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campus, User } from '../types';
import axiosInstance from '../api/axiosConfig';
import { getCampuses, getUsers } from '../api';

interface ActiveCampusStore {
  activeCampus: Campus | null;
  setActiveCampus: (campus: Campus | null) => void;

}

export const useActiveCampusStore = create<ActiveCampusStore>((set) => ({
  activeCampus: null,
  setActiveCampus: (campus) => set({ activeCampus: campus }),
}));