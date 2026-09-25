# 05 — UI/UX Standards

> All user interface design and user experience patterns must follow these standards.

---

## 1. Design Principles

### 1.1 Core Principles

1. **Efficiency** — Every screen optimized for speed of daily operations.
2. **Clarity** — Information hierarchy clear at a glance; no ambiguity.
3. **Consistency** — Same patterns, spacing, and behaviors throughout.
4. **Forgiveness** — Confirmation before destructive actions; undo where possible.
5. **Accessibility** — Usable by all staff regardless of technical skill.
6. **Bilingual Native** — Arabic (RTL) and English (LTR) must feel equally polished.

### 1.2 User-Centric Design

- Cashiers need **speed** — minimal clicks for common POS operations.
- Accountants need **precision** — clear number display, aligned columns.
- Managers need **overview** — dashboards, summaries, alerts.
- HR staff need **workflows** — step-by-step processes, status tracking.
- Owners need **insights** — cross-branch comparisons, trends, KPIs.

---

## 2. Layout System

### 2.1 App Shell

```
┌─────────────────────────────────────────────────────────────┐
│  Header Bar (56px)                                          │
│  [☰ Menu] [Branch: القاهرة ▼] [🔔] [🌐 AR/EN] [👤 User ▼] │
├──────────┬──────────────────────────────────────────────────┤
│          │  Page Content                                    │
│ Sidebar  │  ┌────────────────────────────────────────────┐  │
│ (240px)  │  │  Page Header                               │  │
│          │  │  [Title] [Breadcrumb]         [+ Actions]  │  │
│ - Dashboard  │  ├────────────────────────────────────────────┤  │
│ - HR     │  │                                            │  │
│ - Attend │  │  Main Content Area                         │  │
│ - Payroll│  │                                            │  │
│ - Invent │  │  (Tables, Forms, Cards, Charts)            │  │
│ - Purch  │  │                                            │  │
│ - Suppli │  │                                            │  │
│ - Custom │  │                                            │  │
│ - Expens │  │                                            │  │
│ - Account│  │                                            │  │
│ - POS    │  │                                            │  │
│ - Reports│  │                                            │  │
│ - Setting│  │                                            │  │
│          │  └────────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────┘
```

### 2.2 Layout Rules

- **Sidebar**: Collapsible (240px expanded, 64px collapsed icon-only).
- **Header**: Fixed, 56px height, always visible.
- **Content Area**: Scrollable, with padding (24px).
- **Maximum content width**: 1400px on wide screens (centered).
- **Responsive breakpoints**:
  - Desktop: ≥ 1200px (sidebar expanded)
  - Tablet: 768px–1199px (sidebar collapsed)
  - Mobile: < 768px (sidebar as drawer/overlay)

### 2.3 Sidebar Navigation Structure

```
Dashboard (لوحة التحكم)

HR (الموارد البشرية)
├── Employees (الموظفون)
├── Departments (الأقسام)
├── Job Titles (المسميات الوظيفية)
└── Documents (المستندات)

Attendance (الحضور والانصراف)
├── Daily Log (سجل اليوم)
├── Attendance Report (تقرير الحضور)
├── Shifts (الورديات)
└── Leave Requests (طلبات الإجازات)

Payroll (المرتبات)
├── Payroll Runs (دورات المرتبات)
├── Salary Structure (هيكل المرتبات)
├── Deductions (الخصومات)
└── Pay Slips (كشوف المرتبات)

Inventory (المخزون)
├── Items (الأصناف)
├── Categories (التصنيفات)
├── Stock Movements (حركات المخزون)
├── Stock Count (جرد المخزون)
└── Alerts (تنبيهات المخزون)

Purchases (المشتريات)
├── Purchase Orders (أوامر الشراء)
├── Receiving (الاستلام)
├── Returns (المرتجعات)
└── Purchase History (سجل المشتريات)

Suppliers (الموردون)
├── Supplier List (قائمة الموردين)
├── Contracts (العقود)
└── Payments (المدفوعات)

Customers (العملاء)
├── Customer List (قائمة العملاء)
├── Loyalty Program (برنامج الولاء)
└── Customer History (سجل العملاء)

Expenses (المصروفات)
├── Record Expense (تسجيل مصروف)
├── Expense Categories (فئات المصروفات)
├── Recurring Expenses (المصروفات المتكررة)
└── Approval Queue (طابور الموافقات)

Accounting (المحاسبة)
├── Chart of Accounts (دليل الحسابات)
├── Journal Entries (القيود اليومية)
├── General Ledger (الأستاذ العام)
├── Trial Balance (ميزان المراجعة)
├── Income Statement (قائمة الدخل)
└── Balance Sheet (الميزانية العمومية)

POS (نقطة البيع)
├── New Order (طلب جديد)
├── Orders History (سجل الطلبات)
├── Sessions (جلسات البيع)
└── Cash Drawer (درج النقدية)

Reports (التقارير)
├── Sales Reports (تقارير المبيعات)
├── Inventory Reports (تقارير المخزون)
├── Financial Reports (التقارير المالية)
├── HR Reports (تقارير الموارد البشرية)
└── Custom Reports (تقارير مخصصة)

Settings (الإعدادات)
├── General (عام)
├── Branches (الفروع)
├── Users (المستخدمون)
├── Roles & Permissions (الصلاحيات)
├── Tax Settings (إعدادات الضرائب)
└── Backup (النسخ الاحتياطي)
```

