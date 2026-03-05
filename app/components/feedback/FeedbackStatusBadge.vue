<script setup lang="ts">
import type { FeedbackStatus } from '~/types/feedback'
import { feedbackStatusLabels, feedbackStatusColors } from '~/types/feedback'

const props = defineProps<{
  status: FeedbackStatus
}>()

const label = computed(() => feedbackStatusLabels[props.status] ?? props.status)
const color = computed(() => feedbackStatusColors[props.status] ?? 'neutral')
</script>

<template>
  <UBadge
    :label="label"
    :color="color"
    variant="subtle"
    size="sm"
  />
</template>
