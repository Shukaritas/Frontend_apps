<template>
  <div class="community-page">
    <CommunityHeader />
    <div class="community-content">
      <CommunityCommentList />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCommunityStore } from '../application/community.store.js';
import CommunityHeader from '../presentation/views/community-header.component.vue';
import CommunityCommentList from '../presentation/views/community-comment-list.component.vue';

const communityStore = useCommunityStore();

onMounted(async () => {
  await communityStore.fetchRecommendations();
});
</script>

<style scoped>
.community-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.community-content {
  width: 100%;
}
</style>