---

## 3. Component Patterns

### 3.1 Page Header

Every page has a standardized header:

```
┌────────────────────────────────────────────────────────┐
│  الموظفون  (Employees)                   [+ إضافة موظف] │
│  الموارد البشرية > الموظفون  (breadcrumb)               │
└────────────────────────────────────────────────────────┘
```

- **Title**: Arabic primary, module context clear.
- **Breadcrumb**: Full navigation path.
- **Actions**: Primary action button on the right (start in RTL).

### 3.2 Data Tables

Standard table for list pages:

```
┌────────────────────────────────────────────────────────┐
│  [🔍 بحث...] [القسم ▼] [الحالة ▼]  [تصدير] [⟳ تحديث]  │
├──────┬──────────┬───────────┬──────────┬───────┬───────┤
│  #   │ الاسم    │ القسم      │ الحالة    │ تاريخ │ ⋮     │
├──────┼──────────┼───────────┼──────────┼───────┼───────┤
│  1   │ أحمد محمد│ المطبخ     │ 🟢 نشط   │ 01/15 │ ⋮     │
│  2   │ سارة أحمد│ الكاشير    │ 🟠 إجازة  │ 03/22 │ ⋮     │
├──────┴──────────┴───────────┴──────────┴───────┴───────┤
│  عرض 1-25 من 150                           [< 1 2 3 >]│
└────────────────────────────────────────────────────────┘
```

**Table Rules:**
- Search bar with real-time filtering (debounced 300ms).
- Filter dropdowns for common filter fields.
- Sortable columns (click header to toggle).
- Row actions via dropdown menu (⋮): View, Edit, Delete.
- Pagination at bottom with page size selector.
- Loading skeleton during data fetch.
- Empty state with illustration when no data.
- Bulk actions via row checkboxes (optional per table).
- Export to Excel/PDF button.
- Refresh button.

### 3.3 Forms

```
┌────────────────────────────────────────────────────────┐
│  إضافة موظف جديد                                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  الاسم بالعربية *          الاسم بالإنجليزية *          │
│  ┌──────────────────┐   ┌──────────────────┐          │
│  │                  │   │                  │          │
│  └──────────────────┘   └──────────────────┘          │
│                                                        │
│  الرقم القومي *            رقم الهاتف *                │
│  ┌──────────────────┐   ┌──────────────────┐          │
│  │                  │   │                  │          │
│  └──────────────────┘   └──────────────────┘          │
│                                                        │
│  ─── بيانات التوظيف ───────────────────────────────── │
│                                                        │
│  القسم *                    المسمى الوظيفي *           │
│  ┌──────────────────┐   ┌──────────────────┐          │
│  │ ▼ اختر القسم     │   │ ▼ اختر المسمى    │          │
│  └──────────────────┘   └──────────────────┘          │
│                                                        │
│  تاريخ التعيين *            الراتب الأساسي *           │
│  ┌──────────────────┐   ┌──────────────────┐          │
│  │ 📅 YYYY/MM/DD    │   │ EGP              │          │
│  └──────────────────┘   └──────────────────┘          │
│                                                        │
│                          [إلغاء]  [حفظ]               │
└────────────────────────────────────────────────────────┘
```

**Form Rules:**
- Two-column layout on desktop, single column on mobile.
- Required fields marked with `*`.
- Group related fields with section dividers.
- Validation errors displayed inline below the field (red text).
- Submit button disabled during API call (loading spinner).
- Cancel button returns to list page (with unsaved changes warning).
- Auto-save draft for long forms (optional).
- Arabic field inputs default to `dir="rtl"`, English to `dir="ltr"`.

### 3.4 Detail View

