<script setup lang="ts">
import type { Calendar } from '~/types/appointments'

const props = defineProps<{
  visible: boolean
  position: { x: number, y: number }
  date: string
  calendars: Calendar[] | null | undefined
}>()

const emit = defineEmits<{
  close: []
  create: [payload: { title: string, date: string, calendarId: string }]
  moreOptions: [date: string]
}>()

const popoverRef = ref<HTMLElement | null>(null)
const title = ref('')
const calendarId = ref('')

const popoverStyle = computed(() => {
  if (!props.visible) return { display: 'none' }

  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800
  const cardW = 300
  const cardH = 200

  let left = props.position.x + 8
  let top = props.position.y - 20

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

const dateLabel = computed(() => {
  if (!props.date) return ''
  const [year, month, day] = props.date.split('-').map(Number)
  const d = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  })
})

const calendarOptions = computed(() =>
  (props.calendars ?? []).map(c => ({ label: c.name, value: c.id }))
)

watch(() => props.visible, (val) => {
  if (val) {
    title.value = ''
    if (props.calendars?.length && !calendarId.value) {
      calendarId.value = props.calendars[0]?.id ?? ''
    }
    setTimeout(() => {
      document.addEventListener('mousedown', onClickOutside)
    }, 10)
  } else {
    document.removeEventListener('mousedown', onClickOutside)
  }
})

function onClickOutside(e: MouseEvent) {
  if (popoverRef.value && !popoverRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

function onQuickCreate() {
  if (!title.value.trim()) return

  emit('create', {
    title: title.value.trim(),
    date: props.date,
    calendarId: calendarId.value
  })

  title.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    onQuickCreate()
  }
  if (e.key === 'Escape') {
    emit('close')
  }
}

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
        v-if="visible"
        ref="popoverRef"
        :style="popoverStyle"
        class="w-[300px] rounded-lg border border-default bg-default shadow-xl ring-1 ring-black/5"
      >
        <div class="p-3 space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium capitalize text-muted">
              {{ dateLabel }}
            </p>
            <UButton
              icon="i-lucide-x"
              size="xs"
              variant="ghost"
              class="-mr-1 -mt-1"
              @click="emit('close')"
            />
          </div>

          <UInput
            v-model="title"
            placeholder="Adicionar título"
            autofocus
            class="w-full"
            size="sm"
            @keydown="onKeydown"
          />

          <USelect
            v-if="calendarOptions.length > 1"
            v-model="calendarId"
            :items="calendarOptions"
            placeholder="Calendário"
            size="sm"
            class="w-full"
          />

          <div class="flex items-center justify-between gap-2 pt-1">
            <UButton
              label="Mais opções"
              size="xs"
              variant="ghost"
              icon="i-lucide-settings-2"
              @click="emit('moreOptions', date)"
            />
            <UButton
              label="Salvar"
              size="xs"
              :disabled="!title.trim()"
              @click="onQuickCreate"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
