<script setup lang="ts">
import type { CalendarEvent } from '~/types/appointments'

const props = defineProps<{
  events: CalendarEvent[]
  loading: boolean
  currentDate: Date
}>()

const emit = defineEmits<{
  selectEvent: [event: CalendarEvent, mouseEvent: MouseEvent]
  selectSlot: [date: string, time: string, mouseEvent: MouseEvent]
  dayChange: [from: string, to: string]
}>()

const viewDate = ref(new Date(props.currentDate))

const dayStr = computed(() => formatDate(viewDate.value))

function prevDay() {
  const d = new Date(viewDate.value)
  d.setDate(d.getDate() - 1)
  viewDate.value = d
  emitRange()
}

function nextDay() {
  const d = new Date(viewDate.value)
  d.setDate(d.getDate() + 1)
  viewDate.value = d
  emitRange()
}

function goToToday() {
  viewDate.value = new Date()
  emitRange()
}

function setDate(date: Date) {
  viewDate.value = date
  emitRange()
}

function emitRange() {
  const dateStr = formatDate(viewDate.value)
  emit('dayChange', dateStr, dateStr)
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Hours grid ────────────────────────────────────────────────────────
const hours = Array.from({ length: 24 }, (_, i) => i)

const allDayEvents = computed(() =>
  props.events.filter(evt => evt.allDay && isOnDay(evt))
)

const timedEvents = computed(() =>
  props.events.filter(evt => !evt.allDay && isOnDay(evt))
)

function isOnDay(evt: CalendarEvent): boolean {
  const dayStart = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), viewDate.value.getDate())
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)
  const evtStart = new Date(evt.startAt)
  const evtEnd = new Date(evt.endAt)
  return evtStart < dayEnd && evtEnd > dayStart
}

function getEventPosition(evt: CalendarEvent): { top: string, height: string } {
  const dayStart = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), viewDate.value.getDate())
  const evtStart = new Date(evt.startAt)
  const evtEnd = new Date(evt.endAt)

  const startMinutes = Math.max(0, (evtStart.getTime() - dayStart.getTime()) / 60000)
  const endMinutes = Math.min(1440, (evtEnd.getTime() - dayStart.getTime()) / 60000)
  const duration = Math.max(endMinutes - startMinutes, 15)

  const hourHeight = 48
  const top = (startMinutes / 60) * hourHeight
  const height = (duration / 60) * hourHeight

  return {
    top: `${top}px`,
    height: `${Math.max(height, 20)}px`
  }
}

function getEventColor(evt: CalendarEvent): string {
  return evt.calendar?.color ?? '#10b981'
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function onSlotClick(hour: number, e: MouseEvent) {
  const time = `${String(hour).padStart(2, '0')}:00`
  emit('selectSlot', dayStr.value, time, e)
}

function onEventClick(evt: CalendarEvent, e: MouseEvent) {
  e.stopPropagation()
  emit('selectEvent', evt, e)
}

const isToday = computed(() => {
  const today = new Date()
  return formatDate(today) === formatDate(viewDate.value)
})

const currentTimeTop = computed(() => {
  if (!isToday.value) return null
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  return `${(minutes / 60) * 48}px`
})

onMounted(() => {
  emitRange()
})

defineExpose({ prevDay, nextDay, goToToday, setDate, viewDate })
</script>

<template>
  <div class="flex flex-col">
    <!-- Loading -->
    <div
      v-if="loading"
      class="space-y-1"
    >
      <USkeleton
        v-for="i in 12"
        :key="i"
        class="h-12 w-full"
      />
    </div>

    <div v-else>
      <!-- All-day events -->
      <div
        v-if="allDayEvents.length"
        class="mb-2 border-b border-default pb-2"
      >
        <div class="mb-1 text-xs font-medium text-muted px-12">
          Dia inteiro
        </div>
        <div class="flex flex-wrap gap-1 px-12">
          <div
            v-for="evt in allDayEvents"
            :key="evt.id"
            class="cursor-pointer rounded px-2 py-0.5 text-xs text-white truncate max-w-[200px]"
            :style="{ backgroundColor: getEventColor(evt) }"
            @click="onEventClick(evt, $event)"
          >
            {{ evt.title }}
          </div>
        </div>
      </div>

      <!-- Time grid -->
      <div class="relative overflow-y-auto" style="max-height: calc(100vh - 220px)">
        <div class="relative" style="min-height: 1152px">
          <!-- Hour rows -->
          <div
            v-for="hour in hours"
            :key="hour"
            class="flex border-b border-default/50 hover:bg-elevated/30 cursor-pointer"
            style="height: 48px"
            @click="onSlotClick(hour, $event)"
          >
            <div class="w-12 shrink-0 pr-2 pt-0 text-right text-[10px] text-muted -translate-y-1.5">
              {{ hour === 0 ? '' : `${String(hour).padStart(2, '0')}:00` }}
            </div>
            <div class="flex-1 border-l border-default/30" />
          </div>

          <!-- Current time indicator -->
          <div
            v-if="currentTimeTop"
            class="absolute left-12 right-0 z-10 flex items-center pointer-events-none"
            :style="{ top: currentTimeTop }"
          >
            <div class="size-2 rounded-full bg-red-500 -ml-1" />
            <div class="h-px flex-1 bg-red-500" />
          </div>

          <!-- Timed events -->
          <div
            v-for="evt in timedEvents"
            :key="evt.id"
            class="absolute left-14 right-2 z-[5] cursor-pointer rounded px-2 py-0.5 text-xs transition-opacity hover:opacity-90"
            :style="{
              ...getEventPosition(evt),
              backgroundColor: getEventColor(evt) + '20',
              borderLeft: `3px solid ${getEventColor(evt)}`
            }"
            @click="onEventClick(evt, $event)"
          >
            <div class="font-medium truncate" :style="{ color: getEventColor(evt) }">
              {{ evt.title }}
            </div>
            <div class="text-muted text-[10px]">
              {{ formatTime(evt.startAt) }} — {{ formatTime(evt.endAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