```
┌────────────────────────────────────────────────────────┐
│  أحمد محمد                          [تعديل] [⋮ المزيد] │
│  موظف - المطبخ                                         │
├────────────────┬───────────────────────────────────────┤
│  البيانات الشخصية                                      │
│  ────────────────────────────                          │
│  الرقم الوظيفي: EMP-001                                │
│  الرقم القومي: ****1234                                │
│  الهاتف: 01012345678                                   │
│  البريد: ahmed@email.com                               │
│                                                        │
│  بيانات التوظيف                                        │
│  ──────────────                                        │
│  القسم: المطبخ                                         │
│  المسمى: شيف رئيسي                                     │
│  تاريخ التعيين: 2024/01/15                             │
│  الراتب: ٥,٠٠٠.٠٠ ج.م                                │
│  الحالة: 🟢 نشط                                       │
├────────────────────────────────────────────────────────┤
│  [الحضور] [المرتبات] [المستندات] [سجل التعديلات]       │
│                                                        │
│  Tab content here...                                   │
└────────────────────────────────────────────────────────┘
```

**Detail View Rules:**
- Key information visible at the top without scrolling.
- Sensitive data partially masked (national ID: ****1234).
- Related data in tabs below main information.
- Edit button prominent; destructive actions in overflow menu.
- Audit trail accessible as a tab.

---

## 4. Color System

### 4.1 Semantic Colors

| Purpose          | Light Mode       | Dark Mode (Future) | Usage                          |
| ---------------- | ---------------- | ------------------- | ------------------------------ |
| **Primary**      | `#1890FF`        | `#177DDC`           | Actions, links, active states  |
| **Success**      | `#52C41A`        | `#49AA19`           | Positive status, confirmations |
| **Warning**      | `#FAAD14`        | `#D89614`           | Warnings, pending states       |
| **Error**        | `#FF4D4F`        | `#D32029`           | Errors, destructive actions    |
| **Info**         | `#1890FF`        | `#177DDC`           | Informational messages         |

### 4.2 Status Colors

| Status           | Color            | Arabic              | Badge                |
| ---------------- | ---------------- | -------------------- | -------------------- |
| Active           | Green            | نشط                  | 🟢                   |
| Pending          | Orange           | معلق                 | 🟠                   |
| Approved         | Green            | موافق عليه            | 🟢                   |
| Rejected         | Red              | مرفوض                | 🔴                   |
| Draft            | Gray             | مسودة                | ⚪                   |
| Closed           | Gray             | مغلق                 | ⚪                   |
| On Leave         | Orange           | في إجازة              | 🟠                   |
| Suspended        | Red              | موقوف                | 🔴                   |
| Overdue          | Red              | متأخر                | 🔴                   |

---

## 5. Typography

### 5.1 Font Stack

