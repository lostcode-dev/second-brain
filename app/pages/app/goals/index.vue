<script setup lang="ts">
definePageMeta({
  layout: 'app',
})
</script>

<template>
  <UDashboardPanel id="goals">
    <template #header>
      <UDashboardNavbar title="Metas">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex h-full flex-1 flex-col items-center justify-center gap-4">
        <UIcon name="i-lucide-calendar-check" class="size-16 text-dimmed" />
        <div class="text-center">
          <p class="font-medium text-highlighted">
            Acompanhe suas metas aqui
          </p>
          <p class="text-sm text-muted">
            Em breve: criação de metas, acompanhamento de progresso e revisão semanal.
          </p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
