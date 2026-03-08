<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8" style="padding-top: max(2rem, var(--safe-area-top)); padding-bottom: max(2rem, var(--safe-area-bottom));">
    <UButton
      icon="i-lucide-chevron-left"
      to="/"
      size="xl"
      color="neutral"
      variant="subtle"
      class="absolute left-4 top-4 sm:left-8 sm:top-8 rounded-full z-10"
    />

    <UPageCard
      variant="subtle"
      class="max-w-sm w-full"
    >
      <slot />
    </UPageCard>
  </div>
</template>
