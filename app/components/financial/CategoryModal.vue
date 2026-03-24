<script setup lang="ts">
import { z } from 'zod'
import type { FinancialCategory } from '~/types/financial'
import { TransactionType } from '~/types/financial'

const props = defineProps<{
  open: boolean
  category?: FinancialCategory | null
  defaultType?: TransactionType
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

const { createCategory, updateCategory, transactionTypeOptions } = useFinancial()

const isEdit = computed(() => !!props.category)

const schema = z.object({
  name: z.string().min(1, 'Informe o nome da categoria'),
  type: z.nativeEnum(TransactionType),
  icon: z.string().optional(),
  color: z.string().optional()
})

type FormState = z.infer<typeof schema>

const state = reactive<FormState>({
  name: '',
  type: props.defaultType ?? TransactionType.Expense,
  icon: '',
  color: ''
})

const submitting = ref(false)

watch(() => props.category, (category) => {
  if (category) {
    state.name = category.name
    state.type = category.type
    state.icon = category.icon ?? ''
    state.color = category.color ?? ''
  }
}, { immediate: true })

watch(() => props.open, (open) => {
  if (open && !props.category) {
    state.name = ''
    state.type = props.defaultType ?? TransactionType.Expense
    state.icon = ''
    state.color = ''
  }
})

async function onSubmit(): Promise<void> {
  submitting.value = true
  try {
    if (isEdit.value && props.category) {
      const result = await updateCategory(props.category.id, {
        name: state.name,
        icon: state.icon || undefined,
        color: state.color || undefined
      })
      if (result) {
        emit('saved')
        emit('update:open', false)
      }
    } else {
      const result = await createCategory({
        name: state.name,
        type: state.type as TransactionType,
        icon: state.icon || undefined,
        color: state.color || undefined
      })
      if (result) {
        emit('saved')
        emit('update:open', false)
      }
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #header>
      <h3 class="text-lg font-semibold">
        {{ isEdit ? 'Editar categoria' : 'Nova categoria' }}
      </h3>
    </template>

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nome" name="name">
          <UInput v-model="state.name" placeholder="Ex: Moradia, Alimentação..." class="w-full" />
        </UFormField>

        <UFormField v-if="!isEdit" label="Tipo" name="type">
          <USelect
            v-model="state.type"
            :items="transactionTypeOptions"
            value-key="value"
            class="w-full"
          />
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
