<template>
  <div class="community-comment-list">
    <div v-if="communityStore.isLoadingRecommendations" class="loading">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <span>Loading recommendations...</span>
    </div>
    
    <div v-else-if="communityStore.hasError" class="error">
      <i class="pi pi-exclamation-triangle"></i>
      <span>{{ communityStore.getError }}</span>
    </div>
    
    <community-comment-card
      v-else
      v-for="recommendation in communityStore.getRecommendations"
      :key="recommendation.id"
      :comment="recommendation"
      @edit="$emit('edit', $event)"
    />
  </div>
</template>

<script setup>
import { useCommunityStore } from '../../application/community.store.js';
import CommunityCommentCard from './community-comment-card.component.vue';

const communityStore = useCommunityStore();

defineEmits(['edit']);
</script>

<style scoped>
.community-comment-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loading, .error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
}

.loading {
  color: #007bff;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 0.375rem;
}
</style>