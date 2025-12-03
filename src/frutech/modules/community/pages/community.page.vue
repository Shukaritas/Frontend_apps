<template>
  <div class="community-page">
    <div class="header-row">
      <CommunityHeader />
      <Button :label="$t('community.actions.addComment')" icon="pi pi-plus" @click="openNewCommentDialog" class="add-comment-btn" />
    </div>
    <div class="community-content">
      <CommunityCommentList @edit="handleEditComment" />
    </div>

    <!-- Dialog mejorado con modo edición -->
    <Dialog
      v-model:visible="showDialog"
      :header="editingComment ? $t('community.actions.editComment') : $t('community.actions.newComment')"
      :modal="true"
      :closable="true"
      @hide="resetDialog"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-column gap-3">
        <div class="field">
          <label for="commentText" class="font-semibold">{{ $t('community.actions.commentLabel') }}</label>
          <Textarea
            id="commentText"
            v-model="newComment"
            rows="5"
            autoResize
            class="w-full"
            :placeholder="$t('community.actions.commentPlaceholder')"
            :class="{ 'p-invalid': submitAttempt && !newComment.trim() }"
          />
          <small v-if="submitAttempt && !newComment.trim()" class="p-error">{{ $t('community.actions.commentRequired') }}</small>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-content-end gap-2">
          <Button :label="$t('community.actions.cancel')" text @click="showDialog = false; resetDialog()" />
          <Button
            :label="editingComment ? $t('community.actions.update') : $t('community.actions.post')"
            :disabled="posting"
            :loading="posting"
            @click="onSubmitComment"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCommunityStore } from '../application/community.store.js';
import CommunityHeader from '../presentation/views/community-header.component.vue';
import CommunityCommentList from '../presentation/views/community-comment-list.component.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });

const communityStore = useCommunityStore();
const toast = useToast();

const showDialog = ref(false);
const newComment = ref('');
const submitAttempt = ref(false);
const posting = ref(false);
const editingComment = ref(null); // Guarda el comentario que se está editando

onMounted(async () => {
  await communityStore.fetchRecommendations();
});

function openNewCommentDialog() {
  editingComment.value = null;
  newComment.value = '';
  submitAttempt.value = false;
  showDialog.value = true;
}

function handleEditComment(comment) {
  editingComment.value = comment;
  newComment.value = comment.description || '';
  submitAttempt.value = false;
  showDialog.value = true;
}

function resetDialog() {
  newComment.value = '';
  submitAttempt.value = false;
  posting.value = false;
  editingComment.value = null;
}

async function onSubmitComment() {
  submitAttempt.value = true;
  if (!newComment.value.trim()) return;
  posting.value = true;
  try {
    if (editingComment.value) {
      // Modo edición
      await communityStore.editComment(editingComment.value.id, newComment.value);
      toast.add({ severity: 'success', summary: t('community.toasts.updated'), life: 2500 });
    } else {
      // Modo creación
      await communityStore.createComment(newComment.value);
      toast.add({ severity: 'success', summary: t('community.toasts.posted'), life: 2500 });
    }
    showDialog.value = false;
    resetDialog();
  } catch (e) {
    toast.add({ severity: 'error', summary: t('community.toasts.error'), detail: e.message, life: 3000 });
  } finally {
    posting.value = false;
  }
}
</script>

<style scoped>
.community-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.add-comment-btn {
  align-self: center;
}
.community-content {
  width: 100%;
}
.field label {
  font-weight: 600;
  margin-bottom: .25rem;
  display: inline-block;
}
</style>