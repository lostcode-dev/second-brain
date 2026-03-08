<script setup lang="ts">
import type { HabitStack } from '~/types/habits'

defineProps<{
  stacks: HabitStack[]
  loading: boolean
}>()

const emit = defineEmits<{
  create: []
  remove: [id: string]
}>()

const removingId = ref<string | null>(null)

async function onRemove(id: string) {
  removingId.value = id
  emit('remove', id)
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-layers" class="size-5 text-primary" />
          <h3 class="text-sm font-semibold text-highlighted">
            Empilhamento de hábitos
          </h3>
        </div>
        <UButton
          icon="i-lucide-plus"
          label="Empilhar"
          size="xs"
          variant="subtle"
          @click="emit('create')"
        />
      </div>
    </template>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 2" :key="i" class="flex items-center gap-3">
        <USkeleton class="h-4 w-28" />
        <USkeleton class="h-4 w-5" />
        <USkeleton class="h-4 w-28" />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="stacks.length === 0"
      class="flex flex-col items-center gap-2 py-6 text-center"
    >
      <UIcon name="i-lucide-unlink" class="size-8 text-dimmed" />
      <p class="text-sm text-muted">
        Nenhum empilhamento ainda.
      </p>
      <p class="text-xs text-dimmed">
        Crie gatilhos como "Depois de X, eu farei Y".
      </p>
    </div>

    <!-- Stack list -->
    <div v-else class="space-y-3">
      <div
        v-for="stack in stacks"
        :key="stack.id"
        class="group flex items-center gap-2 rounded-lg border border-default p-3 transition-colors hover:bg-elevated/50"
      >
        <UIcon name="i-lucide-zap" class="size-4 shrink-0 text-warning" />
        <span class="text-sm font-medium text-highlighted truncate">
          {{ (stack as any).trigger_habit?.name ?? 'Hábito removido' }}
        </span>

        <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0 text-muted" />

        <UIcon name="i-lucide-target" class="size-4 shrink-0 text-success" />
        <span class="text-sm font-medium text-highlighted truncate">
          {{ (stack as any).new_habit?.name ?? 'Hábito removido' }}
        </span>

        <div class="ml-auto shrink-0">
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            :loading="removingId === stack.id"
            aria-label="Remover empilhamento"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            @click="onRemove(stack.id)"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
