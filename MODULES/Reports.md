# Module: Reports (التقارير والتحليلات)

> Enterprise analytics, cross-module financial/operational reporting, export generation, and scheduled reporting engine.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `rpt`                                         |
| **API Prefix**   | `/api/v1/reports`                             |
| **Branch Scoped**| Yes (with owner multi-branch aggregation)     |
| **Depends On**   | All system modules                            |
| **Depended By**  | Executive Dashboards                          |

---

## 2. Core Features

### 2.1 Multi-Branch Consolidation
- **Branch Level**: Managers see reports isolated to their assigned branch.
- **Owner Level**: Owners can filter by specific branch or select **"All Branches"** to aggregate revenue, COGS, labor cost, expenses, and net profit.

### 2.2 Reporting Engine Architecture
- **Async Execution**: Heavy reports (e.g. annual general ledgers or multi-year inventory valuation) execute in background queues (`database`/`redis`).
- **Export Formats**: PDF (DomPDF), Excel (Laravel Excel / PhpSpreadsheet), CSV.
- **Caching**: Dashboard KPIs and summary reports cached for 5–15 minutes with invalidation triggers.

---

## 3. Report Catalog

### 3.1 Financial Reports
1. **Trial Balance (ميزان المراجعة)**: Summary of all debit and credit balances.
2. **Income Statement / P&L (قائمة الدخل)**: Revenue minus Cost of Goods Sold minus Expenses.
3. **Balance Sheet (الميزانية العمومية)**: Assets = Liabilities + Equity.
4. **General Ledger (الأستاذ العام)**: Full transaction history for any specific GL account.
5. **Cash Flow Statement (قائمة التدفقات النقدية)**: Operating, investing, and financing cash flows.

### 3.2 Sales & POS Reports
1. **Daily Sales Summary (ملخص المبيعات اليومي)**: Breakdown by order type (dine-in, takeaway, delivery), channel, and payment method.
2. **Product Mix / Menu Engineering (تحليل أصناف القائمة)**: Popularity vs. profitability matrix (Stars, Plowhorses, Puzzles, Dogs).
3. **Hourly Sales Trend (حركة المبيعات بالساعة)**: Peak hours analysis for staffing optimization.
4. **Cashier Performance & Session Audit (أداء الكاشير وعجز الصندوق)**: Overages/shortages per cashier.

### 3.3 Inventory & Purchasing Reports
1. **Cost of Goods Sold (COGS) Report (تكلفة البضاعة المباعة)**: Beginning inventory + Purchases - Ending inventory.
2. **Stock Valuation Report (تقييم المخزون)**: Inventory assets valued at Weighted Average Cost (WAC).
3. **Waste & Spoilage Analysis (تقرير الهالك والفاقد)**: Cost of wasted raw materials by category.
4. **Supplier Performance & Purchase History (أداء الموردين ومشتريات الأصناف)**: Price fluctuations over time per item.

### 3.4 HR & Payroll Reports
1. **Payroll Summary (ملخص المرتبات)**: Gross pay, allowances, social insurance, taxes, deductions, net pay.
2. **Labor Cost Percentage (نسبة تكلفة العمالة)**: Total labor cost vs. gross revenue ratio.
3. **Attendance & Late Summary (الحضور والانصراف)**: Tardiness, absences, and overtime hours per branch/department.

---

## 4. API Endpoints

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/reports/financial/p-and-l`          | `rpt.financial.view`        | Profit and loss report   |
| `GET`    | `/reports/financial/balance-sheet`    | `rpt.financial.view`        | Balance sheet report     |
| `GET`    | `/reports/sales/daily`                | `rpt.sales.view`            | Daily sales breakdown    |
| `GET`    | `/reports/sales/menu-engineering`     | `rpt.sales.view`            | Menu engineering matrix  |
| `GET`    | `/reports/inventory/cogs`             | `rpt.inventory.view`        | COGS analysis            |
| `GET`    | `/reports/inventory/valuation`        | `rpt.inventory.view`        | Inventory valuation      |
| `GET`    | `/reports/payroll/summary`            | `rpt.payroll.view`          | Payroll summary report   |
| `POST`   | `/reports/export`                     | `rpt.export`                | Queue async report export|
| `GET`    | `/reports/export/{jobId}/download`    | `rpt.export`                | Download generated export|
