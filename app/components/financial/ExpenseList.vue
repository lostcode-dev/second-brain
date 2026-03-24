<script setup lang="ts">
import type { Expense } from '~/types/financial'

const props = defineProps<{
  expenses: Expense[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  formatCurrency: (value: number) => string
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'edit': [expense: Expense]
  'delete': [expense: Expense]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 5" :key="i" class="h-16 w-full" />
    </div>

    <!-- Empty state -->
    <div v-else-if="expenses.length === 0" class="flex flex-col items-center justify-center py-12 gap-3">
      <UIcon name="i-lucide-trending-down" class="size-12 text-dimmed" />
      <p class="text-sm text-muted">
        Nenhuma despesa encontrada
      </p>
    </div>

    <!-- List -->
    <div v-else class="space-y-2">
      <div
        v-for="expense in expenses"
        :key="expense.id"
        class="flex items-center justify-between rounded-lg border border-default p-4 hover:bg-elevated/50 transition-colors"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex size-10 items-center justify-center rounded-full bg-red-500/10">
            <UIcon name="i-lucide-trending-down" class="size-5 text-red-500" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">
              {{ expense.description }}
            </p>
            <div class="flex items-center gap-2 text-xs text-muted">
              <span>{{ new Date(expense.date).toLocaleDateString('pt-BR') }}</span>
              <UBadge
                v-if="expense.category"
                size="xs"
                color="neutral"
                variant="subtle"
              >
                {{ expense.category.name }}
              </UBadge>
              <UBadge
                v-if="expense.recurring"
                size="xs"
                color="info"
                variant="subtle"
              >
                <UIcon name="i-lucide-repeat" class="size-3 mr-1" />
                Recorrente
              </UBadge>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-red-500 whitespace-nowrap">
            -{{ formatCurrency(expense.amount) }}
          </span>
          <UDropdownMenu
            :items="[
              [
                { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => emit('edit', expense) },
                { label: 'Excluir', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => emit('delete', expense) }
              ]
            ]"
          >
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="xs"
            />
          </UDropdownMenu>
        </div>
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
