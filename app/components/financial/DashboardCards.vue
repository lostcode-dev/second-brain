<script setup lang="ts">
import type { FinancialDashboard } from '~/types/financial'

const props = defineProps<{
  dashboard: FinancialDashboard | null
  loading: boolean
  formatCurrency: (value: number) => string
}>()

const cards = computed(() => {
  if (!props.dashboard) return []
  return [
    {
      label: 'Receitas do mês',
      value: props.formatCurrency(props.dashboard.totalIncome),
      icon: 'i-lucide-trending-up',
      color: 'text-green-500' as const
    },
    {
      label: 'Despesas do mês',
      value: props.formatCurrency(props.dashboard.totalExpenses),
      icon: 'i-lucide-trending-down',
      color: 'text-red-500' as const
    },
    {
      label: 'Saldo do mês',
      value: props.formatCurrency(props.dashboard.balance),
      icon: 'i-lucide-wallet',
      color: props.dashboard.balance >= 0 ? ('text-green-500' as const) : ('text-red-500' as const)
    },
    {
      label: 'Patrimônio líquido',
      value: props.formatCurrency(props.dashboard.netWorth),
      icon: 'i-lucide-landmark',
      color: props.dashboard.netWorth >= 0 ? ('text-blue-500' as const) : ('text-red-500' as const)
    }
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="rounded-lg border border-default p-4">
        <USkeleton class="h-4 w-24 mb-2" />
        <USkeleton class="h-8 w-32" />
      </div>
    </template>
    <template v-else>
      <div
        v-for="card in cards"
        :key="card.label"
        class="rounded-lg border border-default p-4"
      >
        <div class="flex items-center gap-2 text-sm text-muted mb-1">
          <UIcon :name="card.icon" :class="card.color" class="size-4" />
          <span>{{ card.label }}</span>
        </div>
        <p class="text-2xl font-semibold text-highlighted">
          {{ card.value }}
        </p>
      </div>
    </template>
  </div>
</template>
