import { defineStore } from 'pinia';
import { CommunityApiRepository } from '../infrastructure/community-api.repository.js';
import { CommunityRecommendationAssembler } from './community-recommendation.assembler.js';
import { useAuthStore } from '@/stores/auth.store.js';

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

    async createComment(commentText) {
      this.error = null;
      try {
        if (!commentText || commentText.trim().length === 0) {
          throw new Error('El comentario no puede estar vacío');
        }
        const authStore = useAuthStore();
        const username = authStore?.user?.username;
        if (!username) {
          throw new Error('Usuario no autenticado');
        }
        const repository = new CommunityApiRepository();
        await repository.createRecommendation({ userName: username, comment: commentText.trim() });
        await this.fetchRecommendations();
      } catch (error) {
        this.error = error.message;
        console.error('Error creando comentario:', error);
        throw error;
      }
    },
    async editComment(commentId, newContent) {
      this.error = null;
      try {
        if (!commentId) {
          throw new Error('ID del comentario es requerido');
        }
        if (!newContent || newContent.trim().length === 0) {
          throw new Error('El comentario no puede estar vacío');
        }
        const repository = new CommunityApiRepository();
        await repository.updateCommentContent(commentId, newContent.trim());
        await this.fetchRecommendations();
      } catch (error) {
        this.error = error.message;
        console.error('Error editando comentario:', error);
        throw error;
      }
    },
    clearError() {
      this.error = null;
    }
  }
});