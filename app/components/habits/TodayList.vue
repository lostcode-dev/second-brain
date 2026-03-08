<script setup lang="ts">
import type { HabitStack, TodayHabit } from '~/types/habits'
import { DIFFICULTY_META, HABIT_TYPE_META } from '~/types/habits'

const props = defineProps<{
  habits: TodayHabit[]
  stacks?: HabitStack[]
  completedCount: number
  totalCount: number
  loading: boolean
  currentDate: string
}>()

const emit = defineEmits<{
  toggle: [habitId: string, completed: boolean]
  select: [habitId: string]
  'log-with-note': [habitId: string, completed: boolean, note: string]
  'navigate-date': [direction: 'prev' | 'next']
}>()

// ─── Note modal ───────────────────────────────────────────────────────────────
const noteModalOpen = ref(false)
const noteHabitId = ref<string | null>(null)
const noteCompleted = ref(true)
const noteText = ref('')

function openNoteModal(habitId: string, completed: boolean) {
  noteHabitId.value = habitId
  noteCompleted.value = completed
  noteText.value = ''
  noteModalOpen.value = true
}

function submitNote() {
  if (!noteHabitId.value) return
  emit('log-with-note', noteHabitId.value, noteCompleted.value, noteText.value)
  noteModalOpen.value = false
  noteHabitId.value = null
  noteText.value = ''
}

const allDone = computed(() => props.totalCount > 0 && props.completedCount === props.totalCount)

const formattedDate = computed(() => {
  const d = new Date(props.currentDate + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
})

const isToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return props.currentDate === today
})

type TodayHabitRow = {
  habit: TodayHabit
  depth: number
}

function getIncomingStacks(habit: TodayHabit): HabitStack[] {
  return (props.stacks ?? []).filter((stack) => stack.newHabitId === habit.id)
}

function getOutgoingStacks(habit: TodayHabit): HabitStack[] {
  return (props.stacks ?? []).filter((stack) => stack.triggerHabitId === habit.id)
}

function isStackedHabit(habit: TodayHabit): boolean {
  return getIncomingStacks(habit).length > 0 || getOutgoingStacks(habit).length > 0
}

function getIncomingStackLabel(habit: TodayHabit): string {
  const incomingStacks = getIncomingStacks(habit)

  if (incomingStacks.length === 0) return ''
  if (incomingStacks.length === 1) {
    return `Depois de ${incomingStacks[0]?.triggerHabit?.name ?? 'outro hábito'}`
  }

  return `Depois de ${incomingStacks.length} hábitos`
}

function getOutgoingStackLabel(habit: TodayHabit): string {
  const outgoingStacks = getOutgoingStacks(habit)

  if (outgoingStacks.length === 0) return ''
  if (outgoingStacks.length === 1) {
    return `Continua com ${outgoingStacks[0]?.newHabit?.name ?? 'o próximo hábito'}`
  }

  return `Continua com ${outgoingStacks.length} hábitos`
}

const displayRows = computed<TodayHabitRow[]>(() => {
  const visibleHabits = props.habits ?? []

  if (visibleHabits.length === 0) return []

  const visibleHabitIds = new Set(visibleHabits.map((habit) => habit.id))
  const childrenByParent = new Map<string, string[]>()
  const parentsByChild = new Map<string, string[]>()

  for (const stack of props.stacks ?? []) {
    if (!visibleHabitIds.has(stack.triggerHabitId) || !visibleHabitIds.has(stack.newHabitId)) {
      continue
    }

    const parentChildren = childrenByParent.get(stack.triggerHabitId) ?? []
    if (!parentChildren.includes(stack.newHabitId)) {
      parentChildren.push(stack.newHabitId)
      childrenByParent.set(stack.triggerHabitId, parentChildren)
    }

    const childParents = parentsByChild.get(stack.newHabitId) ?? []
    if (!childParents.includes(stack.triggerHabitId)) {
      childParents.push(stack.triggerHabitId)
      parentsByChild.set(stack.newHabitId, childParents)
    }
  }

  const habitById = new Map(visibleHabits.map((habit) => [habit.id, habit] as const))
  const rows: TodayHabitRow[] = []
  const visited = new Set<string>()

  function appendHabit(habitId: string, depth: number) {
    if (visited.has(habitId)) return

    const habit = habitById.get(habitId)
    if (!habit) return

    visited.add(habitId)
    rows.push({ habit, depth })

    const childIds = childrenByParent.get(habitId) ?? []
    for (const childId of childIds) {
      appendHabit(childId, depth + 1)
    }
  }

  for (const habit of visibleHabits) {
    const visibleParents = parentsByChild.get(habit.id) ?? []
    if (visibleParents.length === 0) {
      appendHabit(habit.id, 0)
    }
  }

  for (const habit of visibleHabits) {
    appendHabit(habit.id, 0)
  }

  return rows
})
</script>

