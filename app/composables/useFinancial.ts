import { useDebounceFn } from '@vueuse/core'
import type {
  Asset,
  CreateAssetPayload,
  CreateCategoryPayload,
  CreateDebtPayload,
  CreateExpensePayload,
  CreateIncomePayload,
  CreateInstallmentPayload,
  Debt,
  DebtInstallment,
  Expense,
  FinancialCategory,
  FinancialDashboard,
  FinancialListResponse,
  Income,
  UpdateAssetPayload,
  UpdateCategoryPayload,
  UpdateDebtPayload,
  UpdateExpensePayload,
  UpdateIncomePayload
} from '~/types/financial'
import { TransactionType } from '~/types/financial'

export function useFinancial() {
  const toast = useToast()

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  const {
    data: dashboardData,
    status: dashboardStatus,
    refresh: refreshDashboard
  } = useFetch<FinancialDashboard>('/api/financial/dashboard', {
    lazy: true,
    key: 'financial-dashboard'
  })

  // ─── Categories ─────────────────────────────────────────────────────────────
  const {
    data: categories,
    status: categoriesStatus,
    refresh: refreshCategories
  } = useFetch<FinancialCategory[]>('/api/financial/categories', {
    lazy: true,
    key: 'financial-categories'
  })

  const incomeCategories = computed(() =>
    (categories.value ?? []).filter(c => c.type === TransactionType.Income)
  )

  const expenseCategories = computed(() =>
    (categories.value ?? []).filter(c => c.type === TransactionType.Expense)
  )

  // ─── Income list (paginated) ───────────────────────────────────────────────
  const incomePage = ref(1)
  const incomePageSize = ref(20)
  const incomeSearch = ref('')
  const incomeCategoryId = ref<string>('')
  const incomeDateFrom = ref<string>('')
  const incomeDateTo = ref<string>('')

  const {
    data: incomeData,
    status: incomeStatus,
    refresh: refreshIncomes
  } = useFetch<FinancialListResponse<Income>>('/api/financial/incomes', {
    query: computed(() => ({
      page: incomePage.value,
      pageSize: incomePageSize.value,
      search: incomeSearch.value || undefined,
      categoryId: incomeCategoryId.value || undefined,
      dateFrom: incomeDateFrom.value || undefined,
      dateTo: incomeDateTo.value || undefined
    })),
    lazy: true,
    key: 'financial-incomes',
    watch: [incomePage, incomePageSize, incomeCategoryId, incomeDateFrom, incomeDateTo]
  })

  const debouncedRefreshIncomes = useDebounceFn(() => {
    refreshIncomes()
  }, 300)

  watch(incomeSearch, () => {
    incomePage.value = 1
    debouncedRefreshIncomes()
  })

  // ─── Expense list (paginated) ──────────────────────────────────────────────
  const expensePage = ref(1)
  const expensePageSize = ref(20)
  const expenseSearch = ref('')
  const expenseCategoryId = ref<string>('')
  const expenseDateFrom = ref<string>('')
  const expenseDateTo = ref<string>('')

  const {
    data: expenseData,
    status: expenseStatus,
    refresh: refreshExpenses
  } = useFetch<FinancialListResponse<Expense>>('/api/financial/expenses', {
    query: computed(() => ({
      page: expensePage.value,
      pageSize: expensePageSize.value,
      search: expenseSearch.value || undefined,
      categoryId: expenseCategoryId.value || undefined,
      dateFrom: expenseDateFrom.value || undefined,
      dateTo: expenseDateTo.value || undefined
    })),
    lazy: true,
    key: 'financial-expenses',
    watch: [expensePage, expensePageSize, expenseCategoryId, expenseDateFrom, expenseDateTo]
  })

  const debouncedRefreshExpenses = useDebounceFn(() => {
    refreshExpenses()
  }, 300)

  watch(expenseSearch, () => {
    expensePage.value = 1
    debouncedRefreshExpenses()
  })

  // ─── Debt list (paginated) ─────────────────────────────────────────────────
  const debtPage = ref(1)
  const debtPageSize = ref(20)
  const debtSearch = ref('')
  const debtStatusFilter = ref<string>('')

  const {
    data: debtData,
    status: debtStatus,
    refresh: refreshDebts
  } = useFetch<FinancialListResponse<Debt>>('/api/financial/debts', {
    query: computed(() => ({
      page: debtPage.value,
      pageSize: debtPageSize.value,
      search: debtSearch.value || undefined,
      status: debtStatusFilter.value || undefined
    })),
    lazy: true,
    key: 'financial-debts',
    watch: [debtPage, debtPageSize, debtStatusFilter]
  })

  const debouncedRefreshDebts = useDebounceFn(() => {
    refreshDebts()
  }, 300)

  watch(debtSearch, () => {
    debtPage.value = 1
    debouncedRefreshDebts()
  })

  // ─── Asset list (paginated) ────────────────────────────────────────────────
  const assetPage = ref(1)
  const assetPageSize = ref(50)
  const assetSearch = ref('')

  const {
    data: assetData,
    status: assetStatus,
    refresh: refreshAssets
  } = useFetch<FinancialListResponse<Asset>>('/api/financial/assets', {
    query: computed(() => ({
      page: assetPage.value,
      pageSize: assetPageSize.value,
      search: assetSearch.value || undefined
    })),
    lazy: true,
    key: 'financial-assets',
    watch: [assetPage, assetPageSize]
  })

  const debouncedRefreshAssets = useDebounceFn(() => {
    refreshAssets()
  }, 300)

  watch(assetSearch, () => {
    assetPage.value = 1
    debouncedRefreshAssets()
  })

  // ─── CRUD Actions ──────────────────────────────────────────────────────────

  // Categories
  async function createCategory(payload: CreateCategoryPayload): Promise<FinancialCategory | null> {
    try {
      const category = await $fetch<FinancialCategory>('/api/financial/categories', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Categoria criada', description: `"${category.name}" adicionada com sucesso.`, color: 'success' })
      await refreshCategories()
      return category
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível criar a categoria: ${message}`, color: 'error' })
      return null
    }
  }

  async function updateCategory(id: string, payload: UpdateCategoryPayload): Promise<FinancialCategory | null> {
    try {
      const category = await $fetch<FinancialCategory>(`/api/financial/categories/${id}`, {
        method: 'PUT',
        body: payload
      })
      toast.add({ title: 'Categoria atualizada', color: 'success' })
      await refreshCategories()
      return category
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível atualizar a categoria: ${message}`, color: 'error' })
      return null
    }
  }

  async function deleteCategory(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/financial/categories/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Categoria excluída', color: 'success' })
      await refreshCategories()
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível excluir a categoria: ${message}`, color: 'error' })
      return false
    }
  }

  // Incomes
  async function createIncome(payload: CreateIncomePayload): Promise<Income | null> {
    try {
      const income = await $fetch<Income>('/api/financial/incomes', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Receita criada', description: `"${income.source}" adicionada com sucesso.`, color: 'success' })
      await Promise.all([refreshIncomes(), refreshDashboard()])
      return income
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível criar a receita: ${message}`, color: 'error' })
      return null
    }
  }

  async function updateIncome(id: string, payload: UpdateIncomePayload): Promise<Income | null> {
    try {
      const income = await $fetch<Income>(`/api/financial/incomes/${id}`, {
        method: 'PUT',
        body: payload
      })
      toast.add({ title: 'Receita atualizada', color: 'success' })
      await Promise.all([refreshIncomes(), refreshDashboard()])
      return income
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível atualizar a receita: ${message}`, color: 'error' })
      return null
    }
  }

  async function deleteIncome(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/financial/incomes/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Receita excluída', color: 'success' })
      await Promise.all([refreshIncomes(), refreshDashboard()])
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível excluir a receita: ${message}`, color: 'error' })
      return false
    }
  }

  // Expenses
  async function createExpense(payload: CreateExpensePayload): Promise<Expense | null> {
    try {
      const expense = await $fetch<Expense>('/api/financial/expenses', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Despesa criada', description: `"${expense.description}" adicionada com sucesso.`, color: 'success' })
      await Promise.all([refreshExpenses(), refreshDashboard()])
      return expense
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível criar a despesa: ${message}`, color: 'error' })
      return null
    }
  }

  async function updateExpense(id: string, payload: UpdateExpensePayload): Promise<Expense | null> {
    try {
      const expense = await $fetch<Expense>(`/api/financial/expenses/${id}`, {
        method: 'PUT',
        body: payload
      })
      toast.add({ title: 'Despesa atualizada', color: 'success' })
      await Promise.all([refreshExpenses(), refreshDashboard()])
      return expense
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível atualizar a despesa: ${message}`, color: 'error' })
      return null
    }
  }

  async function deleteExpense(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/financial/expenses/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Despesa excluída', color: 'success' })
      await Promise.all([refreshExpenses(), refreshDashboard()])
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível excluir a despesa: ${message}`, color: 'error' })
      return false
    }
  }

  // Debts
  async function createDebt(payload: CreateDebtPayload): Promise<Debt | null> {
    try {
      const debt = await $fetch<Debt>('/api/financial/debts', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Dívida criada', description: `"${debt.name}" adicionada com sucesso.`, color: 'success' })
      await Promise.all([refreshDebts(), refreshDashboard()])
      return debt
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível criar a dívida: ${message}`, color: 'error' })
      return null
    }
  }

  async function updateDebt(id: string, payload: UpdateDebtPayload): Promise<Debt | null> {
    try {
      const debt = await $fetch<Debt>(`/api/financial/debts/${id}`, {
        method: 'PUT',
        body: payload
      })
      toast.add({ title: 'Dívida atualizada', color: 'success' })
      await Promise.all([refreshDebts(), refreshDashboard()])
      return debt
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível atualizar a dívida: ${message}`, color: 'error' })
      return null
    }
  }

  async function deleteDebt(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/financial/debts/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Dívida excluída', color: 'success' })
      await Promise.all([refreshDebts(), refreshDashboard()])
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível excluir a dívida: ${message}`, color: 'error' })
      return false
    }
  }

  async function fetchDebt(id: string): Promise<Debt | null> {
    try {
      return await $fetch<Debt>(`/api/financial/debts/${id}`)
    } catch {
      return null
    }
  }

  async function addInstallment(debtId: string, payload: CreateInstallmentPayload): Promise<DebtInstallment | null> {
    try {
      const installment = await $fetch<DebtInstallment>(`/api/financial/debts/${debtId}/installments`, {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Parcela adicionada', color: 'success' })
      return installment
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível adicionar a parcela: ${message}`, color: 'error' })
      return null
    }
  }

  async function toggleInstallmentPaid(installmentId: string): Promise<DebtInstallment | null> {
    try {
      const installment = await $fetch<DebtInstallment>(`/api/financial/debts/installments/${installmentId}`, {
        method: 'PATCH'
      })
      toast.add({ title: installment.paid ? 'Parcela marcada como paga' : 'Parcela desmarcada', color: 'success' })
      await Promise.all([refreshDebts(), refreshDashboard()])
      return installment
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível atualizar a parcela: ${message}`, color: 'error' })
      return null
    }
  }

  // Assets
  async function createAsset(payload: CreateAssetPayload): Promise<Asset | null> {
    try {
      const asset = await $fetch<Asset>('/api/financial/assets', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Ativo criado', description: `"${asset.name}" adicionado com sucesso.`, color: 'success' })
      await Promise.all([refreshAssets(), refreshDashboard()])
      return asset
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível criar o ativo: ${message}`, color: 'error' })
      return null
    }
  }

  async function updateAsset(id: string, payload: UpdateAssetPayload): Promise<Asset | null> {
    try {
      const asset = await $fetch<Asset>(`/api/financial/assets/${id}`, {
        method: 'PUT',
        body: payload
      })
      toast.add({ title: 'Ativo atualizado', color: 'success' })
      await Promise.all([refreshAssets(), refreshDashboard()])
      return asset
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível atualizar o ativo: ${message}`, color: 'error' })
      return null
    }
  }

  async function deleteAsset(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/financial/assets/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Ativo excluído', color: 'success' })
      await Promise.all([refreshAssets(), refreshDashboard()])
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.add({ title: 'Erro', description: `Não foi possível excluir o ativo: ${message}`, color: 'error' })
      return false
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const transactionTypeOptions = [
    { label: 'Receita', value: TransactionType.Income },
    { label: 'Despesa', value: TransactionType.Expense }
  ]

  const debtStatusOptions = [
    { label: 'Ativa', value: 'active' },
    { label: 'Quitada', value: 'paid_off' }
  ]

  return {
    // Dashboard
    dashboardData,
    dashboardStatus,
    refreshDashboard,

    // Categories
    categories,
    categoriesStatus,
    incomeCategories,
    expenseCategories,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Incomes
    incomeData,
    incomeStatus,
    incomePage,
    incomePageSize,
    incomeSearch,
    incomeCategoryId,
    incomeDateFrom,
    incomeDateTo,
    refreshIncomes,
    createIncome,
    updateIncome,
    deleteIncome,

    // Expenses
    expenseData,
    expenseStatus,
    expensePage,
    expensePageSize,
    expenseSearch,
    expenseCategoryId,
    expenseDateFrom,
    expenseDateTo,
    refreshExpenses,
    createExpense,
    updateExpense,
    deleteExpense,

    // Debts
    debtData,
    debtStatus,
    debtPage,
    debtPageSize,
    debtSearch,
    debtStatusFilter,
    refreshDebts,
    createDebt,
    updateDebt,
    deleteDebt,
    fetchDebt,
    addInstallment,
    toggleInstallmentPaid,

    // Assets
    assetData,
    assetStatus,
    assetPage,
    assetPageSize,
    assetSearch,
    refreshAssets,
    createAsset,
    updateAsset,
    deleteAsset,

    // Helpers
    formatCurrency,
    transactionTypeOptions,
    debtStatusOptions
  }
}
