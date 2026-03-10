<script setup lang="ts">
import type { CalendarEvent } from '~/types/appointments'

const props = defineProps<{
  event: CalendarEvent | null
  position: { x: number, y: number }
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  edit: [event: CalendarEvent]
  archive: [event: CalendarEvent]
  duplicate: [event: CalendarEvent]
}>()

const popoverRef = ref<HTMLElement | null>(null)

const popoverStyle = computed(() => {
  if (!props.visible || !props.position) return { display: 'none' }

  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800
  const cardW = 320
  const cardH = 280

  let left = props.position.x + 8
  let top = props.position.y - 40

  if (left + cardW > viewportW - 16) left = props.position.x - cardW - 8
  if (top + cardH > viewportH - 16) top = viewportH - cardH - 16
  if (top < 16) top = 16
  if (left < 16) left = 16

  return {
    position: 'fixed' as const,
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 50
  }
})

function formatDateTime(dateStr: string, allDay: boolean): string {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return 'Data inválida'

  if (allDay) {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    })
  }

  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  }) + ' ' + date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getTimeRange(evt: CalendarEvent): string {
  if (evt.allDay) return 'Dia inteiro'
  const start = formatDateTime(evt.startAt, false)
  const endTime = new Date(evt.endAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${start} — ${endTime}`
}

function onClickOutside(e: MouseEvent) {
  if (popoverRef.value && !popoverRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    setTimeout(() => {
      document.addEventListener('mousedown', onClickOutside)
    }, 10)
  } else {
    document.removeEventListener('mousedown', onClickOutside)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible && event"
        ref="popoverRef"
        :style="popoverStyle"
        class="w-80 rounded-lg border border-default bg-default shadow-xl ring-1 ring-black/5"
      >
        <!-- Header with color bar -->
        <div
          class="flex items-start justify-between rounded-t-lg p-3"
          :style="{ borderTop: `3px solid ${event.calendar?.color ?? '#10b981'}` }"
        >
          <div class="min-w-0 flex-1">
            <h4 class="truncate text-sm font-semibold text-highlighted">
              {{ event.title }}
            </h4>
            <p class="mt-0.5 text-xs text-muted">
              {{ getTimeRange(event) }}
            </p>
          </div>
          <UButton
            icon="i-lucide-x"
            size="xs"
            variant="ghost"
            class="-mr-1 -mt-1 shrink-0"
            @click="emit('close')"
          />
        </div>

        <!-- Details -->
        <div class="space-y-2 px-3 pb-2">
          <div
            v-if="event.location"
            class="flex items-center gap-2 text-xs text-muted"
          >
            <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
            <span class="truncate">{{ event.location }}</span>
          </div>

          <div
            v-if="event.calendar?.name"
            class="flex items-center gap-2 text-xs text-muted"
          >
            <span
              class="inline-block size-2.5 rounded-full shrink-0"
              :style="{ backgroundColor: event.calendar.color ?? '#10b981' }"
            />
            <span class="truncate">{{ event.calendar.name }}</span>
          </div>

          <div
            v-if="event.rrule"
            class="flex items-center gap-2 text-xs text-muted"
          >
            <UIcon name="i-lucide-repeat" class="size-3.5 shrink-0" />
            <span>Recorrente</span>
          </div>

          <p
            v-if="event.description"
            class="line-clamp-2 text-xs text-muted"
          >
            {{ event.description }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 border-t border-default px-3 py-2">
          <UButton
            icon="i-lucide-pencil"
            label="Editar"
            size="xs"
            variant="ghost"
            @click="emit('edit', event)"
          />
          <UButton
            icon="i-lucide-copy"
            label="Duplicar"
            size="xs"
            variant="ghost"
            @click="emit('duplicate', event)"
          />
          <UButton
            icon="i-lucide-trash-2"
            label="Remover"
            size="xs"
            variant="ghost"
            color="error"
            @click="emit('archive', event)"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
