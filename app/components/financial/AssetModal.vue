<script setup lang="ts">
import { z } from 'zod'
import type { Asset } from '~/types/financial'

const props = defineProps<{
  open: boolean
  asset?: Asset | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const { createAsset, updateAsset } = useFinancial()

const isEdit = computed(() => !!props.asset)

const schema = z.object({
  name: z.string().min(1, 'Informe o nome do ativo'),
  description: z.string().optional(),
  value: z.number({ error: 'Informe o valor' }).min(0, 'O valor não pode ser negativo')
})

type FormState = z.infer<typeof schema>

const state = reactive<FormState>({
  name: '',
  description: '',
  value: 0
})

const submitting = ref(false)

watch(() => props.asset, (asset) => {
  if (asset) {
    state.name = asset.name
    state.description = asset.description ?? ''
    state.value = asset.value
  }
}, { immediate: true })

watch(() => props.open, (open) => {
  if (open && !props.asset) {
    resetForm()
  }
})

function resetForm(): void {
  state.name = ''
  state.description = ''
  state.value = 0
}

async function onSubmit(): Promise<void> {
  submitting.value = true
  try {
    const payload = {
      name: state.name,
      description: state.description || undefined,
      value: state.value
    }

    let result
    if (isEdit.value && props.asset) {
      result = await updateAsset(props.asset.id, payload)
    }
    else {
      result = await createAsset(payload)
    }

    if (result) {
      emit('saved')
      emit('update:open', false)
      resetForm()
    }
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #header>
      <h3 class="text-lg font-semibold">
        {{ isEdit ? 'Editar ativo' : 'Novo ativo' }}
      </h3>
    </template>

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Nome" name="name">
          <UInput v-model="state.name" placeholder="Ex: Conta no banco, investimentos..." class="w-full" />
        </UFormField>

        <UFormField label="Descrição" name="description">
          <UTextarea v-model="state.description" placeholder="Detalhes opcionais..." class="w-full" />
        </UFormField>

        <UFormField label="Valor (R$)" name="value">
          <UInput v-model.number="state.value" type="number" step="0.01" min="0" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            icon="i-lucide-x"
            label="Cancelar"
            color="neutral"
            variant="subtle"
            @click="emit('update:open', false)"
          />
          <UButton
            type="submit"
            icon="i-lucide-check"
            label="Salvar"
            :loading="submitting"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
