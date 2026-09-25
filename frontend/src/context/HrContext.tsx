import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee, EmployeeAccountLedgerEntry, EmployeeFinancialPosition, PayrollPayoutRecord } from '@/types/hr.types';
import type { EmployeeFormValues } from '@/components/modules/hr/EmployeeFormModal';

export type TransactionTypeKey = 'advance' | 'bonus' | 'penalty' | 'overtime' | 'late' | 'absence';

export interface AddTransactionParams {
  employeeId: number;
  type: TransactionTypeKey;
  amount: number; // in EGP
  description: string;
  notes?: string;
  date?: string;
  daysOrHours?: number;
}

interface HrContextType {
  employees: Employee[];
  getEmployeeLedger: (employeeId: number) => EmployeeAccountLedgerEntry[];
  getFinancialPosition: (employeeId: number, year?: number, month?: number) => EmployeeFinancialPosition;
  addTransaction: (params: AddTransactionParams) => void;
  addEmployee: (values: EmployeeFormValues) => Employee;
  updateEmployee: (id: number, values: Partial<EmployeeFormValues>) => void;
  deleteEmployee: (id: number) => void;
  clearAllEmployees: () => void;
  clearAllTransactions: () => void;
  clearEmployeeLedger: (employeeId: number) => void;
  getPayrollRunStatus: (year: number, month: number) => 'draft' | 'calculated' | 'approved' | 'paid';
  setPayrollRunStatus: (year: number, month: number, status: 'draft' | 'calculated' | 'approved' | 'paid') => void;
  payPayrollRun: (year: number, month: number, paymentMethod?: string) => void;
  paySingleEmployeePayroll: (employeeId: number, year: number, month: number, paymentMethod?: string) => void;
  resetPayrollRun: (year: number, month: number) => void;
}

const HrContext = createContext<HrContextType | undefined>(undefined);

const EMPLOYEES_STORAGE_KEY = 'rabha_hr_employees_prod_v5';
const LEDGER_STORAGE_KEY = 'rabha_hr_ledger_prod_v5';
const PAYOUTS_STORAGE_KEY = 'rabha_hr_payouts_prod_v5';
const PAYROLL_STATUS_STORAGE_KEY = 'rabha_payroll_status_prod_v5';

const DEFAULT_EMPLOYEES: Employee[] = [];
const DEFAULT_LEDGER: Record<number, EmployeeAccountLedgerEntry[]> = {};

export function getProratedBaseSalary(emp: Employee, year: number = 2026, month: number = 7) {
  const totalDaysInMonth = 30; // Standard 30-day month basis as per business rules
  if (!emp || !emp.hire_date) {
    return { proratedSalary: emp ? emp.base_salary : 0, workedDays: totalDaysInMonth, totalDaysInMonth, isProrated: false };
  }

  const hireParts = String(emp.hire_date).split('T')[0].split('-');
  if (hireParts.length < 3) {
    return { proratedSalary: emp.base_salary, workedDays: totalDaysInMonth, totalDaysInMonth, isProrated: false };
  }

  const hireYear = parseInt(hireParts[0], 10);
  const hireMonth = parseInt(hireParts[1], 10);
  const hireDay = parseInt(hireParts[2], 10);

  if (hireYear > year || (hireYear === year && hireMonth > month)) {
    return { proratedSalary: 0, workedDays: 0, totalDaysInMonth, isProrated: true };
  }

  if (hireYear < year || (hireYear === year && hireMonth < month)) {
    return { proratedSalary: emp.base_salary, workedDays: totalDaysInMonth, totalDaysInMonth, isProrated: false };
  }

  // Hired in this exact month - standard 30-day basis calculation
  const workedDays = Math.min(30, Math.max(1, 30 - hireDay + 1));
  const proratedSalary = Math.round((emp.base_salary / 30) * workedDays);

  return {
    proratedSalary,
    workedDays,
    totalDaysInMonth: 30,
    isProrated: workedDays < 30,
  };
}