<template>
  <div class="space-y-4">
    <!-- Date navigation -->
    <div class="flex items-center justify-between">
      <UButton
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="ghost"
        size="sm"
        aria-label="Dia anterior"
        @click="emit('navigate-date', 'prev')"
      />
      <div class="text-center">
        <p class="text-sm font-medium text-highlighted capitalize">
          {{ formattedDate }}
        </p>
        <UBadge v-if="isToday" label="Hoje" variant="subtle" color="primary" size="xs" />
      </div>
      <UButton
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        size="sm"
        aria-label="Próximo dia"
        @click="emit('navigate-date', 'next')"
      />
    </div>

    <!-- Progress bar -->
    <div v-if="totalCount > 0" class="space-y-1">
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted">Progresso do dia</span>
        <span class="font-medium text-highlighted">{{ completedCount }}/{{ totalCount }}</span>
      </div>
      <UProgress
        :model-value="Number(completedCount)"
        :max="Number(totalCount)"
        size="sm"
      />
    </div>

    <!-- All done state -->
    <UCard v-if="allDone" class="text-center">
      <div class="flex flex-col items-center gap-2 py-4">
        <UIcon name="i-lucide-party-popper" class="size-10 text-primary" />
        <p class="font-medium text-highlighted">
          Parabéns! Todos os hábitos de hoje foram concluídos.
        </p>
        <p class="text-sm text-muted">
          Você está construindo a sua identidade.
        </p>
      </div>
    </UCard>

    <!-- Loading skeletons -->
    <template v-if="loading">
      <UCard v-for="i in 4" :key="i">
        <div class="flex items-center gap-3">
          <USkeleton class="size-5 rounded" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-1/3" />
          </div>
          <USkeleton class="h-5 w-12 rounded-full" />
        </div>
      </UCard>
    </template>

    <!-- Habits list -->
    <template v-else-if="habits.length > 0 && !allDone">
      <div
        v-for="row in displayRows"
        :key="row.habit.id"
        class="space-y-2"
        :style="{ marginLeft: `${row.depth * 1.25}rem` }"
      >
        <div
          v-if="row.depth > 0"
          class="flex items-center gap-2 pl-2 text-xs font-medium text-primary"
        >
          <span class="h-px w-4 bg-primary/30" />
          <UIcon name="i-lucide-corner-down-right" class="size-3.5" />
          <span>Hábito empilhado</span>
        </div>

        <UCard
          :class="[
            'cursor-pointer transition-colors hover:bg-elevated/50',
            isStackedHabit(row.habit) ? 'ring-1 ring-primary/30 bg-primary/5' : '',
            row.depth > 0 ? 'border-l-2 border-primary/30' : '',
          ]"
          @click="emit('select', row.habit.id)"
        >
          <div class="flex items-center gap-3">
            <UCheckbox
              :model-value="row.habit.log?.completed ?? false"
              @click.stop
              @update:model-value="emit('toggle', row.habit.id, $event as boolean)"
            />

            <!-- Positive/Negative indicator -->
            <UIcon
              :name="HABIT_TYPE_META[row.habit.habitType ?? 'positive'].icon"
              class="size-4 shrink-0"
              :class="row.habit.habitType === 'negative' ? 'text-error' : 'text-success'"
            />

            <div class="flex-1 min-w-0">
              <p
                class="font-medium truncate"
                :class="row.habit.log?.completed ? 'line-through text-muted' : 'text-highlighted'"
              >
                {{ row.habit.name }}
              </p>
              <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
                <UBadge
                  v-if="row.habit.identity"
                  :label="row.habit.identity.name"
                  variant="subtle"
                  color="primary"
                  size="xs"
                />
                <span v-if="row.habit.log?.note" class="text-xs text-muted italic truncate max-w-40">
                  "{{ row.habit.log.note }}"
                </span>
              </div>

              <div v-if="isStackedHabit(row.habit)" class="mt-1.5 flex flex-wrap items-center gap-1.5">
                <UBadge
                  v-if="getIncomingStacks(row.habit).length"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  <template #leading>
                    <UIcon name="i-lucide-arrow-down-left" class="size-3" />
                  </template>
                  {{ getIncomingStackLabel(row.habit) }}
                </UBadge>

                <UBadge
                  v-if="getOutgoingStacks(row.habit).length"
                  color="primary"
                  variant="subtle"
                  size="xs"
                >
                  <template #leading>
                    <UIcon name="i-lucide-arrow-up-right" class="size-3" />
                  </template>
                  {{ getOutgoingStackLabel(row.habit) }}
                </UBadge>
              </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <UBadge
                :color="DIFFICULTY_META[row.habit.difficulty].color"
                variant="subtle"
                size="xs"
              >
                <template #leading>
                  <UIcon :name="DIFFICULTY_META[row.habit.difficulty].icon" class="size-3" />
                </template>
                {{ DIFFICULTY_META[row.habit.difficulty].label }}
              </UBadge>
              <div
                v-if="row.habit.streak && row.habit.streak.currentStreak > 0"
                class="flex items-center gap-1 text-xs text-muted"
              >
                <UIcon name="i-lucide-flame" class="size-3.5 text-orange-500" />
                <span>{{ row.habit.streak.currentStreak }}</span>
              </div>

              <!-- Note action -->
              <UButton
                :icon="row.habit.log?.completed ? 'i-lucide-message-square' : 'i-lucide-message-square-plus'"
                color="neutral"
                variant="ghost"
                size="xs"
                :aria-label="row.habit.log?.completed ? 'Adicionar nota (feito)' : 'Marcar como não feito com nota'"
                @click.stop="openNoteModal(row.habit.id, !(row.habit.log?.completed ?? false))"
              />
            </div>
          </div>
        </UCard>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="!loading && habits.length === 0" class="flex flex-col items-center justify-center gap-4 py-12">
      <UIcon name="i-lucide-sun" class="size-12 text-dimmed" />
      <div class="text-center">
        <p class="font-medium text-highlighted">
          Nenhum hábito para {{ isToday ? 'hoje' : 'este dia' }}
        </p>
        <p class="text-sm text-muted">
          Crie seu primeiro hábito para começar a trilhar o caminho.
        </p>
      </div>
    </div>

    <!-- Note modal -->
    <UModal
      :open="noteModalOpen"
      title="Adicionar observação"
      @update:open="noteModalOpen = $event"
    >
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-muted">
            {{ noteCompleted ? 'Marcar como feito com observação:' : 'Marcar como não feito com observação:' }}
          </p>
          <UTextarea
            v-model="noteText"
            placeholder="O que aconteceu? O que funcionou ou não?"
            class="w-full"
            :rows="3"
          />
          <div class="flex justify-end gap-2">
            <UButton
              icon="i-lucide-x"
              label="Cancelar"
              color="neutral"
              variant="subtle"
              @click="noteModalOpen = false"
            />
            <UButton
              icon="i-lucide-check"
              label="Salvar"
              :loading="false"
              @click="submitNote"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
