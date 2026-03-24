<script setup lang="ts">
import type { FinancialDashboard, TransactionType } from '~/types/financial'
import { TRANSACTION_TYPE_META } from '~/types/financial'

defineProps<{
  dashboard: FinancialDashboard | null
  loading: boolean
  formatCurrency: (value: number) => string
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Expenses by Category -->
    <div v-if="!loading && dashboard" class="rounded-lg border border-default p-4">
      <h3 class="text-sm font-medium text-highlighted mb-4">
        Despesas por categoria
      </h3>
      <div v-if="dashboard.expensesByCategory.length === 0" class="text-sm text-muted text-center py-4">
        Nenhuma despesa registrada neste mês
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="cat in dashboard.expensesByCategory"
          :key="cat.categoryId ?? 'none'"
          class="flex items-center gap-3"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm truncate">{{ cat.categoryName }}</span>
              <span class="text-sm font-medium text-muted">{{ cat.percentage }}%</span>
            </div>
            <UProgress :value="cat.percentage" color="primary" size="xs" />
          </div>
          <span class="text-sm font-medium text-highlighted whitespace-nowrap">
            {{ formatCurrency(cat.total) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Monthly Comparison -->
    <div v-if="!loading && dashboard" class="rounded-lg border border-default p-4">
      <h3 class="text-sm font-medium text-highlighted mb-4">
        Comparativo mensal
      </h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-muted mb-1">
            Mês anterior
          </p>
          <p class="text-sm">
            <span class="text-green-500">↑ {{ formatCurrency(dashboard.monthlyComparison.previousMonthIncome) }}</span>
          </p>
          <p class="text-sm">
            <span class="text-red-500">↓ {{ formatCurrency(dashboard.monthlyComparison.previousMonthExpenses) }}</span>
          </p>
        </div>
        <div>
          <p class="text-xs text-muted mb-1">
            Mês atual
          </p>
          <p class="text-sm">
            <span class="text-green-500">↑ {{ formatCurrency(dashboard.monthlyComparison.currentMonthIncome) }}</span>
          </p>
          <p class="text-sm">
            <span class="text-red-500">↓ {{ formatCurrency(dashboard.monthlyComparison.currentMonthExpenses) }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div v-if="!loading && dashboard" class="rounded-lg border border-default p-4">
      <h3 class="text-sm font-medium text-highlighted mb-4">
        Transações recentes
      </h3>
      <div v-if="dashboard.recentTransactions.length === 0" class="text-sm text-muted text-center py-4">
        Nenhuma transação registrada
      </div>
      <div v-else class="divide-y divide-default">
        <div
          v-for="tx in dashboard.recentTransactions"
          :key="tx.id"
          class="flex items-center justify-between py-2"
        >
          <div class="flex items-center gap-2 min-w-0">
            <UIcon
              :name="TRANSACTION_TYPE_META[tx.type as TransactionType]?.icon ?? 'i-lucide-circle'"
              :class="tx.type === 'income' ? 'text-green-500' : 'text-red-500'"
              class="size-4 shrink-0"
            />
            <div class="min-w-0">
              <p class="text-sm truncate">
                {{ tx.description }}
              </p>
              <p class="text-xs text-muted">
                {{ tx.categoryName ?? 'Sem categoria' }} · {{ new Date(tx.date).toLocaleDateString('pt-BR') }}
              </p>
            </div>
          </div>
          <span
            class="text-sm font-medium whitespace-nowrap"
            :class="tx.type === 'income' ? 'text-green-500' : 'text-red-500'"
          >
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <template v-if="loading">
      <div class="rounded-lg border border-default p-4 space-y-3">
        <USkeleton class="h-4 w-40" />
        <USkeleton v-for="i in 4" :key="i" class="h-8 w-full" />
      </div>
    </template>
  </div>
</template>
