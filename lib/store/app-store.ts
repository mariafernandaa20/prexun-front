// lib/store/app-store.js
import { create } from 'zustand';
import axiosInstance from '@/lib/api/axiosConfig';

export const useAppStore = create((set, get) => ({
  // State
  cards: [],
  campuses: [],
  isLoadingCards: false,
  isLoadingCampuses: false,
  
  // Fetch cards
  fetchCards: async () => {
    try {
      set({ isLoadingCards: true });
      const response = await axiosInstance.get('/cards');
      set({ cards: response.data, isLoadingCards: false });
    } catch (error) {
      console.error('Error fetching cards:', error);
      set({ isLoadingCards: false });
      throw error;
    }
  },
  
  // Fetch campuses
  fetchCampuses: async () => {
    try {
      set({ isLoadingCampuses: true });
      const response = await axiosInstance.get('/campuses');
      set({ campuses: response.data, isLoadingCampuses: false });
    } catch (error) {
      console.error('Error fetching campuses:', error);
      set({ isLoadingCampuses: false });
      throw error;
    }
  },
  
  // Add card
  addCard: async (cardData) => {
    try {
      const response = await axiosInstance.post('/cards', cardData);
      set(state => ({ 
        cards: [...state.cards, response.data.data] 
      }));
      return response.data;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  },
  
  // Update card
  updateCard: async (cardId, cardData) => {
    try {
      const response = await axiosInstance.put(`/cards/${cardId}`, cardData);
      set(state => ({
        cards: state.cards.map(card => 
          card.id === cardId ? response.data.data : card
        )
      }));
      return response.data;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },
  
  // Delete card
  deleteCard: async (cardId) => {
    try {
      await axiosInstance.delete(`/cards/${cardId}`);
      set(state => ({
        cards: state.cards.filter(card => card.id !== cardId)
      }));
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  },
  
  // Initialize app data
  initAppData: async () => {
    try {
      set({ isLoadingCards: true, isLoadingCampuses: true });
      
      // Fetch both cards and campuses in parallel
      const [cardsResponse, campusesResponse] = await Promise.all([
        axiosInstance.get('/cards'),
        axiosInstance.get('/campuses')
      ]);
      
      set({ 
        cards: cardsResponse.data, 
        campuses: campusesResponse.data,
        isLoadingCards: false,
        isLoadingCampuses: false
      });
    } catch (error) {
      console.error('Error initializing app data:', error);
      set({ isLoadingCards: false, isLoadingCampuses: false });
      throw error;
    }
  }
}));