export const myTasksRoutes = [
  {
    path: '/my-tasks',
    name: 'my-tasks',
    component: () => import('./pages/my-tasks.page.vue'),
    meta: {
        requiresAuth: true,
    },
  },
];
