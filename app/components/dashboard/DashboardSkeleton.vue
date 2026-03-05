<script setup lang="ts">
</script>

<template>
  <div class="space-y-6 p-4 md:p-6">
    <!-- Header skeleton -->
    <div class="flex items-center justify-between">
      <USkeleton class="h-6 w-40" />
      <USkeleton class="h-5 w-24" />
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <USkeleton v-for="i in 4" :key="i" class="h-24 w-full rounded-lg" />
    </div>

    <!-- Cards grid -->
    <div class="grid gap-4 md:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-52 w-full rounded-lg" />
    </div>

    <!-- Insights section -->
    <div class="grid gap-4 md:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-44 w-full rounded-lg" />
    </div>
  </div>
</template>
