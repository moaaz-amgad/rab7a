export interface Employee {
  id: number;
  branch_id: number;
  employee_number: string;
  name_ar: string;
  name_en: string;
  nickname?: string;
  phone: string;
  email?: string;
  national_id?: string;
  department_id: number;
  job_title_id: number;
  department?: { id: number; name_ar: string; name_en: string };
  job_title?: { id: number; name_ar: string; name_en: string };
  branch?: { id: number; name_ar: string; name_en: string };
  hire_date: string;
  base_salary: number; // in piasters
  contract_type: string;
  status: 'active' | 'on_leave' | 'archived';
  gender: string;
  photo_path?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeAccountLedgerEntry {
  id: number;
  branch_id: number;
  employee_id: number;
  transaction_number: string;
  payroll_period?: string;
  transaction_date: string;
  recording_date: string;
  transaction_type: string;
  transaction_type_label?: string;
  description: string;
  debit: number; // in piasters (earnings / +)
  credit: number; // in piasters (deductions / payments / -)
  running_balance: number; // in piasters
  reference_number: string;
  related_document_type?: string;
  related_document_id?: number;
  attachment_path?: string;
  created_by?: number;
  created_by_name?: string;
  last_modified_by?: number;
  notes?: string;
}

export interface PayrollPayoutRecord {
  id: number;
  employee_id: number;
  year: number;
  month: number;
  period: string; // e.g. "2026-07"
  payout_date: string;
  base_salary: number; // in piasters
  worked_days: number;
  bonuses: number;
  overtime: number;
  advances_deducted: number;
  penalties_deducted: number;
  net_paid: number; // in piasters
  notes?: string;
  created_by_name: string;
}

export interface EmployeeFinancialPosition {
  current_balance: number;
  current_balance_egp: number;
  current_advances_balance: number;
  current_loan_balance: number;
  pending_payroll: number;
  total_bonuses_ytd: number;
  total_deductions_ytd: number;
  total_overtime_ytd: number;
  total_net_salary_ytd: number;
  prorated_base_salary: number;
  worked_days: number;
  total_days_in_month: number;
  is_prorated: boolean;
  is_paid: boolean;
  payout_record?: PayrollPayoutRecord | null;
}
