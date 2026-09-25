# 03 — Frontend Standards (React / TypeScript)

> All frontend code must follow these standards. No exceptions.

---

## 1. Technology Requirements

| Technology      | Version   | Purpose                                        |
| --------------- | --------- | ---------------------------------------------- |
| React           | 18+       | UI framework                                   |
| TypeScript      | 5.x       | Type safety                                    |
| Vite            | 5+        | Build tool                                     |
| Ant Design      | 5+        | Component library (RTL-native)                 |
| React Router    | 6+        | Client-side routing                            |
| React Query     | 5+        | Server state management                        |
| Zustand         | 4+        | Client state management                        |
| i18next         | 23+       | Internationalization                           |
| Axios           | 1+        | HTTP client                                    |
| Day.js          | 1+        | Date manipulation                              |
| React Hook Form | 7+        | Form management                                |
| Zod             | 3+        | Schema validation                              |

---

## 2. Project Structure

```
src/
├── api/                          # API layer
│   ├── client.ts                 # Axios instance configuration
│   ├── endpoints/                # Endpoint definitions by module
│   │   ├── hr.api.ts
│   │   ├── attendance.api.ts
│   │   ├── payroll.api.ts
│   │   ├── inventory.api.ts
│   │   ├── purchases.api.ts
│   │   ├── suppliers.api.ts
│   │   ├── customers.api.ts
│   │   ├── expenses.api.ts
│   │   ├── accounting.api.ts
│   │   ├── pos.api.ts
│   │   ├── reports.api.ts
│   │   └── settings.api.ts
│   └── types/                    # API request/response types
│       └── index.ts
├── assets/                       # Static assets
│   ├── fonts/
│   ├── icons/
│   └── images/
├── components/
│   ├── common/                   # Shared components
│   │   ├── DataTable/            # Generic data table
│   │   ├── FormFields/           # Reusable form fields
│   │   ├── PageHeader/           # Standard page header
│   │   ├── StatusBadge/          # Status indicator
│   │   ├── MoneyDisplay/         # Currency formatter
│   │   ├── DateDisplay/          # Localized date display
│   │   ├── ConfirmDialog/        # Confirmation modal
│   │   ├── EmptyState/           # Empty data placeholder
│   │   ├── LoadingState/         # Loading skeleton
│   │   └── ErrorBoundary/        # Error boundary wrapper
│   ├── layout/
│   │   ├── AppShell/             # Main app layout
│   │   ├── Sidebar/              # Navigation sidebar
│   │   ├── Header/               # Top header bar
│   │   ├── BranchSelector/       # Branch switcher
│   │   └── UserMenu/             # User dropdown menu
│   └── modules/                  # Module-specific components
│       ├── hr/
│       ├── attendance/
│       ├── payroll/
│       ├── inventory/
│       ├── purchases/
│       ├── suppliers/
│       ├── customers/
│       ├── expenses/
│       ├── accounting/
│       ├── pos/
│       ├── reports/
│       └── settings/
├── config/
│   ├── app.config.ts             # Application configuration
│   ├── menu.config.ts            # Navigation menu structure
│   └── permissions.config.ts     # Permission constants
├── hooks/                        # Custom hooks
│   ├── useAuth.ts                # Authentication hook
│   ├── useBranch.ts              # Branch context hook
│   ├── usePermission.ts          # Permission check hook
│   ├── usePagination.ts          # Pagination state hook
│   ├── useDebounce.ts            # Debounce hook
│   └── useMoney.ts               # Money formatting hook
├── i18n/
│   ├── config.ts                 # i18next configuration
│   └── locales/
│       ├── ar/                   # Arabic translations
│       │   ├── common.json
│       │   ├── hr.json
│       │   ├── attendance.json
│       │   ├── payroll.json
│       │   ├── inventory.json
│       │   ├── purchases.json
│       │   ├── suppliers.json
│       │   ├── customers.json
│       │   ├── expenses.json
│       │   ├── accounting.json
│       │   ├── pos.json
│       │   ├── reports.json
│       │   └── settings.json
│       └── en/
│           └── ... (same structure)
├── pages/                        # Route pages
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── hr/
│   │   ├── EmployeeListPage.tsx
│   │   ├── EmployeeCreatePage.tsx
│   │   ├── EmployeeEditPage.tsx
│   │   └── EmployeeDetailPage.tsx
│   ├── ... (same pattern for each module)
│   └── NotFoundPage.tsx
├── store/                        # Zustand stores
│   ├── authStore.ts
│   ├── branchStore.ts
│   ├── uiStore.ts                # Sidebar, theme, locale
│   └── posStore.ts               # POS session state
├── styles/
│   ├── global.css                # Global styles
│   ├── variables.css             # CSS custom properties
│   ├── rtl.css                   # RTL-specific overrides
│   └── print.css                 # Print styles
├── types/                        # TypeScript types
│   ├── models/                   # Domain model types
│   │   ├── hr.types.ts
│   │   ├── inventory.types.ts
│   │   └── ...
│   ├── api.types.ts              # API envelope types
│   ├── auth.types.ts             # Auth-related types
│   └── common.types.ts           # Shared utility types
├── utils/
│   ├── money.ts                  # Money formatting/calculation
│   ├── date.ts                   # Date formatting utilities
│   ├── validators.ts             # Common validation helpers
│   ├── permissions.ts            # Permission check utilities
│   └── helpers.ts                # General utility functions
├── App.tsx                       # Root component
├── main.tsx                      # Entry point
└── router.tsx                    # Route definitions
```

