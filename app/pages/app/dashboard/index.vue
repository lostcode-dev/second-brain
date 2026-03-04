<script setup lang="ts">
definePageMeta({
  layout: 'app',
})
</script>

<template>
  <UDashboardPanel id="life-os">
    <template #header>
      <UDashboardNavbar title="Life OS">
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
            Acompanhe seu Life OS aqui
          </p>
          <p class="text-sm text-muted">
            Em breve: integração de tarefas, metas, hábitos, ideias e knowledge graph em um painel unificado para gerenciamento completo da vida.
          </p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
