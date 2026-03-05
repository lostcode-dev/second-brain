<script setup lang="ts">
import { h, resolveComponent } from 'vue'

definePageMeta({
  layout: 'app'
})

const toast = useToast()

// ─── Subscription ────────────────────────────────────────
type Subscription = {
  status: string
  price_id: string | null
  quantity: number | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  canceled_at: string | null
}

type BillingStatusResponse = {
  hasAccess: boolean
  subscription: Subscription | null
}

const { data, status, refresh } = await useAsyncData(
  'billing-subscription',
  () => $fetch<BillingStatusResponse>('/api/billing/status')
)

const isCancelling = ref(false)

async function cancelAtPeriodEnd() {
  if (isCancelling.value) return

  isCancelling.value = true
  try {
    await $fetch('/api/billing/cancel', { method: 'POST' })
    toast.add({ title: 'Assinatura', description: 'Cancelamento agendado para o fim do período.', color: 'success' })

    for (let attempt = 0; attempt < 3; attempt++) {
      await refresh()
      if (data.value?.subscription?.cancel_at_period_end) break
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string }, statusMessage?: string }
    const message = err?.data?.statusMessage || err?.statusMessage || 'Não foi possível cancelar a assinatura'
    toast.add({ title: 'Erro', description: message, color: 'error' })
  } finally {
    isCancelling.value = false
  }
}

function formatDate(date: string | null): string {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('pt-BR')
  } catch {
    return date
  }
}

async function openPortal() {
  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/portal', { method: 'POST' })
    await navigateTo(url, { external: true })
  } catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string }, statusMessage?: string }
    const message = err?.data?.statusMessage || err?.statusMessage || 'Não foi possível abrir o portal'
    toast.add({ title: 'Erro', description: message, color: 'error' })
  }
}

// ─── Invoices (Faturamento) ──────────────────────────────
type InvoiceItem = {
  stripe_invoice_id: string
  status: string | null
  currency: string | null
  total: number | null
  amount_paid: number | null
  hosted_invoice_url: string | null
  invoice_pdf: string | null
  invoice_number: string | null
  created: string | null
  period_start: string | null
  period_end: string | null
}

type InvoicesResponse = {
  items: InvoiceItem[]
  page: number
  pageSize: number
  total: number
}

const invoicePage = ref(1)
const invoicePageSize = 10
const showInvoices = ref(false)

const { data: invoicesData, status: invoicesStatus, refresh: refreshInvoices } = await useAsyncData(
  () => `billing-invoices-${invoicePage.value}`,
  () => $fetch<InvoicesResponse>('/api/billing/invoices', { query: { page: invoicePage.value, pageSize: invoicePageSize } }),
  { watch: [invoicePage], lazy: true, immediate: false }
)

async function toggleInvoices() {
  showInvoices.value = !showInvoices.value
  if (showInvoices.value && !invoicesData.value) {
    await refreshInvoices()
  }
}

const invoiceColumns = [
  {
    accessorKey: 'invoice_number' as const,
    header: 'Fatura',
    cell: ({ row }: { row: { original: InvoiceItem } }) => {
      return h('span', { class: 'font-medium' }, row.original.invoice_number || row.original.stripe_invoice_id)
    }
  },
  {
    accessorKey: 'status' as const,
    header: 'Status'
  },
  {
    accessorKey: 'total' as const,
    header: 'Total',
    cell: ({ row }: { row: { original: InvoiceItem } }) => {
      return formatMoney(row.original.total, row.original.currency)
    }
  },
  {
    accessorKey: 'created' as const,
    header: 'Data',
    cell: ({ row }: { row: { original: InvoiceItem } }) => {
      if (!row.original.created) return '-'
      return new Date(row.original.created).toLocaleDateString('pt-BR')
    }
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }: { row: { original: InvoiceItem } }) => {
      const url = row.original.invoice_pdf || row.original.hosted_invoice_url
      return h(resolveComponent('UButton') as ReturnType<typeof resolveComponent>, {
        label: 'Abrir',
        color: 'neutral',
        variant: 'ghost',
        onClick: () => openInvoice(url)
      })
    }
  }
]

