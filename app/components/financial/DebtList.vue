<script setup lang="ts">
import type { Debt, DebtStatus } from '~/types/financial'
import { DEBT_STATUS_META } from '~/types/financial'

const props = defineProps<{
  debts: Debt[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  formatCurrency: (value: number) => string
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'select': [debt: Debt]
  'edit': [debt: Debt]
  'delete': [debt: Debt]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

function getProgress(debt: Debt): number {
  if (debt.totalAmount <= 0) return 0
  return Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100)
}
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 4" :key="i" class="h-20 w-full" />
    </div>

    <!-- Empty state -->
    <div v-else-if="debts.length === 0" class="flex flex-col items-center justify-center py-12 gap-3">
      <UIcon name="i-lucide-credit-card" class="size-12 text-dimmed" />
      <p class="text-sm text-muted">
        Nenhuma dívida encontrada
      </p>
    </div>

    <!-- List -->
    <div v-else class="space-y-2">
      <div
        v-for="debt in debts"
        :key="debt.id"
        class="rounded-lg border border-default p-4 hover:bg-elevated/50 transition-colors cursor-pointer"
        @click="emit('select', debt)"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2 min-w-0">
            <UIcon name="i-lucide-credit-card" class="size-5 text-muted shrink-0" />
            <p class="text-sm font-medium truncate">
              {{ debt.name }}
            </p>
            <UBadge
              :color="DEBT_STATUS_META[debt.status as DebtStatus]?.color ?? 'neutral'"
              size="xs"
              variant="subtle"
            >
              <UIcon :name="DEBT_STATUS_META[debt.status as DebtStatus]?.icon ?? 'i-lucide-circle'" class="size-3 mr-1" />
              {{ DEBT_STATUS_META[debt.status as DebtStatus]?.label ?? debt.status }}
            </UBadge>
          </div>
          <div class="flex items-center gap-2">
            <UDropdownMenu
              :items="[
                [
                  { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => emit('edit', debt) },
                  { label: 'Excluir', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => emit('delete', debt) }
                ]
              ]"
            >
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="xs"
                @click.stop
              />
            </UDropdownMenu>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-muted mb-2">
          <span>{{ formatCurrency(debt.totalAmount - debt.remainingAmount) }} de {{ formatCurrency(debt.totalAmount) }}</span>
          <span v-if="debt.installmentCount">
            {{ debt.paidInstallmentCount }}/{{ debt.installmentCount }} parcelas
          </span>
        </div>

        <UProgress :value="getProgress(debt)" color="primary" size="xs" />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center pt-4">
        <UPagination
          :model-value="page"
          :total="total"
          :items-per-page="pageSize"
          @update:model-value="emit('update:page', $event)"
        />
      </div>
    </div>
  </div>
</template>
