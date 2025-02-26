import { create } from 'zustand'
import { Campus, Grupo } from '../types'
import axiosInstance from '../api/axiosConfig'

interface EntityState<T> {
  data: T[]
  loading: boolean
  error: string | null
}

interface AppStore {
  campuses: EntityState<Campus>
  groups: EntityState<Grupo>
  fetchCampuses: () => Promise<void>
  fetchGroups: () => Promise<void>
}

export const useAppStore = create<AppStore>((set) => ({
  campuses: { data: [], loading: false, error: null },
  personnel: { data: [], loading: false, error: null },
  groups: { data: [], loading: false, error: null },

  fetchCampuses: async () => {
    try {
      set((state) => ({ campuses: { ...state.campuses, loading: true, error: null } }))
      const response = await axiosInstance.get('/campuses')
      set((state) => ({ campuses: { ...state.campuses, data: response.data, loading: false } }))
    } catch (error) {
      set((state) => ({ 
        campuses: { 
          ...state.campuses,
          error: error instanceof Error ? error.message : 'Failed to fetch campuses',
          loading: false 
        }
      }))
    }
  },

  fetchGroups: async () => {
    try {
      set((state) => ({ groups: { ...state.groups, loading: true, error: null } }))
      const response = await axiosInstance.get('/groups')
      set((state) => ({ groups: { ...state.groups, data: response.data, loading: false } }))
    } catch (error) {
      set((state) => ({ 
        groups: { 
          ...state.groups,
          error: error instanceof Error ? error.message : 'Failed to fetch groups',
          loading: false 
        }
      }))
    }
  }
}))
