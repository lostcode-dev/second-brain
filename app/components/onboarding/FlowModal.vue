<script setup lang="ts">
import {
  ONBOARDING_STEPS,
  type OnboardingExperienceLevel,
  type OnboardingGuidanceStyle,
  type OnboardingPrimaryGoal,
  type OnboardingStep
} from '~/types/onboarding'

const { user } = useAuth()
const {
  close,
  completeAndStartFirstHabit,
  continueLater,
  isCompleted,
  load,
  open,
  saveProgress,
  state
} = useOnboarding()

const profile = reactive<{
  primaryGoal: OnboardingPrimaryGoal | null
  experienceLevel: OnboardingExperienceLevel | null
  guidanceStyle: OnboardingGuidanceStyle | null
}>({
  primaryGoal: null,
  experienceLevel: null,
  guidanceStyle: null
})

const selectedTimezone = ref('UTC')

const goalOptions = [
  {
    value: 'consistency' as const,
    label: 'Criar constância',
    description: 'Quero manter hábitos simples sem perder ritmo.'
  },
  {
    value: 'productivity' as const,
    label: 'Organizar rotina',
    description: 'Quero estruturar melhor o meu dia.'
  },
  {
    value: 'wellbeing' as const,
    label: 'Cuidar de mim',
    description: 'Quero melhorar energia, saúde e bem-estar.'
  },
  {
    value: 'identity' as const,
    label: 'Mudar identidade',
    description: 'Quero reforçar quem eu quero me tornar.'
  }
]

const experienceOptions = [
  {
    value: 'new' as const,
    label: 'Primeira vez',
    description: 'Ainda estou começando a organizar meus hábitos.'
  },
  {
    value: 'returning' as const,
    label: 'Já tentei antes',
    description: 'Preciso voltar a ter consistência.'
  },
  {
    value: 'structured' as const,
    label: 'Já tenho método',
    description: 'Quero um sistema melhor para acompanhar.'
  }
]

const guidanceOptions = [
  {
    value: 'guided' as const,
    label: 'Mais guiado',
    description: 'Prefiro passos mais claros e sugeridos.'
  },
  {
    value: 'flexible' as const,
    label: 'Mais flexível',
    description: 'Prefiro ajustar o sistema do meu jeito.'
  }
]

const timezoneOptions = computed(() => {
  const builtInTimezones = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : ['UTC', 'America/Fortaleza', 'America/Sao_Paulo', 'America/New_York', 'Europe/London']
  const browserTimezone = import.meta.client
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    : 'UTC'

  return Array.from(new Set([...builtInTimezones, browserTimezone, state.value.timezone]))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map(timezone => ({
      label: timezone,
      value: timezone
    }))
})

const currentStep = computed<OnboardingStep>(() => state.value.onboarding.currentStep)
const currentStepIndex = computed(() => ONBOARDING_STEPS.indexOf(currentStep.value))
const isFirstStep = computed(() => currentStepIndex.value <= 0)
const isLastStep = computed(() => currentStep.value === 'first_action')
const isOpen = computed({
  get: () => state.value.open,
  set: (value: boolean) => {
    if (!value)
      close()
  }
})

const canAdvance = computed(() => {
  if (currentStep.value !== 'profile')
    return true

  return Boolean(
    profile.primaryGoal
    && profile.experienceLevel
    && profile.guidanceStyle
  )
})

function hydrateLocalState() {
  profile.primaryGoal = state.value.onboarding.profile.primaryGoal
  profile.experienceLevel = state.value.onboarding.profile.experienceLevel
  profile.guidanceStyle = state.value.onboarding.profile.guidanceStyle
  selectedTimezone.value = state.value.timezone
}

function getNextStep(step: OnboardingStep): OnboardingStep {
  const index = ONBOARDING_STEPS.indexOf(step)
  return ONBOARDING_STEPS[Math.min(index + 1, ONBOARDING_STEPS.length - 1)]!
}

function getPreviousStep(step: OnboardingStep): OnboardingStep {
  const index = ONBOARDING_STEPS.indexOf(step)
  return ONBOARDING_STEPS[Math.max(index - 1, 0)]!
}

async function persistCurrentStep(targetStep: OnboardingStep) {
  await saveProgress({
    currentStep: targetStep,
    profile: {
      primaryGoal: profile.primaryGoal,
      experienceLevel: profile.experienceLevel,
      guidanceStyle: profile.guidanceStyle
    },
    status: 'in_progress',
    timezone: selectedTimezone.value
  })
}

