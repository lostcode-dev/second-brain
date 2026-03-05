<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <NuxtLink
    to="/app"
    class="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-elevated"
  >
    <AppLogo class="w-auto h-6 shrink-0" />
    <span
      v-if="!collapsed"
      class="text-sm font-semibold text-highlighted truncate"
    >
      Second Brain
    </span>
  </NuxtLink>
</template>
