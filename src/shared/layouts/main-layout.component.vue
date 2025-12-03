<template>
  <div class="flex h-screen main-layout" :class="{ 'sidebar-is-open': layoutStore.isSidebarVisible }">
    <Sidebar />

    <div
        class="sidebar-overlay"
        @click="layoutStore.toggleSidebar"
        v-if="layoutStore.isSidebarVisible"
    ></div>

    <div class="flex flex-column flex-grow-1 content-wrapper">
      <Header />
      <main class="p-4 flex-grow-1 overflow-y-auto" style="background-color: var(--surface-ground);">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>

import { useLayoutStore } from '@/stores/layout.store';
import Sidebar from '../components/sidebar.component.vue';
import Header from '../components/header.component.vue';


const layoutStore = useLayoutStore();
</script>