---

## 3. TypeScript Standards

### 3.1 Strict Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 3.2 Type Rules

- **Never use `any`** — use `unknown` if the type is truly unknown, then narrow.
- **Never use `as` type assertions** unless absolutely necessary (document why).
- **Always define return types** for functions and methods.
- **Use interfaces for objects** that are extended; use `type` for unions, intersections, utilities.
- **Use discriminated unions** for state machines (e.g., API loading states).
- **Export types** from the `types/` directory — never define inline in components.

### 3.3 Model Types

```typescript
// types/models/hr.types.ts

export interface Employee {
  id: number;
  employee_number: string;
  name_ar: string;
  name_en: string;
  national_id?: string;  // Conditionally included by API
  phone: string;
  email: string | null;
  department: Department | null;
  job_title: JobTitle | null;
  hire_date: string;      // ISO date string
  base_salary?: number;   // Conditionally included by API (piasters)
  status: EmployeeStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
}

export type EmployeeStatus = 'active' | 'on_leave' | 'suspended' | 'terminated' | 'resigned';

export interface EmployeeCreatePayload {
  name_ar: string;
  name_en: string;
  national_id: string;
  phone: string;
  email?: string;
  department_id: number;
  job_title_id: number;
  hire_date: string;
  base_salary: number;   // piasters
  status: EmployeeStatus;
}

export interface EmployeeUpdatePayload extends Partial<EmployeeCreatePayload> {}

export interface EmployeeFilters {
  search?: string;
  department_id?: number;
  status?: EmployeeStatus;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
```

---

## 4. Component Standards

### 4.1 Component Structure

```typescript
// components/modules/hr/EmployeeForm/EmployeeForm.tsx

import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Select, DatePicker, Button, Row, Col } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema } from './EmployeeForm.schema';
import { MoneyInput } from '@/components/common/FormFields/MoneyInput';
import type { EmployeeCreatePayload } from '@/types/models/hr.types';
import styles from './EmployeeForm.module.css';

interface EmployeeFormProps {
  initialValues?: Partial<EmployeeCreatePayload>;
  onSubmit: (data: EmployeeCreatePayload) => void;
  isLoading: boolean;
}

export const EmployeeForm: FC<EmployeeFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation('hr');

  const { control, handleSubmit, formState: { errors } } = useForm<EmployeeCreatePayload>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialValues,
  });

  const handleFormSubmit = useCallback((data: EmployeeCreatePayload) => {
    onSubmit(data);
  }, [onSubmit]);

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(handleFormSubmit)}
      className={styles.form}
    >
      <Row gutter={[16, 0]}>
        <Col xs={24} md={12}>
          <Controller
            name="name_ar"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('employee.name_ar')}
                validateStatus={errors.name_ar ? 'error' : ''}
                help={errors.name_ar?.message}
              >
                <Input {...field} dir="rtl" />
              </Form.Item>
            )}
          />
        </Col>
        <Col xs={24} md={12}>
          <Controller
            name="name_en"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('employee.name_en')}
                validateStatus={errors.name_en ? 'error' : ''}
                help={errors.name_en?.message}
              >
                <Input {...field} dir="ltr" />
              </Form.Item>
            )}
          />
        </Col>
      </Row>
      {/* ... more fields ... */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {t('common.save')}
        </Button>
      </Form.Item>
    </Form>
  );
};
```

### 4.2 Component Rules

