import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { DashboardAssembler } from '@/frutech/modules/dashboard/application/dashboard.assembler.js';
import {DashboardApiRepository} from "@/frutech/modules/dashboard/infraestructure/dashboard.api-repository.js";

const repository = new DashboardApiRepository();
const assembler = new DashboardAssembler();

export const useDashboardStore = defineStore('dashboard', () => {
    const dashboardData = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    const enrichedTasks = computed(() => {
        if (!dashboardData.value?.upcomingTasks || !dashboardData.value?.cropFields) {
            return [];
        }
        return dashboardData.value.upcomingTasks.map(task => {
            const fieldLocation = task.name;
            const cropInfo = dashboardData.value.cropFields.find(crop => crop.field === fieldLocation);
            return {
                ...task,
                cropName: cropInfo ? `${cropInfo.title} (${cropInfo.days} days)` : 'N/A',
                fieldLocation: fieldLocation,
                healthStatus: cropInfo ? cropInfo.status : 'Unknown'
            };
        });
    });

    async function fetchDashboardData() {
        isLoading.value = true;
        error.value = null;
        dashboardData.value = null;
        try {
            const entity = await repository.getDashboardData();
            dashboardData.value = assembler.toDTO(entity);
        } catch (err) {
            error.value = 'No se pudieron cargar los datos del dashboard.';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    return {
        dashboardData,
        isLoading,
        error,
        enrichedTasks,
        fetchDashboardData
    };
});