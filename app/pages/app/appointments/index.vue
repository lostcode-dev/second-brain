<script setup lang="ts">
definePageMeta({
  layout: 'app',
})
</script>

<template>
  <UDashboardPanel id="appointments">
    <template #header>
      <UDashboardNavbar title="Agendamentos">
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
            Acompanhe seus agendamentos aqui
          </p>
          <p class="text-sm text-muted">
            Em breve: criação, notificações e integração com calendário.
          </p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
