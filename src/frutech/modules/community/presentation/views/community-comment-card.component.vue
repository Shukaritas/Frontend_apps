<template>
  <div class="community-comment-card">
    <div class="card-header">
      <span class="author">{{ comment.user }}</span>
      <span class="role">{{ comment.role }}</span>
    </div>
    <div class="card-content">
      <p class="text">"{{ comment.description }}"</p>
    </div>
    <div class="card-footer">
      <span class="date">19/7/2025</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  comment: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.community-comment-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.community-comment-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2c3e50;
}

.role {
  font-size: 1rem;
  color: #6c757d;
  font-weight: 400;
}

.card-content {
  margin: 1rem 0;
}

.text {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  text-align: justify;
}

.card-footer {
  text-align: right;
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 1rem;
}
</style>