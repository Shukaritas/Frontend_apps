export const communityRoutes = [
  {
    path: '/community',
    name: 'community',
    component: () => import('./pages/community.page.vue'),
    meta: {
        requiresAuth: true,
    },
  },
];