- **One component per file** — file name matches component name.
- **Use `FC` type** for functional components with props.
- **Props interface** defined in the same file or imported from types.
- **No inline styles** — use CSS Modules or Ant Design's `className`.
- **Memoize expensive computations** with `useMemo`.
- **Memoize callbacks** with `useCallback` when passing to child components.
- **Use controlled components** with React Hook Form for all forms.
- **Use Zod schemas** for form validation (mirrors backend validation).
- **No `any` in component props or state**.

### 4.3 Component File Structure

Each component directory may contain:

```
ComponentName/
├── ComponentName.tsx            # Component implementation
├── ComponentName.module.css     # Scoped styles (if needed)
├── ComponentName.schema.ts      # Zod validation schema (for forms)
├── ComponentName.test.tsx       # Component tests
└── index.ts                     # Re-export
```

---

## 5. API Layer

### 5.1 API Client Configuration

```typescript
// api/client.ts

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,  // Required for Sanctum SPA auth
});

// Request interceptor: attach locale & branch context
apiClient.interceptors.request.use((config) => {
  const locale = localStorage.getItem('locale') || 'ar';
  config.headers['Accept-Language'] = locale;
  return config;
});

// Response interceptor: handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

### 5.2 Endpoint Definitions

```typescript
// api/endpoints/hr.api.ts

import { apiClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type {
  Employee,
  EmployeeCreatePayload,
  EmployeeUpdatePayload,
  EmployeeFilters,
} from '@/types/models/hr.types';

export const hrApi = {
  employees: {
    list: (filters: EmployeeFilters) =>
      apiClient.get<PaginatedResponse<Employee>>('/hr/employees', { params: filters }),

    get: (id: number) =>
      apiClient.get<ApiResponse<Employee>>(`/hr/employees/${id}`),

    create: (data: EmployeeCreatePayload) =>
      apiClient.post<ApiResponse<Employee>>('/hr/employees', data),

    update: (id: number, data: EmployeeUpdatePayload) =>
      apiClient.put<ApiResponse<Employee>>(`/hr/employees/${id}`, data),

    delete: (id: number) =>
      apiClient.delete<ApiResponse<null>>(`/hr/employees/${id}`),
  },
};
```

### 5.3 React Query Hooks

```typescript
// hooks/queries/useEmployees.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '@/api/endpoints/hr.api';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import type { EmployeeFilters, EmployeeCreatePayload } from '@/types/models/hr.types';

const QUERY_KEYS = {
  employees: 'employees',
  employee: (id: number) => ['employee', id],
};

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.employees, filters],
    queryFn: () => hrApi.employees.list(filters).then(res => res.data),
    staleTime: 30_000,  // 30 seconds
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.employee(id),
    queryFn: () => hrApi.employees.get(id).then(res => res.data),
    enabled: id > 0,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('hr');

  return useMutation({
    mutationFn: (data: EmployeeCreatePayload) =>
      hrApi.employees.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.employees] });
      message.success(t('employee.created_success'));
    },
    onError: () => {
      message.error(t('common.error_occurred'));
    },
  });
}
```

---

## 6. State Management

### 6.1 Zustand Stores

```typescript
// store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'rabha-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
```

### 6.2 State Rules

- **React Query** for all server state (API data).
- **Zustand** for UI state only (sidebar open/closed, active branch, theme, locale, POS cart).
- **Never** duplicate server data in Zustand.
- **Never** use React Context for state that changes frequently.
- **Persist** only authentication and user preference state.

---

## 7. Routing

### 7.1 Route Structure

```typescript
// router.tsx

import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { lazy } from 'react';

// Lazy load all pages
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const EmployeeListPage = lazy(() => import('@/pages/hr/EmployeeListPage'));
// ... more lazy imports

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'hr',
        children: [
          { path: 'employees', element: <EmployeeListPage /> },
          { path: 'employees/create', element: <EmployeeCreatePage /> },
          { path: 'employees/:id', element: <EmployeeDetailPage /> },
          { path: 'employees/:id/edit', element: <EmployeeEditPage /> },
        ],
      },
      // ... more module routes
    ],
  },
]);
```

### 7.2 Route Rules

- All routes behind authentication wrapped in `ProtectedRoute`.
- `ProtectedRoute` checks both authentication AND permission for the route.
- All page components are lazy-loaded via `React.lazy`.
- Route paths match module structure: `/{module}/{resource}`.
- Use `:id` parameter for detail/edit routes.

---

## 8. Money Handling (Frontend)

```typescript
// utils/money.ts

