<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}>(), {
  modelValue: undefined,
  placeholder: 'HH:mm',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const popoverOpen = ref(false)

const selectedHour = computed(() => {
  if (!props.modelValue) return null
  return props.modelValue.split(':')[0] ?? null
})

const selectedMinute = computed(() => {
  if (!props.modelValue) return null
  return props.modelValue.split(':')[1] ?? null
})

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

function selectHour(hour: string) {
  const min = selectedMinute.value ?? '00'
  emit('update:modelValue', `${hour}:${min}`)
}

function selectMinute(minute: string) {
  const hr = selectedHour.value ?? '00'
  emit('update:modelValue', `${hr}:${minute}`)
}

function clear() {
  emit('update:modelValue', undefined)
  popoverOpen.value = false
}

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue
})

const hourListRef = ref<HTMLElement | null>(null)
const minuteListRef = ref<HTMLElement | null>(null)

watch(popoverOpen, async (open) => {
  if (!open) return
  await nextTick()
  scrollToSelected()
})

function scrollToSelected() {
  if (selectedHour.value && hourListRef.value) {
    const el = hourListRef.value.querySelector(`[data-hour="${selectedHour.value}"]`)
    el?.scrollIntoView({ block: 'center' })
  }
  if (selectedMinute.value && minuteListRef.value) {
    const el = minuteListRef.value.querySelector(`[data-minute="${selectedMinute.value}"]`)
    el?.scrollIntoView({ block: 'center' })
  }
}
</script>

<template>
  <UPopover v-model:open="popoverOpen" :content="{ align: 'start' }">
    <UButton
      :label="displayValue || placeholder"
      icon="i-lucide-clock"
      color="neutral"
      variant="outline"
      block
      class="justify-start font-normal"
      :class="{ 'text-muted': !displayValue }"
      :disabled="disabled"
    />

    <template #content>
      <div class="flex w-56">
        <!-- Hours -->
        <div class="flex-1 border-r border-default">
          <p class="px-2 py-1.5 text-xs font-medium text-muted text-center">Hora</p>
          <div ref="hourListRef" class="h-48 overflow-y-auto">
            <button
              v-for="hour in hours"
              :key="hour"
              :data-hour="hour"
              type="button"
              class="w-full px-3 py-1.5 text-sm text-center transition-colors hover:bg-elevated"
              :class="selectedHour === hour ? 'bg-primary/10 text-primary font-semibold' : 'text-highlighted'"
              @click="selectHour(hour)"
            >
              {{ hour }}
            </button>
          </div>
        </div>

        <!-- Minutes -->
        <div class="flex-1">
          <p class="px-2 py-1.5 text-xs font-medium text-muted text-center">Min</p>
          <div ref="minuteListRef" class="h-48 overflow-y-auto">
            <button
              v-for="minute in minutes"
              :key="minute"
              :data-minute="minute"
              type="button"
              class="w-full px-3 py-1.5 text-sm text-center transition-colors hover:bg-elevated"
              :class="selectedMinute === minute ? 'bg-primary/10 text-primary font-semibold' : 'text-highlighted'"
              @click="selectMinute(minute)"
            >
              {{ minute }}
            </button>
          </div>
        </div>
      </div>

      <!-- Clear button -->
      <div class="border-t border-default p-1.5">
        <UButton
          label="Limpar"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          block
          @click="clear"
        />
      </div>
    </template>
  </UPopover>
</template>