async function onNext() {
  if (isLastStep.value) {
    await completeAndStartFirstHabit({
      profile: {
        primaryGoal: profile.primaryGoal,
        experienceLevel: profile.experienceLevel,
        guidanceStyle: profile.guidanceStyle
      },
      timezone: selectedTimezone.value
    })

    await navigateTo('/app/habits')
    return
  }

  const nextStep = getNextStep(currentStep.value)
  await persistCurrentStep(nextStep)
}

async function onPrevious() {
  if (isFirstStep.value)
    return

  const previousStep = getPreviousStep(currentStep.value)
  await persistCurrentStep(previousStep)
}

async function onContinueLater() {
  await continueLater({
    currentStep: currentStep.value,
    profile: {
      primaryGoal: profile.primaryGoal,
      experienceLevel: profile.experienceLevel,
      guidanceStyle: profile.guidanceStyle
    },
    timezone: selectedTimezone.value
  })
}

onMounted(async () => {
  await load()
  hydrateLocalState()

  if (!isCompleted.value)
    open()
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :prevent-close="true"
    :ui="{ content: 'max-w-3xl' }"
  >
    <template #content>
      <UCard class="border-default/70 bg-elevated/70">
        <template #header>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="space-y-1">
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-primary">
                Onboarding inicial
              </p>
              <h2 class="text-xl font-semibold text-highlighted">
                {{ currentStepIndex + 1 }} de {{ ONBOARDING_STEPS.length }}
              </h2>
            </div>

            <UBadge color="neutral" variant="subtle" size="lg">
              Menos de 2 minutos
            </UBadge>
          </div>
        </template>

        <div v-if="currentStep === 'welcome'" class="space-y-6">
          <div class="space-y-3">
            <h3 class="text-2xl font-semibold text-highlighted">
              Boas-vindas{{ user?.user_metadata?.name ? `, ${String(user.user_metadata.name)}` : '' }}
            </h3>
            <p class="text-base text-muted">
              Vamos configurar o essencial para você começar rápido. A ideia é entender seu perfil, ajustar o mínimo necessário e te levar direto para a criação do primeiro hábito.
            </p>
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <UCard>
              <p class="text-sm font-medium text-highlighted">
                Perfil
              </p>
              <p class="mt-2 text-sm text-muted">
                Entender o seu objetivo principal e o nível de orientação ideal.
              </p>
            </UCard>

            <UCard>
              <p class="text-sm font-medium text-highlighted">
                Configuração mínima
              </p>
              <p class="mt-2 text-sm text-muted">
                Ajustar timezone para agenda, hábitos e notificações funcionarem certo.
              </p>
            </UCard>

            <UCard>
              <p class="text-sm font-medium text-highlighted">
                Primeira ação
              </p>
              <p class="mt-2 text-sm text-muted">
                Ir para Hábitos e começar com um fluxo guiado de criação.
              </p>
            </UCard>
          </div>
        </div>

        <div v-else-if="currentStep === 'profile'" class="space-y-6">
          <div class="space-y-2">
            <h3 class="text-2xl font-semibold text-highlighted">
              Entender seu perfil
            </h3>
            <p class="text-sm text-muted">
              São escolhas rápidas para adaptar o produto ao seu momento atual.
            </p>
          </div>

          <div class="space-y-5">
            <div class="space-y-3">
              <p class="text-sm font-medium text-highlighted">
                Qual é o principal objetivo agora?
              </p>
              <div class="grid gap-3 md:grid-cols-2">
                <button
                  v-for="option in goalOptions"
                  :key="option.value"
                  type="button"
                  class="rounded-xl border px-4 py-4 text-left transition"
                  :class="profile.primaryGoal === option.value ? 'border-primary bg-primary/10' : 'border-default hover:border-primary/60'"
                  @click="profile.primaryGoal = option.value"
                >
                  <p class="font-medium text-highlighted">
                    {{ option.label }}
                  </p>
                  <p class="mt-1 text-sm text-muted">
                    {{ option.description }}
                  </p>
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <p class="text-sm font-medium text-highlighted">
                Como você está chegando no Kortex?
              </p>
              <div class="grid gap-3 md:grid-cols-3">
                <button
                  v-for="option in experienceOptions"
                  :key="option.value"
                  type="button"
                  class="rounded-xl border px-4 py-4 text-left transition"
                  :class="profile.experienceLevel === option.value ? 'border-primary bg-primary/10' : 'border-default hover:border-primary/60'"
                  @click="profile.experienceLevel = option.value"
                >
                  <p class="font-medium text-highlighted">
                    {{ option.label }}
                  </p>
                  <p class="mt-1 text-sm text-muted">
                    {{ option.description }}
                  </p>
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <p class="text-sm font-medium text-highlighted">
                Qual estilo de orientação funciona melhor?
              </p>
              <div class="grid gap-3 md:grid-cols-2">
                <button
                  v-for="option in guidanceOptions"
                  :key="option.value"
                  type="button"
                  class="rounded-xl border px-4 py-4 text-left transition"
                  :class="profile.guidanceStyle === option.value ? 'border-primary bg-primary/10' : 'border-default hover:border-primary/60'"
                  @click="profile.guidanceStyle = option.value"
                >
                  <p class="font-medium text-highlighted">
                    {{ option.label }}
                  </p>
                  <p class="mt-1 text-sm text-muted">
                    {{ option.description }}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentStep === 'minimum_setup'" class="space-y-6">
          <div class="space-y-2">
            <h3 class="text-2xl font-semibold text-highlighted">
              Configuração mínima
            </h3>
            <p class="text-sm text-muted">
              O essencial aqui é o timezone. Ele afeta agenda, hábitos, revisões e notificações.
            </p>
          </div>

          <UFormField
            label="Timezone"
            description="Use o fuso que representa a rotina real do usuário."
          >
            <USelectMenu
              v-model="selectedTimezone"
              :items="timezoneOptions"
              value-key="value"
              searchable
              class="w-full"
            />
          </UFormField>

          <UCard>
            <p class="text-sm text-muted">
              Se quiser, isso pode ser alterado depois em <strong>Configurações</strong>.
            </p>
          </UCard>
        </div>

        <div v-else-if="currentStep === 'product_tour'" class="space-y-6">
          <div class="space-y-2">
            <h3 class="text-2xl font-semibold text-highlighted">
              Como o produto funciona
            </h3>
            <p class="text-sm text-muted">
              O fluxo é simples: criar, executar, revisar e melhorar com base nos sinais da própria rotina.
            </p>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <UCard>
              <p class="font-medium text-highlighted">
                Hoje
              </p>
              <p class="mt-2 text-sm text-muted">
                É a operação diária. Você vê o que precisa fazer e registra a execução.
              </p>
            </UCard>

            <UCard>
              <p class="font-medium text-highlighted">
                Todos
              </p>
              <p class="mt-2 text-sm text-muted">
                É a visão completa do sistema de hábitos, com busca, filtros e organização.
              </p>
            </UCard>

            <UCard>
              <p class="font-medium text-highlighted">
                Revisão
              </p>
              <p class="mt-2 text-sm text-muted">
                É onde você aprende com a semana e ajusta o que precisa melhorar.
              </p>
            </UCard>

            <UCard>
              <p class="font-medium text-highlighted">
                Insights
              </p>
              <p class="mt-2 text-sm text-muted">
                É onde o sistema mostra padrões, consistência e sinais de evolução.
              </p>
            </UCard>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div class="space-y-2">
            <h3 class="text-2xl font-semibold text-highlighted">
              Primeira ação
            </h3>
            <p class="text-sm text-muted">
              Agora vamos te levar para a criação do primeiro hábito. O fluxo seguinte vai te mostrar o botão certo e depois o formulário por dentro.
            </p>
          </div>

          <UCard>
            <div class="space-y-3 text-sm text-muted">
              <p>1. Abrir a tela de Hábitos.</p>
              <p>2. Destacar o botão de criação do primeiro hábito.</p>
              <p>3. Guiar você dentro do formulário para preencher os campos principais.</p>
            </div>
          </UCard>
        </div>

        <template #footer>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <UButton
              color="neutral"
              variant="ghost"
              label="Continuar depois"
              @click="onContinueLater"
            />

            <div class="flex items-center justify-end gap-2">
              <UButton
                v-if="!isFirstStep"
                color="neutral"
                variant="subtle"
                label="Anterior"
                @click="onPrevious"
              />
              <UButton
                :label="isLastStep ? 'Ir para hábitos' : 'Próximo'"
                :disabled="!canAdvance"
                @click="onNext"
              />
            </div>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