/**
 * All money values from the API are in piasters (smallest unit).
 * Display values are formatted in EGP using this utility.
 */

const EGP_FORMATTER_AR = new Intl.NumberFormat('ar-EG', {
  style: 'currency',
  currency: 'EGP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const EGP_FORMATTER_EN = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Convert piasters to EGP display string.
 * @param piasters - Amount in piasters (integer)
 * @param locale - Display locale ('ar' or 'en')
 */
export function formatMoney(piasters: number, locale: string = 'ar'): string {
  const egp = piasters / 100;
  return locale === 'ar'
    ? EGP_FORMATTER_AR.format(egp)
    : EGP_FORMATTER_EN.format(egp);
}

/**
 * Convert EGP input to piasters for API submission.
 * @param egp - Amount in EGP (user input)
 */
export function toPiasters(egp: number): number {
  return Math.round(egp * 100);
}

/**
 * Convert piasters to EGP for form display.
 * @param piasters - Amount in piasters
 */
export function toEgp(piasters: number): number {
  return piasters / 100;
}
```

---

## 9. Internationalization (i18n)

### 9.1 Configuration

```typescript
// i18n/config.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    defaultNS: 'common',
    ns: ['common', 'hr', 'attendance', 'payroll', 'inventory', 'purchases',
         'suppliers', 'customers', 'expenses', 'accounting', 'pos', 'reports', 'settings'],
    interpolation: {
      escapeValue: false,  // React already escapes
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'rabha-locale',
    },
  });

export default i18n;
```

### 9.2 Translation Rules

- **Namespace per module**: `hr.json`, `accounting.json`, etc.
- **Common namespace** for shared strings: buttons, labels, messages.
- **Keys are dot-notation**: `employee.name_ar`, `common.save`, `validation.required`.
- **Never hardcode user-facing strings** — always use `t()`.
- **Include plural forms** where applicable.
- **Arabic translations must be reviewed** for correctness — no machine translation.

### 9.3 Translation File Example

```json
// locales/ar/hr.json
{
  "module_title": "الموارد البشرية",
  "employee": {
    "title": "الموظفون",
    "add": "إضافة موظف",
    "edit": "تعديل بيانات الموظف",
    "name_ar": "الاسم بالعربية",
    "name_en": "الاسم بالإنجليزية",
    "national_id": "الرقم القومي",
    "phone": "رقم الهاتف",
    "email": "البريد الإلكتروني",
    "department": "القسم",
    "job_title": "المسمى الوظيفي",
    "hire_date": "تاريخ التعيين",
    "base_salary": "الراتب الأساسي",
    "status": "الحالة",
    "created_success": "تم إضافة الموظف بنجاح",
    "updated_success": "تم تحديث بيانات الموظف بنجاح",
    "deleted_success": "تم حذف الموظف بنجاح"
  },
  "status": {
    "active": "نشط",
    "on_leave": "في إجازة",
    "suspended": "موقوف",
    "terminated": "منتهي الخدمة",
    "resigned": "مستقيل"
  }
}
```

---

## 10. Accessibility & RTL

### 10.1 RTL Requirements

- HTML `dir` attribute set based on locale.
- Ant Design's `ConfigProvider` with `direction="rtl"` for Arabic.
- CSS logical properties preferred over physical (`margin-inline-start` not `margin-left`).
- Directional icons must flip (arrows, chevrons, etc.).
- Manually test every page in both LTR and RTL modes.

### 10.2 Accessibility Requirements

- All form inputs must have associated labels.
- All interactive elements must be keyboard-accessible.
- Color contrast must meet WCAG 2.1 AA standard.
- Use semantic HTML elements.
- Provide `aria-label` for icon-only buttons.
- Error messages must be programmatically associated with their fields.

---

## 11. Error Handling (Frontend)

### 11.1 Global Error Boundary

- Wrap the entire app in an `ErrorBoundary` component.
- Display a user-friendly error message with retry option.
- Log errors to console in development, to a logging service in production.

### 11.2 API Error Handling

- Handle errors in React Query's `onError` callbacks.
- Display validation errors inline on form fields.
- Display general errors via Ant Design's `message` or `notification`.
- Handle network errors with a retry prompt.
- Handle 401 errors with redirect to login.
- Handle 403 errors with "permission denied" message.
- Handle 404 errors with "not found" page.
- Handle 500 errors with "server error" message.
