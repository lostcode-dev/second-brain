<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Habit } from "~/types/habits";
import { HabitFrequency, HabitDifficulty, HabitType } from "~/types/habits";

const DESCRIPTION_MAX_LENGTH = 5000;

const props = defineProps<{
  open: boolean;
  habit: Habit;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  updated: [];
  identityModalOpen: [value: boolean];
}>();

const {
  updateHabit,
  frequencyOptions,
  difficultyOptions,
  habitTypeOptions,
  dayOptions,
  identities,
} = useHabits();

const schema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório").max(200),
    description: z.string().max(DESCRIPTION_MAX_LENGTH).optional(),
    frequency: z.nativeEnum(HabitFrequency),
    difficulty: z.nativeEnum(HabitDifficulty),
    habitType: z.nativeEnum(HabitType),
    identityId: z.string().uuid().optional(),
    customDays: z.array(z.number().int().min(0).max(6)).optional(),
  })
  .refine(
    (data) =>
      data.frequency !== HabitFrequency.Custom ||
      (data.customDays && data.customDays.length > 0),
    { message: "Selecione ao menos um dia", path: ["customDays"] },
  );

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: "",
  description: "",
  frequency: HabitFrequency.Daily,
  difficulty: HabitDifficulty.Normal,
  habitType: HabitType.Positive,
  identityId: undefined,
  customDays: [],
});

watch(
  () => props.habit,
  (habit) => {
    if (habit) {
      state.name = habit.name;
      state.description = habit.description ?? "";
      state.frequency = habit.frequency;
      state.difficulty = habit.difficulty;
      state.habitType = habit.habitType ?? HabitType.Positive;
      state.identityId = habit.identityId ?? undefined;
      state.customDays = habit.customDays ?? [];
    }
  },
  { immediate: true },
);

const loading = ref(false);

const NONE_IDENTITY_VALUE = "__none__";

const identityIdModel = computed<string | undefined>({
  get: () => state.identityId,
  set: (value) => {
    state.identityId = value === NONE_IDENTITY_VALUE ? undefined : value;
  },
});

function normalizeDescription(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (loading.value) return;
  loading.value = true;
  try {
    const result = await updateHabit(props.habit.id, {
      ...event.data,
      description: normalizeDescription(event.data.description) ?? null,
    });
    if (result) {
      emit("updated");
      emit("update:open", false);
    }
  } finally {
    loading.value = false;
  }
}

function onClose() {
  emit("update:open", false);
}

function toggleDay(day: number) {
  if (!state.customDays) state.customDays = [];
  const idx = state.customDays.indexOf(day);
  if (idx >= 0) {
    state.customDays.splice(idx, 1);
  } else {
    state.customDays.push(day);
  }
}

const identityItems = computed(() => {
  return [
    { label: "Nenhuma", value: NONE_IDENTITY_VALUE },
    ...(identities.value ?? []).map((i) => ({ label: i.name, value: i.id })),
  ];
});

function getHabitDifficultyIcon(difficulty: HabitDifficulty) {
  switch (difficulty) {
    case HabitDifficulty.Tiny:
      return "i-lucide-feather";
    case HabitDifficulty.Normal:
      return "i-lucide-shield";
    case HabitDifficulty.Hard:
      return "i-lucide-mountain";
    default:
      return "";
  }
}

function getHabitTypeIcon(habitType: HabitType) {
  switch (habitType) {
    case HabitType.Positive:
      return "i-lucide-thumbs-up";
    case HabitType.Negative:
      return "i-lucide-thumbs-down";
    default:
      return "";
  }
}
</script>

<template>
  <UModal
    :open="props.open"
    title="Editar hábito"
    description="Ajuste o hábito para continuar evoluindo."
    @update:open="onClose"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nome" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField label="Descrição" name="description">
          <RichTextEditor
            v-model="state.description"
            placeholder="Por que esse hábito é importante?"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Frequência" name="frequency">
          <USelect
            v-model="state.frequency"
            :items="frequencyOptions"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-if="state.frequency === HabitFrequency.Custom"
          label="Dias da semana"
          name="customDays"
        >
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="day in dayOptions"
              :key="day.value"
              :label="day.label"
              size="sm"
              :color="
                state.customDays?.includes(day.value) ? 'primary' : 'neutral'
              "
              :variant="
                state.customDays?.includes(day.value) ? 'solid' : 'outline'
              "
              @click="toggleDay(day.value)"
            />
          </div>
        </UFormField>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Dificuldade" name="difficulty">
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="opt in difficultyOptions"
                :key="opt.value"
                type="button"
                :label="opt.label"
                size="sm"
                :icon="getHabitDifficultyIcon(opt.value)"
                :color="state.difficulty === opt.value ? 'primary' : 'neutral'"
                :variant="state.difficulty === opt.value ? 'solid' : 'outline'"
                @click="state.difficulty = opt.value"
              />
            </div>
          </UFormField>

          <UFormField label="Tipo" name="habitType">
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="opt in habitTypeOptions"
                :key="opt.value"
                type="button"
                :label="opt.label"
                :icon="getHabitTypeIcon(opt.value)"
                size="sm"
                :color="state.habitType === opt.value ? (opt.value === HabitType.Positive ? 'success' : 'error') : 'neutral'"
                :variant="state.habitType === opt.value ? 'solid' : 'outline'"
                @click="state.habitType = opt.value"
              />
            </div>
          </UFormField>
        </div>

        <div class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
          <UFormField label="Identidade" name="identityId" class="min-w-0">
            <USelect
              v-model="identityIdModel"
              :items="identityItems"
              value-key="value"
              placeholder="Quem você quer se tornar?"
              class="w-full"
            />
          </UFormField>

          <UButton
            icon="i-lucide-user-plus"
            color="neutral"
            variant="subtle"
            size="md"
            type="button"
            class="self-end"
            aria-label="Gerenciar identidades"
            @click="emit('identityModalOpen', true)"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            icon="i-lucide-x"
            label="Cancelar"
            type="button"
            color="neutral"
            variant="subtle"
            @click="onClose"
          />
          <UButton
            icon="i-lucide-check"
            label="Salvar"
            type="submit"
            :loading="loading"
            :disabled="loading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
