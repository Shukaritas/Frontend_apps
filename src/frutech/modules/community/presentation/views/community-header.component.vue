<template>
  <div class="community-header">
    <h1 class="title">{{$t('community.title')}}</h1>
    <p class="subtitle">
      {{$t('community.description')}}
    </p>
    <span class="comments-count">{{ commentsCount }} {{$t('community.quantity')}}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCommunityStore } from '../../application/community.store.js';

const communityStore = useCommunityStore();

const commentsCount = computed(() => {
  return communityStore.getRecommendations.length;
});
</script>

<style scoped>
.community-header {
  margin-bottom: 2rem;
}
.title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}
.subtitle {
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  line-height: 1.6;
}
.comments-count {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}
</style>