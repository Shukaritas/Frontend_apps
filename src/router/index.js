/**
 * @file Vue Router configuration.
 * @description Configuración de rutas con redirección inicial al Login.
 */

import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../shared/layouts/main-layout.component.vue';
import { useAuthStore } from "@/stores/auth.store.js";

const LoginPage = () => import('@/frutech/modules/iam/pages/login.page.vue');
const RegisterPage = () => import('@/frutech/modules/iam/pages/register.page.vue');

const routes = [
    {
        path: '/register',
        name: 'Register',
        component: RegisterPage,
        meta: { public: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        meta: { public: true }
    },
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/frutech/modules/dashboard/pages/dashboard.page.vue'),
            },
            {
                path: 'manage-crops',
                name: 'ManageCrops',
                component: () => import('@/frutech/modules/manage-crops/pages/manage-crops.page.vue'),
            },
            {
                path: 'manage-crops/new',
                name: 'ManageCropsNew',
                component: () => import('@/frutech/modules/manage-crops/pages/register-crop.page.vue'),
            },
            {
                path: 'my-fields',
                name: 'MyFields',
                component: () => import('@/frutech/modules/my-fields/pages/my-fields.page.vue'),
            },
            {
                path: '/fields/new',
                name: 'field-new',
                component: () => import('@/frutech/modules/my-fields/pages/field-new.page.vue'),
            },
            {
                path: '/fields/:id',
                name: 'field-detail',
                component: () => import('@/frutech/modules/my-fields/pages/field-detail.page.vue'),
            },
            {
                path: 'my-tasks',
                name: 'MyTasks',
                component: () => import('@/frutech/modules/my-tasks/pages/my-tasks.page.vue'),
            },
            {
                path: 'community',
                name: 'Community',
                component: () => import('@/frutech/modules/community/pages/community.page.vue'),
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/frutech/modules/profile/pages/profile.page.vue'),
            },
            {
                path: '',
                redirect: '/dashboard',
            },
        ],
    },
    // Redirigir cualquier ruta desconocida al login
    { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    const isPublic = to.matched.some(record => record.meta.public);
    const isAuthenticated = authStore.isAuthenticated;

    if (!isPublic && !isAuthenticated) {
        // CAMBIO: Redirigir al Login si no está autenticado
        return next({ path: '/login' });
    }

    if (isPublic && isAuthenticated) {
        return next({ path: '/dashboard' });
    }

    next();
});

export default router;