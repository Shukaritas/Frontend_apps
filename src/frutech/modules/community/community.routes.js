/**
 * Routes configuration for the Community Module.
 */
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