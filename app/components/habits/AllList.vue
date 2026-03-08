<script setup lang="ts">
import type { Habit, HabitStack, HabitTreeNode } from '~/types/habits'

const props = defineProps<{
  habits: Habit[]
  stacks: HabitStack[]
  total: number
  page: number
  pageSize: number
  loading: boolean
}>()

const emit = defineEmits<{
  'update:page': [value: number]
  'select': [habitId: string]
  'edit': [habit: Habit]
  'stack': [habit: Habit]
  'remove-stacks': [habit: Habit]
  'archive': [habit: Habit]
}>()

const habitTrees = computed<HabitTreeNode[]>(() => {
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
  const roots: HabitTreeNode[] = []
  const visited = new Set<string>()

  function buildNode(habitId: string): HabitTreeNode | null {
    if (visited.has(habitId)) return null

    const habit = habitById.get(habitId)
    if (!habit) return null

    visited.add(habitId)

    const childIds = childrenByParent.get(habitId) ?? []
    const children = childIds
      .map((childId) => buildNode(childId))
      .filter((child): child is HabitTreeNode => child !== null)

    return { habit, children }
  }

  for (const habit of visibleHabits) {
    const visibleParents = parentsByChild.get(habit.id) ?? []
    if (visibleParents.length === 0) {
      const root = buildNode(habit.id)
      if (root) roots.push(root)
    }
  }

  for (const habit of visibleHabits) {
    const root = buildNode(habit.id)
    if (root) roots.push(root)
  }

  return roots
})
</script>

<template>
  <div class="space-y-4">
    <!-- Loading skeletons -->
    <template v-if="loading">
      <UCard v-for="i in 6" :key="i">
        <div class="flex items-center gap-3">
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-3 w-1/3" />
          </div>
          <USkeleton class="h-5 w-16 rounded-full" />
          <USkeleton class="h-5 w-14 rounded-full" />
        </div>
      </UCard>
    </template>

    <!-- Habits list -->
    <template v-else-if="habits.length > 0">
      <div class="space-y-4">
        <HabitsAllTreeItem
          v-for="(tree, index) in habitTrees"
          :key="tree.habit.id"
          :node="tree"
          :stacks="stacks"
          :is-last="index === habitTrees.length - 1"
          :ancestor-has-next="[]"
          @select="emit('select', $event)"
          @edit="emit('edit', $event)"
          @stack="emit('stack', $event)"
          @remove-stacks="emit('remove-stacks', $event)"
          @archive="emit('archive', $event)"
        />
      </div>
    </template>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center gap-4 py-12">
      <UIcon name="i-lucide-inbox" class="size-12 text-dimmed" />
      <div class="text-center">
        <p class="font-medium text-highlighted">
          Nenhum hábito encontrado
        </p>
        <p class="text-sm text-muted">
          Ajuste os filtros ou crie um novo hábito.
        </p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="flex justify-center pt-2">
      <UPagination
        :default-page="page"
        :items-per-page="pageSize"
        :total="total"
        @update:page="emit('update:page', $event)"
      />
    </div>
  </div>
</template>
