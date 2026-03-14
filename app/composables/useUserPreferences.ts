enum ThemeContext {
  Public = 'public',
  App = 'app'
}

enum ColorModePreference {
  Light = 'light',
  Dark = 'dark'
}

type UserPreferences = {
  primary_color: string
  neutral_color: string
  color_mode: ColorModePreference
}

type PreferencesState = {
  loaded: boolean
  primary_color: string
  neutral_color: string
  color_mode: ColorModePreference
}

type ThemePreset = UserPreferences

const PUBLIC_THEME: ThemePreset = {
  primary_color: 'green',
  neutral_color: 'zinc',
  color_mode: ColorModePreference.Dark
}

const BRAND_THEME: ThemePreset = {
  primary_color: 'emerald',
  neutral_color: 'slate',
  color_mode: ColorModePreference.Dark
}

export function useUserPreferences() {
  const state = useState<PreferencesState>('user-preferences', () => ({
    loaded: false,
    primary_color: BRAND_THEME.primary_color,
    neutral_color: BRAND_THEME.neutral_color,
    color_mode: BRAND_THEME.color_mode
  }))

  const appConfig = useAppConfig()
  const colorMode = useColorMode()

  function applyTheme(theme: ThemePreset) {
    appConfig.ui.colors.primary = theme.primary_color
    appConfig.ui.colors.neutral = theme.neutral_color
    colorMode.preference = theme.color_mode
  }

  async function load() {
    if (state.value.loaded) return

    try {
      const data = await $fetch<UserPreferences>('/api/settings/preferences')
      state.value.primary_color = data.primary_color
      state.value.neutral_color = data.neutral_color
      state.value.color_mode = data.color_mode
      state.value.loaded = true
    } catch {
      // Keep brand defaults silently when preferences cannot be loaded.
      state.value.loaded = true
    }
  }

  function applyStoredTheme() {
    applyTheme({
      primary_color: state.value.primary_color,
      neutral_color: state.value.neutral_color,
      color_mode: state.value.color_mode
    })
  }

  function applyContextTheme(context: ThemeContext) {
    if (context === ThemeContext.Public) {
      applyTheme(PUBLIC_THEME)
      return
    }

    if (!state.value.loaded) {
      applyTheme(BRAND_THEME)
      return
    }

    applyStoredTheme()
  }

  async function save(prefs: Partial<UserPreferences>) {
    if (prefs.primary_color) state.value.primary_color = prefs.primary_color
    if (prefs.neutral_color) state.value.neutral_color = prefs.neutral_color
    if (prefs.color_mode) state.value.color_mode = prefs.color_mode

    applyStoredTheme()

    try {
      await $fetch('/api/settings/preferences', {
        method: 'PUT',
        body: {
          primary_color: state.value.primary_color,
          neutral_color: state.value.neutral_color,
          color_mode: state.value.color_mode
        }
      })
    } catch {
      // Silently fail — local state already updated
    }
  }

  async function setPrimaryColor(color: string) {
    await save({ primary_color: color })
  }

  async function setNeutralColor(color: string) {
    await save({ neutral_color: color })
  }

  async function setColorMode(mode: string) {
    await save({ color_mode: mode as ColorModePreference })
  }

  return {
    state: readonly(state),
    applyBrandTheme: () => applyContextTheme(ThemeContext.App),
    applyPublicTheme: () => applyContextTheme(ThemeContext.Public),
    applyStoredTheme,
    load,
    setPrimaryColor,
    setNeutralColor,
    setColorMode
  }
}
