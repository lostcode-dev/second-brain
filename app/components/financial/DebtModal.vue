<script setup lang="ts">
import { z } from 'zod'
import type { Debt } from '~/types/financial'

const props = defineProps<{
  open: boolean
  debt?: Debt | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const { createDebt, updateDebt } = useFinancial()

const isEdit = computed(() => !!props.debt)

const schema = z.object({
  name: z.string().min(1, 'Informe o nome da dívida'),
  description: z.string().optional(),
  totalAmount: z.number({ error: 'Informe o valor total' }).positive('O valor deve ser positivo')
})

type FormState = z.infer<typeof schema>

const state = reactive<FormState>({
  name: '',
  description: '',
  totalAmount: 0
})

const submitting = ref(false)

watch(() => props.debt, (debt) => {
  if (debt) {
    state.name = debt.name
    state.description = debt.description ?? ''
    state.totalAmount = debt.totalAmount
  }
}, { immediate: true })

watch(() => props.open, (open) => {
  if (open && !props.debt) {
    resetForm()
  }
})

function resetForm(): void {
  state.name = ''
  state.description = ''
  state.totalAmount = 0
}

async function onSubmit(): Promise<void> {
  submitting.value = true
  try {
    const payload = {
      name: state.name,
      description: state.description || undefined,
      totalAmount: state.totalAmount
    }

    let result
    if (isEdit.value && props.debt) {
      result = await updateDebt(props.debt.id, payload)
    }
    else {
      result = await createDebt(payload)
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
        {{ isEdit ? 'Editar dívida' : 'Nova dívida' }}
      </h3>
    </template>

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Nome" name="name">
          <UInput v-model="state.name" placeholder="Ex: Cartão de crédito, empréstimo..." class="w-full" />
        </UFormField>

        <UFormField label="Descrição" name="description">
          <UTextarea v-model="state.description" placeholder="Detalhes opcionais..." class="w-full" />
        </UFormField>

        <UFormField label="Valor total (R$)" name="totalAmount">
          <UInput v-model.number="state.totalAmount" type="number" step="0.01" min="0" class="w-full" />
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
