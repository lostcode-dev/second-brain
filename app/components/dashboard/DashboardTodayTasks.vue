<script setup lang="ts">
import type { DashboardTask } from '~/types/life-os'

defineProps<{
  tasks: DashboardTask[]
  pendingCount: number
  overdueCount: number
}>()

function priorityColor(priority: string): 'error' | 'warning' | 'info' | 'neutral' {
  if (priority === 'critical') return 'error'
  if (priority === 'high') return 'warning'
  if (priority === 'medium') return 'info'
  return 'neutral'
}

function priorityLabel(priority: string): string {
  if (priority === 'critical') return 'Crítica'
  if (priority === 'high') return 'Alta'
  if (priority === 'medium') return 'Média'
  return 'Baixa'
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza'
  }).format(new Date())
  return dueDate < today
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-check-square" class="size-5 text-primary" />
          <h3 class="text-sm font-semibold">
            Tarefas pendentes
          </h3>
        </div>
        <div class="flex items-center gap-2">
          <UBadge
            v-if="overdueCount > 0"
            color="error"
            variant="subtle"
            size="sm"
          >
            {{ overdueCount }} atrasada{{ overdueCount > 1 ? 's' : '' }}
          </UBadge>
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ pendingCount }}
          </UBadge>
        </div>
      </div>
    </template>

    <div v-if="tasks.length === 0" class="flex flex-col items-center gap-2 py-4 text-center">
      <UIcon name="i-lucide-party-popper" class="size-8 text-dimmed" />
      <p class="text-sm text-muted">
        Nenhuma tarefa pendente
      </p>
    </div>

    <ul v-else class="divide-y divide-default">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="flex items-center justify-between py-2.5"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">
            {{ task.title }}
          </p>
          <div class="flex items-center gap-2 text-xs text-muted">
            <span v-if="task.listName">{{ task.listName }}</span>
            <span v-if="task.dueDate" :class="{ 'text-error font-medium': isOverdue(task.dueDate) }">
              {{ isOverdue(task.dueDate) ? '⚠️' : '📅' }} {{ task.dueDate }}
            </span>
          </div>
        </div>
        <UBadge
          :color="priorityColor(task.priority)"
          variant="subtle"
          size="xs"
          class="ml-2 shrink-0"
        >
          {{ priorityLabel(task.priority) }}
        </UBadge>
      </li>
    </ul>

    <template v-if="tasks.length > 0" #footer>
      <NuxtLink
        to="/app/tasks"
        class="text-xs text-primary hover:underline"
      >
        Ver todas as tarefas →
      </NuxtLink>
    </template>
  </UCard>
</template>
