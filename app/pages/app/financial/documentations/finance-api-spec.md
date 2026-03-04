# Finance Module --- API Spec

Base path:

/api/v1/finance

------------------------------------------------------------------------

## Create Income

POST /finance/incomes

{ "source":"Salary", "amount":2500 }

------------------------------------------------------------------------

## List Incomes

GET /finance/incomes

------------------------------------------------------------------------

## Create Expense

POST /finance/expenses

{ "description":"Groceries", "amount":50, "category":"food" }

------------------------------------------------------------------------

## List Expenses

GET /finance/expenses

------------------------------------------------------------------------

## Create Debt

POST /finance/debts

{ "name":"Credit Card", "totalAmount":2000 }

------------------------------------------------------------------------

## Add Debt Installment

POST /finance/debts/:id/installments

{ "amount":200, "dueDate":"2026-03-20" }

------------------------------------------------------------------------

## Register Installment Payment

PATCH /finance/installments/:id

{ "paid":true }

------------------------------------------------------------------------

## Get Financial Dashboard

GET /finance/dashboard
