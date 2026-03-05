<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': []
}>()

const { createIdentity } = useHabits()

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  description: z.string().max(500).optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: '',
  description: ''
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const result = await createIdentity(event.data)
    if (result) {
      state.name = ''
      state.description = ''
      emit('created')
      emit('update:open', false)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    :open="props.open"
    title="Nova identidade"
    description="Quem você quer se tornar?"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nome" name="name">
          <UInput
            v-model="state.name"
            placeholder="Ex: Eu sou uma pessoa disciplinada"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Descrição (opcional)" name="description">
          <UTextarea
            v-model="state.description"
            placeholder="Descreva quem você quer se tornar..."
            class="w-full"
            :rows="2"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Cancelar"
            color="neutral"
            variant="subtle"
            @click="emit('update:open', false)"
          />
          <UButton
            label="Criar identidade"
            type="submit"
            :loading="loading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
