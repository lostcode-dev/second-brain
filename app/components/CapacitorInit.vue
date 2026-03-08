<script setup lang="ts">
/**
 * Composable that initializes Capacitor plugins when running as a native app.
 * Handles: status bar, keyboard, back button, splash screen.
 */
import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()

onMounted(async () => {
  if (!isNative) return

  const { StatusBar, Style } = await import('@capacitor/status-bar')
  const { Keyboard } = await import('@capacitor/keyboard')
  const { SplashScreen } = await import('@capacitor/splash-screen')
  const { App } = await import('@capacitor/app')

  const colorMode = useColorMode()

  // Status bar config
  await StatusBar.setStyle({
    style: colorMode.value === 'dark' ? Style.Dark : Style.Light
  })

  // Watch for color mode changes
  watch(() => colorMode.value, async (mode) => {
    await StatusBar.setStyle({
      style: mode === 'dark' ? Style.Dark : Style.Light
    })
  })

  // Keyboard push content up
  Keyboard.addListener('keyboardWillShow', () => {
    document.body.classList.add('keyboard-open')
  })
  Keyboard.addListener('keyboardWillHide', () => {
    document.body.classList.remove('keyboard-open')
  })

  // Handle hardware back button
  const router = useRouter()
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      router.back()
    } else {
      App.exitApp()
    }
  })

  // Hide splash screen
  await SplashScreen.hide()
})
</script>

<template>
  <slot />
</template>
