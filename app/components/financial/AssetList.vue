<script setup lang="ts">
import type { Asset } from '~/types/financial'

const props = defineProps<{
  assets: Asset[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  formatCurrency: (value: number) => string
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'edit': [asset: Asset]
  'delete': [asset: Asset]
}>()

const totalAssetValue = computed(() =>
  props.assets.reduce((sum, a) => sum + a.value, 0)
)

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 4" :key="i" class="h-16 w-full" />
    </div>

    <!-- Empty state -->
    <div v-else-if="assets.length === 0" class="flex flex-col items-center justify-center py-12 gap-3">
      <UIcon name="i-lucide-landmark" class="size-12 text-dimmed" />
      <p class="text-sm text-muted">
        Nenhum ativo encontrado
      </p>
    </div>

    <!-- List -->
    <div v-else class="space-y-4">
      <!-- Total -->
      <div class="rounded-lg border border-default p-4 bg-elevated/30">
        <p class="text-sm text-muted">
          Total em ativos
        </p>
        <p class="text-xl font-semibold text-blue-500">
          {{ formatCurrency(totalAssetValue) }}
        </p>
      </div>

      <div class="space-y-2">
        <div
          v-for="asset in assets"
          :key="asset.id"
          class="flex items-center justify-between rounded-lg border border-default p-4 hover:bg-elevated/50 transition-colors"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
              <UIcon name="i-lucide-landmark" class="size-5 text-blue-500" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">
                {{ asset.name }}
              </p>
              <p v-if="asset.description" class="text-xs text-muted truncate">
                {{ asset.description }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-blue-500 whitespace-nowrap">
              {{ formatCurrency(asset.value) }}
            </span>
            <UDropdownMenu
              :items="[
                [
                  { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => emit('edit', asset) },
                  { label: 'Excluir', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => emit('delete', asset) }
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