```css
/* Arabic Primary */
--font-family-ar: 'Cairo', 'Noto Sans Arabic', 'Segoe UI', sans-serif;

/* English Primary */
--font-family-en: 'Inter', 'Segoe UI', -apple-system, sans-serif;

/* Monospace (for numbers, codes) */
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### 5.2 Type Scale

| Level    | Size   | Weight | Usage                              |
| -------- | ------ | ------ | ---------------------------------- |
| H1       | 24px   | 700    | Page titles                        |
| H2       | 20px   | 600    | Section headers                    |
| H3       | 16px   | 600    | Sub-section headers                |
| Body     | 14px   | 400    | General text, table cells          |
| Caption  | 12px   | 400    | Labels, hints, secondary info      |
| Small    | 11px   | 400    | Timestamps, metadata               |

### 5.3 Number Display

- Financial amounts: **bold, monospace font**, right-aligned.
- Large numbers: Formatted with thousands separator (`٥,٠٠٠.٠٠` or `5,000.00`).
- Negative amounts: Red color, parentheses or minus sign based on context.
- Currency symbol: Suffix in Arabic (`ج.م`), prefix in English (`EGP`).

---

## 6. Spacing System

Use a **4px base unit** system:

| Token   | Value | Usage                                |
| ------- | ----- | ------------------------------------ |
| `xs`    | 4px   | Tight spacing, inline elements       |
| `sm`    | 8px   | Between related items                |
| `md`    | 16px  | Standard spacing between sections    |
| `lg`    | 24px  | Content padding, card spacing        |
| `xl`    | 32px  | Major section separation             |
| `2xl`   | 48px  | Page-level spacing                   |

---

## 7. Feedback & Notifications

### 7.1 Feedback Types

| Type              | Component            | Duration  | Use Case                            |
| ----------------- | -------------------- | --------- | ------------------------------------ |
| **Success toast** | `message.success()`  | 3 seconds | CRUD success, save confirmation      |
| **Error toast**   | `message.error()`    | 5 seconds | API errors, operation failures       |
| **Warning toast** | `message.warning()`  | 4 seconds | Unusual situations, missing data     |
| **Info toast**    | `message.info()`     | 3 seconds | Informational updates                |
| **Notification**  | `notification.open()` | Manual   | Important events, approval requests  |
| **Modal confirm** | `Modal.confirm()`    | Manual    | Destructive action confirmation      |
| **Inline error**  | Form field error     | Persistent | Validation errors                   |

### 7.2 Confirmation Dialog

Required before:
- Deleting any record
- Cancelling an order
- Voiding a transaction
- Running payroll
- Closing a POS session
- Any irreversible action

```
┌─────────────────────────────────────┐
│  ⚠️  تأكيد الحذف                    │
│                                     │
│  هل أنت متأكد من حذف الموظف         │
│  "أحمد محمد"؟                       │
│                                     │
│  لا يمكن التراجع عن هذا الإجراء.     │
│                                     │
│             [إلغاء]  [🗑️ حذف]       │
└─────────────────────────────────────┘
```

---

## 8. Loading States

### 8.1 Loading Patterns

| Scenario              | Pattern                               |
| --------------------- | ------------------------------------- |
| Initial page load     | Full-page skeleton loader             |
| Table data loading    | Table skeleton (animated rows)        |
| Form submission       | Button spinner + disable              |
| Navigation            | Top progress bar (NProgress-style)    |
| Background operation  | Non-blocking toast with progress      |
| Search/filter         | Inline spinner in search field        |

### 8.2 Skeleton Rules

- Match the approximate layout of the content being loaded.
- Use animated gradient shimmer effect.
- Show skeletons for 200ms minimum (prevent flashing).
- Transition smoothly from skeleton to content.

---

## 9. Empty States

Every list view must have a meaningful empty state:

```
┌─────────────────────────────────────┐
│                                     │
│         📋                          │
│                                     │
│     لا يوجد موظفون بعد              │
│                                     │
│  ابدأ بإضافة أول موظف في النظام      │
│                                     │
│       [+ إضافة موظف]               │
│                                     │
└─────────────────────────────────────┘
```

- Relevant icon or illustration.
- Clear message in user's language.
- Action button to create first record.
- Different message for "no results" (search) vs "no data" (empty).

---

## 10. POS-Specific UI

The POS screen has a distinct layout optimized for speed:

```
┌──────────────────────┬──────────────────────┐
│  Categories & Items  │  Current Order       │
│                      │                      │
│  [🍕][🍔][🥤][🍰]   │  طلب #1234           │
│                      │  ─────────────────── │
│  ┌────┐ ┌────┐       │  برجر كلاسيك   ×2    │
│  │ 🍔 │ │ 🍟 │       │             120.00   │
│  │برجر │ │بطاطس│      │  بيبسي كبير   ×1    │
│  │60ج.م│ │25ج.م│      │              25.00   │
│  └────┘ └────┘       │  ─────────────────── │
│  ┌────┐ ┌────┐       │  المجموع:    145.00  │
│  │ 🥤 │ │ 🍰 │       │  الضريبة:     21.75  │
│  │بيبسي│ │كيك │       │  ─────────────────── │
│  │15ج.م│ │35ج.م│      │  الإجمالي:   166.75  │
│  └────┘ └────┘       │                      │
│                      │  [💵 نقدي] [💳 بطاقة] │
│                      │  [🧾 معلق] [❌ إلغاء]│
└──────────────────────┴──────────────────────┘
```

**POS UI Rules:**
- Large touch-friendly buttons (minimum 48px × 48px).
- Category tabs at the top for quick navigation.
- Item grid with image, name, and price.
- Current order summary always visible.
- Running totals update instantly.
- Payment method buttons prominent.
- Keyboard shortcut support for power users.
- Full-screen mode (hide sidebar/header).
- Receipt preview before printing.

---

## 11. Print & Export

### 11.1 Print Layout

- Dedicated print stylesheet (`print.css`).
- Print removes navigation, buttons, non-essential UI.
- Tables fit on A4 width.
- Headers/footers show: company name, date, page number.
- Arabic text renders correctly in print.

### 11.2 Export Formats

| Format  | Use Case                           | Library         |
| ------- | ---------------------------------- | --------------- |
| PDF     | Reports, invoices, pay slips       | Server-side gen |
| Excel   | Data tables, bulk data export      | Server-side gen |
| CSV     | Simple data export                 | Client-side     |
| Print   | Receipts, quick printouts          | Browser print   |

---

## 12. Responsive Design

| Breakpoint   | Min Width | Layout Changes                           |
| ------------ | --------- | ---------------------------------------- |
| Mobile       | 0px       | Single column, drawer nav, stacked cards |
| Tablet       | 768px     | Collapsed sidebar, 2-column forms        |
| Desktop      | 1200px    | Full sidebar, multi-column layouts       |
| Wide         | 1600px    | Extra content width, more columns        |

- POS module: Optimized for tablet landscape and desktop.
- Reports: Scrollable tables on mobile, full tables on desktop.
- Forms: Always single column on mobile, two-column on desktop.
- Dashboard cards: Stack vertically on mobile, grid on desktop.
