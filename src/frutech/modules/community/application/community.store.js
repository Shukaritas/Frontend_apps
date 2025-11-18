import { defineStore } from 'pinia';
import { CommunityApiRepository } from '../infrastructure/community-api.repository.js';
import { CommunityRecommendationAssembler } from './community-recommendation.assembler.js';

/**
 * Pinia store for managing community recommendations.
 * This store handles state, getters, and actions related to community recommendations.
 * It interacts with the CommunityApiRepository to fetch data and uses the CommunityRecommendationAssembler
 * to convert entities to DTOs for use in the application.
 */
export const useCommunityStore = defineStore('community', {
  state: () => ({
    recommendations: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getRecommendations: (state) => state.recommendations,
    isLoadingRecommendations: (state) => state.isLoading,
    hasError: (state) => state.error !== null,
    getError: (state) => state.error
  },

  actions: {
    async fetchRecommendations() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const repository = new CommunityApiRepository();
        const recommendations = await repository.getRecommendations();
        this.recommendations = CommunityRecommendationAssembler.toDTOList(recommendations);
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching recommendations:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchRecommendationById(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const repository = new CommunityApiRepository();
        const recommendation = await repository.getRecommendationById(id);
        return CommunityRecommendationAssembler.toDTO(recommendation);
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching recommendation:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearError() {
      this.error = null;
    }
  }
});