function formatMoney(amount: number | null, currency: string | null): string {
  if (amount == null) return '-'
  const value = amount / 100
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: (currency || 'brl').toUpperCase()
    }).format(value)
  } catch {
    return `${value}`
  }
}

async function openInvoice(url: string | null) {
  if (!url) {
    toast.add({ title: 'Erro', description: 'Link da fatura indisponível', color: 'error' })
    return
  }
  await navigateTo(url, { external: true })
}
</script>

<template>
  <!-- Assinatura -->
  <UPageCard
    title="Assinatura"
    description="Status e detalhes da sua assinatura."
    variant="subtle"
  >
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <UButton
            label="Gerenciar assinatura"
            color="neutral"
            variant="outline"
            @click="openPortal"
          />

          <UButton
            v-if="data?.subscription && (data.subscription.status === 'active' || data.subscription.status === 'trialing') && !data.subscription.cancel_at_period_end"
            label="Cancelar no fim do período"
            color="neutral"
            variant="ghost"
            :loading="isCancelling"
            @click="cancelAtPeriodEnd"
          />
        </div>

        <UButton
          label="Atualizar"
          color="neutral"
          @click="() => refresh()"
        />
      </div>
    </template>

    <div v-if="status === 'pending'" class="space-y-3">
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-10 w-full" />
    </div>

    <div v-else class="space-y-4">
      <div v-if="!data?.subscription" class="space-y-3">
        <p class="text-sm text-muted">
          Você ainda não possui uma assinatura registrada.
        </p>
        <UButton
          label="Ver planos"
          color="neutral"
          to="/pricing"
        />
      </div>

      <div v-else class="grid grid-cols-1 gap-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted">
            Status
          </span>
          <UBadge
            :color="data.subscription.status === 'active' || data.subscription.status === 'trialing' ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ data.subscription.status }}
          </UBadge>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-muted">
            Plano (price_id)
          </span>
          <span class="text-sm font-medium">
            {{ data.subscription.price_id || '-' }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-muted">
            Quantidade
          </span>
          <span class="text-sm font-medium">
            {{ data.subscription.quantity ?? '-' }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-muted">
            Início do período
          </span>
          <span class="text-sm font-medium">
            {{ formatDate(data.subscription.current_period_start) }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-muted">
            Fim do período
          </span>
          <span class="text-sm font-medium">
            {{ formatDate(data.subscription.current_period_end) }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-muted">
            Cancelar no fim do período
          </span>
          <span class="text-sm font-medium">
            {{ data.subscription.cancel_at_period_end ? 'Sim' : 'Não' }}
          </span>
        </div>

        <div
          v-if="data.subscription.canceled_at"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-muted">
            Cancelada em
          </span>
          <span class="text-sm font-medium">
            {{ formatDate(data.subscription.canceled_at) }}
          </span>
        </div>
      </div>
    </div>
  </UPageCard>

  <!-- Faturas -->
  <UPageCard
    title="Faturas"
    description="Histórico de faturas da sua assinatura."
    variant="subtle"
  >
    <template #footer>
      <div class="flex items-center justify-end w-full">
        <UButton
          :label="showInvoices ? 'Ocultar faturas' : 'Ver faturas'"
          color="neutral"
          variant="ghost"
          :icon="showInvoices ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          @click="toggleInvoices"
        />
      </div>
    </template>

    <template v-if="showInvoices">
      <div v-if="invoicesStatus === 'pending'" class="space-y-3">
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
      </div>

      <template v-else>
        <UTable
          :columns="invoiceColumns"
          :data="invoicesData?.items || []"
        />

        <div
          v-if="(invoicesData?.total || 0) > invoicePageSize"
          class="flex justify-center pt-4"
        >
          <UPagination
            v-model="invoicePage"
            :page-count="invoicePageSize"
            :total="invoicesData?.total || 0"
          />
        </div>
      </template>
    </template>

    <p
      v-else
      class="text-sm text-muted"
    >
      Clique em "Ver faturas" para carregar o histórico.
    </p>
  </UPageCard>
</template>