export const HrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading employees from localStorage', e);
    }
    return DEFAULT_EMPLOYEES;
  });

  const [ledgerStore, setLedgerStore] = useState<Record<number, EmployeeAccountLedgerEntry[]>>(() => {
    try {
      const saved = localStorage.getItem(LEDGER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading ledger from localStorage', e);
    }
    return DEFAULT_LEDGER;
  });

  const [payoutsStore, setPayoutsStore] = useState<Record<string, PayrollPayoutRecord>>(() => {
    try {
      const saved = localStorage.getItem(PAYOUTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error('Error loading payouts from localStorage', e);
    }
    return {};
  });

  const [payrollStatusStore, setPayrollStatusStore] = useState<Record<string, 'draft' | 'calculated' | 'approved' | 'paid'>>(() => {
    try {
      const saved = localStorage.getItem(PAYROLL_STATUS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error('Error loading payroll statuses from localStorage', e);
    }
    return {};
  });

  const [isServerLoaded, setIsServerLoaded] = useState(false);

  // Fetch initial state from central server API for cross-device ngrok synchronization
  useEffect(() => {
    fetch('/api/v1/hr/sync-state')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && json.data) {
          if (json.data.employees && Array.isArray(json.data.employees) && json.data.employees.length > 0) {
            setEmployees(json.data.employees);
          }
          if (json.data.ledgerStore && typeof json.data.ledgerStore === 'object') {
            setLedgerStore(json.data.ledgerStore);
          }
          if (json.data.payoutsStore && typeof json.data.payoutsStore === 'object') {
            setPayoutsStore(json.data.payoutsStore);
          }
          if (json.data.payrollStatusStore && typeof json.data.payrollStatusStore === 'object') {
            setPayrollStatusStore(json.data.payrollStatusStore);
          }
        }
        setIsServerLoaded(true);
      })
      .catch((err) => {
        console.error('API Sync Load Error:', err);
        setIsServerLoaded(true);
      });
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
    } catch (e) {
      console.error('Error saving employees to localStorage', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledgerStore));
    } catch (e) {
      console.error('Error saving ledger to localStorage', e);
    }
  }, [ledgerStore]);

  useEffect(() => {
    try {
      localStorage.setItem(PAYOUTS_STORAGE_KEY, JSON.stringify(payoutsStore));
    } catch (e) {
      console.error('Error saving payouts to localStorage', e);
    }
  }, [payoutsStore]);

  useEffect(() => {
    try {
      localStorage.setItem(PAYROLL_STATUS_STORAGE_KEY, JSON.stringify(payrollStatusStore));
    } catch (e) {
      console.error('Error saving payroll statuses to localStorage', e);
    }
  }, [payrollStatusStore]);

  // Sync state to central server API ONLY AFTER initial server load completes
  useEffect(() => {
    if (!isServerLoaded) return;
    const timer = setTimeout(() => {
      fetch('/api/v1/hr/sync-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees,
          ledgerStore,
          payoutsStore,
          payrollStatusStore,
        }),
      }).catch((err) => console.error('API Sync Save Error:', err));
    }, 500);

    return () => clearTimeout(timer);
  }, [isServerLoaded, employees, ledgerStore, payoutsStore, payrollStatusStore]);

  const getEmployeeLedger = (employeeId: number) => {
    return ledgerStore[employeeId] || [];
  };

  const getFinancialPosition = (employeeId: number, year: number = 2026, month: number = 7): EmployeeFinancialPosition => {
    const entries = getEmployeeLedger(employeeId);

    let advances = 0;
    let bonuses = 0;
    let deductions = 0;
    let overtime = 0;

    entries.forEach((e) => {
      if (e.transaction_type === 'advance') advances += e.credit;
      if (e.transaction_type === 'bonus') bonuses += e.debit;
      if (e.transaction_type === 'penalty' || e.transaction_type === 'late' || e.transaction_type === 'absence') {
        deductions += e.credit;
      }
      if (e.transaction_type === 'overtime') overtime += e.debit;
    });

    const emp = employees.find((e) => e.id === employeeId);
    const proratedInfo = emp ? getProratedBaseSalary(emp, year, month) : { proratedSalary: 0, workedDays: 30, totalDaysInMonth: 30, isProrated: false };
    const baseSal = proratedInfo.proratedSalary;

    const netSalary = baseSal + bonuses + overtime - (advances + deductions);

    const payoutKey = `${employeeId}_${year}_${month}`;
    const payoutRecord = payoutsStore[payoutKey] || null;

    return {
      current_balance: netSalary,
      current_balance_egp: netSalary / 100,
      current_advances_balance: advances,
      current_loan_balance: 0,
      pending_payroll: netSalary,
      total_bonuses_ytd: bonuses,
      total_deductions_ytd: deductions,
      total_overtime_ytd: overtime,
      total_net_salary_ytd: netSalary,
      prorated_base_salary: baseSal,
      worked_days: proratedInfo.workedDays,
      total_days_in_month: proratedInfo.totalDaysInMonth,
      is_prorated: proratedInfo.isProrated,
      is_paid: !!payoutRecord,
      payout_record: payoutRecord,
    };
  };

  const addTransaction = ({ employeeId, type, amount, description, notes, daysOrHours, date }: AddTransactionParams) => {
    const emp = employees.find((e) => e.id === employeeId);
    let finalAmountEgp = amount;

    if (type === 'absence' && (!finalAmountEgp || finalAmountEgp === 0) && daysOrHours && emp) {
      const dailySalary = (emp.base_salary / 100) / 30;
      finalAmountEgp = Math.round(dailySalary * daysOrHours);
    }

    const piasters = Math.round(finalAmountEgp * 100);
    const currentLedger = getEmployeeLedger(employeeId);
    const lastBalance = currentLedger.length > 0 ? currentLedger[currentLedger.length - 1].running_balance : (emp ? emp.base_salary : 0);

    let debit = 0;
    let credit = 0;
    let newBalance = lastBalance;
    let typeLabel = '';

    if (type === 'advance') {
      credit = piasters;
      newBalance = lastBalance - piasters;
      typeLabel = 'سلفة مالية';
    } else if (type === 'penalty') {
      credit = piasters;
      newBalance = lastBalance - piasters;
      typeLabel = 'خصم / جزاء مالي';
    } else if (type === 'late') {
      credit = piasters;
      newBalance = lastBalance - piasters;
      typeLabel = 'خصم تأخير';
    } else if (type === 'absence') {
      credit = piasters;
      newBalance = lastBalance - piasters;
      typeLabel = `خصم غياب (${daysOrHours || 1} يوم)`;
    } else if (type === 'bonus') {
      debit = piasters;
      newBalance = lastBalance + piasters;
      typeLabel = 'مكافأة / حافز';
    } else if (type === 'overtime') {
      debit = piasters;
      newBalance = lastBalance + piasters;
      typeLabel = `أوفرتايم إضافي (${daysOrHours || 1} ساعة)`;
    }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateStr = date || now.toISOString().replace('T', ' ').substring(0, 16);
    const txnDateObj = date ? new Date(date) : now;
    const periodStr = `${txnDateObj.getFullYear()}-${String(txnDateObj.getMonth() + 1).padStart(2, '0')}`;

    const newEntry: EmployeeAccountLedgerEntry = {
      id: Date.now(),
      branch_id: 1,
      employee_id: employeeId,
      transaction_number: `TXN-${txnDateObj.getFullYear()}${String(txnDateObj.getMonth() + 1).padStart(2, '0')}-${randomId}`,
      payroll_period: periodStr,
      transaction_date: dateStr,
      recording_date: dateStr,
      transaction_type: type,
      transaction_type_label: typeLabel,
      description,
      debit,
      credit,
      running_balance: newBalance,
      reference_number: `REF-${randomId}`,
      created_by_name: 'إدارة مطعم رابحة',
      notes,
    };

    setLedgerStore((prev) => ({
      ...prev,
      [employeeId]: [...(prev[employeeId] || []), newEntry],
    }));
  };

  const addEmployee = (values: EmployeeFormValues): Employee => {
    const maxId = employees.reduce((max, e) => (e.id > max ? e.id : max), 0);
    const newId = maxId + 1;
    const empCode = `EMP-${String(newId).padStart(4, '0')}`;
    const piastersSalary = Math.round(values.base_salary_egp * 100);

    // Map department name to clean department_id
    let deptId = 1;
    const deptName = values.department_name || '';
    if (deptName.includes('الكاشير') || deptName.includes('صالة')) deptId = 2;
    else if (deptName.includes('الإدارة') || deptName.includes('التشغيل')) deptId = 3;
    else if (deptName.includes('التوصيل') || deptName.includes('دليفري')) deptId = 4;
    else if (deptName.includes('النظافة') || deptName.includes('الصيانة')) deptId = 5;
    else if (deptName.includes('المشتريات') || deptName.includes('المخزن')) deptId = 6;

    const newEmployee: Employee = {
      id: newId,
      branch_id: 1,
      employee_number: empCode,
      name_ar: values.name_ar,
      name_en: values.name_ar,
      phone: values.phone,
      national_id: values.national_id || '',
      department_id: deptId,
      job_title_id: 1,
      department: {
        id: deptId,
        name_ar: values.department_name,
        name_en: values.department_name,
      },
      job_title: {
        id: 1,
        name_ar: values.job_title_name,
        name_en: values.job_title_name,
      },
      branch: {
        id: 1,
        name_ar: 'مطعم رابحة الرئيسي',
        name_en: 'Rabha Main',
      },
      hire_date: typeof values.hire_date === 'string' ? values.hire_date : new Date().toISOString().substring(0, 10),
      base_salary: piastersSalary,
      contract_type: values.contract_type || 'full_time',
      status: values.status || 'active',
      gender: values.gender || 'male',
      created_at: new Date().toISOString().substring(0, 10),
      updated_at: new Date().toISOString().substring(0, 10),
    };

    setEmployees((prev) => [newEmployee, ...prev]);

    // Initialize clean empty ledger without fake opening bonus entries
    setLedgerStore((prev) => ({
      ...prev,
      [newId]: [],
    }));

    return newEmployee;
  };

  const updateEmployee = (id: number, values: Partial<EmployeeFormValues>) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== id) return emp;
        const newPiastersSalary = values.base_salary_egp !== undefined ? Math.round(values.base_salary_egp * 100) : emp.base_salary;

        return {
          ...emp,
          name_ar: values.name_ar !== undefined ? values.name_ar : emp.name_ar,
          name_en: values.name_ar !== undefined ? values.name_ar : emp.name_en,
          phone: values.phone !== undefined ? values.phone : emp.phone,
          national_id: values.national_id !== undefined ? values.national_id : emp.national_id,
          base_salary: newPiastersSalary,
          contract_type: values.contract_type !== undefined ? values.contract_type : emp.contract_type,
          status: values.status !== undefined ? (values.status as any) : emp.status,
          hire_date: typeof values.hire_date === 'string' ? values.hire_date : emp.hire_date,
          department: values.department_name
            ? { id: emp.department_id, name_ar: values.department_name, name_en: values.department_name }
            : emp.department,
          job_title: values.job_title_name
            ? { id: emp.job_title_id, name_ar: values.job_title_name, name_en: values.job_title_name }
            : emp.job_title,
          updated_at: new Date().toISOString().substring(0, 10),
        };
      })
    );
  };

  const deleteEmployee = (id: number) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setLedgerStore((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clearAllEmployees = () => {
    setEmployees([]);
    setLedgerStore({});
  };

  const clearAllTransactions = () => {
    setLedgerStore({});
  };

  const clearEmployeeLedger = (employeeId: number) => {
    setLedgerStore((prev) => ({
      ...prev,
      [employeeId]: [],
    }));
  };

  const getPayrollRunStatus = (year: number, month: number): 'draft' | 'calculated' | 'approved' | 'paid' => {
    const key = `${year}_${month}`;
    return payrollStatusStore[key] || 'calculated';
  };

  const setPayrollRunStatus = (year: number, month: number, status: 'draft' | 'calculated' | 'approved' | 'paid') => {
    const key = `${year}_${month}`;
    setPayrollStatusStore((prev) => ({
      ...prev,
      [key]: status,
    }));
  };

  const payPayrollRun = (year: number, month: number, paymentMethod: string = 'cash') => {
    const newPayouts: Record<string, PayrollPayoutRecord> = {};
    const newLedgerEntries: Record<number, EmployeeAccountLedgerEntry[]> = { ...ledgerStore };

    employees.forEach((emp) => {
      if (emp.status !== 'active') return;

      const pos = getFinancialPosition(emp.id, year, month);
      const payoutKey = `${emp.id}_${year}_${month}`;

      const payoutRecord: PayrollPayoutRecord = {
        id: Date.now() + emp.id,
        employee_id: emp.id,
        year,
        month,
        period: `${year}-${String(month).padStart(2, '0')}`,
        payout_date: new Date().toISOString().substring(0, 16).replace('T', ' '),
        base_salary: pos.prorated_base_salary,
        worked_days: pos.worked_days,
        bonuses: pos.total_bonuses_ytd,
        overtime: pos.total_overtime_ytd,
        advances_deducted: pos.current_advances_balance,
        penalties_deducted: pos.total_deductions_ytd,
        net_paid: pos.total_net_salary_ytd,
        notes: `طريقة الصرف: ${paymentMethod === 'cash' ? 'نقداً من خزينة المطعم' : 'تحويل بنكي / محفظة'}`,
        created_by_name: 'إدارة مطعم رابحة',
      };

      newPayouts[payoutKey] = payoutRecord;

      const randomId = Math.floor(1000 + Math.random() * 9000);
      const now = new Date();
      const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

      const payoutLedgerEntry: EmployeeAccountLedgerEntry = {
        id: Date.now() + emp.id + 100,
        branch_id: 1,
        employee_id: emp.id,
        transaction_number: `PAY-${year}${String(month).padStart(2, '0')}-${randomId}`,
        payroll_period: `${year}-${String(month).padStart(2, '0')}`,
        transaction_date: dateStr,
        recording_date: dateStr,
        transaction_type: 'salary_payment',
        transaction_type_label: 'صرف مرتب شهري',
        description: `تسوية وصرف صافي مرتب شهر ${month}/${year} (${pos.total_net_salary_ytd / 100} ج.م)`,
        debit: pos.total_net_salary_ytd,
        credit: 0,
        running_balance: 0,
        reference_number: `REF-PAY-${year}-${month}-${emp.id}`,
        created_by_name: 'إدارة مطعم رابحة',
        notes: `تم تسليم المرتب للموظف وسداد السلف والخصومات المسجلة.`,
      };

      newLedgerEntries[emp.id] = [...(newLedgerEntries[emp.id] || []), payoutLedgerEntry];
    });

    setPayoutsStore((prev) => ({ ...prev, ...newPayouts }));
    setLedgerStore(newLedgerEntries);
    setPayrollRunStatus(year, month, 'paid');
  };

  const paySingleEmployeePayroll = (employeeId: number, year: number, month: number, paymentMethod: string = 'cash') => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const pos = getFinancialPosition(employeeId, year, month);
    if (pos.is_paid) return;

    const payoutKey = `${employeeId}_${year}_${month}`;

    const payoutRecord: PayrollPayoutRecord = {
      id: Date.now(),
      employee_id: employeeId,
      year,
      month,
      period: `${year}-${String(month).padStart(2, '0')}`,
      payout_date: new Date().toISOString().substring(0, 16).replace('T', ' '),
      base_salary: pos.prorated_base_salary,
      worked_days: pos.worked_days,
      bonuses: pos.total_bonuses_ytd,
      overtime: pos.total_overtime_ytd,
      advances_deducted: pos.current_advances_balance,
      penalties_deducted: pos.total_deductions_ytd,
      net_paid: pos.total_net_salary_ytd,
      notes: `صرف مرتب فردي — طريقة الصرف: ${paymentMethod === 'cash' ? 'نقداً من خزينة المطعم' : 'تحويل بنكي / محفظة'}`,
      created_by_name: 'إدارة مطعم رابحة',
    };

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

    const payoutLedgerEntry: EmployeeAccountLedgerEntry = {
      id: Date.now() + 10,
      branch_id: 1,
      employee_id: employeeId,
      transaction_number: `PAY-${year}${String(month).padStart(2, '0')}-${randomId}`,
      payroll_period: `${year}-${String(month).padStart(2, '0')}`,
      transaction_date: dateStr,
      recording_date: dateStr,
      transaction_type: 'salary_payment',
      transaction_type_label: 'صرف مرتب فردي',
      description: `صرف وتسوية مرتب شهر ${month}/${year} للموظف (${pos.total_net_salary_ytd / 100} ج.م)`,
      debit: pos.total_net_salary_ytd,
      credit: 0,
      running_balance: 0,
      reference_number: `REF-EMP-PAY-${year}-${month}-${employeeId}`,
      created_by_name: 'إدارة مطعم رابحة',
      notes: `تم تسليم المرتب للموظف وتسوية جميع السلف والخصومات المسجلة.`,
    };

    setPayoutsStore((prev) => ({ ...prev, [payoutKey]: payoutRecord }));
    setLedgerStore((prev) => ({
      ...prev,
      [employeeId]: [...(prev[employeeId] || []), payoutLedgerEntry],
    }));

    const activeEmps = employees.filter((e) => e.status === 'active');
    const allPaid = activeEmps.every((e) => e.id === employeeId || payoutsStore[`${e.id}_${year}_${month}`]);
    if (allPaid) {
      setPayrollRunStatus(year, month, 'paid');
    }
  };

  const resetPayrollRun = (year: number, month: number) => {
    setPayoutsStore((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((key) => {
        if (key.endsWith(`_${year}_${month}`)) {
          delete copy[key];
        }
      });
      return copy;
    });
    setPayrollRunStatus(year, month, 'calculated');
  };

  return (
    <HrContext.Provider
      value={{
        employees,
        getEmployeeLedger,
        getFinancialPosition,
        addTransaction,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        clearAllEmployees,
        clearAllTransactions,
        clearEmployeeLedger,
        getPayrollRunStatus,
        setPayrollRunStatus,
        payPayrollRun,
        paySingleEmployeePayroll,
        resetPayrollRun,
      }}
    >
      {children}
    </HrContext.Provider>
  );
};

export const useHr = () => {
  const context = useContext(HrContext);
  if (!context) {
    throw new Error('useHr must be used within HrProvider');
  }
  return context;
};
