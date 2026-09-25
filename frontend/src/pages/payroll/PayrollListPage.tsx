import React, { useState } from 'react';
import { Card, Table, Button, Select, Space, Row, Col, Input, Modal, message, Tag, Statistic, Tooltip } from 'antd';
import {
  CalculatorOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  SearchOutlined,
  PlusCircleOutlined,
  WalletOutlined,
  CheckOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PayrollDetailsModal } from './PayrollDetailsModal';
import { QuickFinancialActionModal } from '@/components/modules/hr/QuickFinancialActionModal';
import { useHr } from '@/context/HrContext';

const { Option } = Select;

export const PayrollListPage: React.FC = () => {
  const {
    employees,
    getFinancialPosition,
    getPayrollRunStatus,
    setPayrollRunStatus,
    payPayrollRun,
    paySingleEmployeePayroll,
    resetPayrollRun,
  } = useHr();
  const [selectedMonth, setSelectedMonth] = useState<number>(8);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeDetailModal, setActiveDetailModal] = useState<any>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const payrollStatus = getPayrollRunStatus(selectedYear, selectedMonth);

  // Build payroll items with per-employee paid status
  const payrollItems = employees
    .filter((emp) => {
      const matchSearch =
        emp.name_ar.includes(searchQuery) ||
        emp.employee_number.includes(searchQuery) ||
        (emp.nickname && emp.nickname.includes(searchQuery));
      const matchDept = selectedDept === 'all' || String(emp.department_id) === selectedDept;
      return matchSearch && matchDept;
    })
    .map((emp) => {
      const pos = getFinancialPosition(emp.id, selectedYear, selectedMonth);
      const totalAdditions = pos.total_bonuses_ytd + pos.total_overtime_ytd;
      const totalDeductions = pos.current_advances_balance + pos.total_deductions_ytd;

      return {
        id: emp.id,
        employee_id: emp.id,
        employee_name: emp.name_ar,
        employee_number: emp.employee_number,
        job_title: emp.job_title?.name_ar || '',
        department: emp.department?.name_ar || '',
        base_salary: pos.prorated_base_salary,
        full_base_salary: emp.base_salary,
        total_additions: totalAdditions,
        total_deductions: totalDeductions,
        net_salary: pos.total_net_salary_ytd,
        is_prorated: pos.is_prorated,
        worked_days: pos.worked_days,
        total_days_in_month: pos.total_days_in_month,
        is_paid: pos.is_paid,
        payout_record: pos.payout_record,
        month: selectedMonth,
        year: selectedYear,
      };
    });

  // Global summary
  let globalBase = 0;
  let globalAdditions = 0;
  let globalDeductions = 0;
  let globalNet = 0;
  let globalPaid = 0;
  let globalRemaining = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  employees.forEach((emp) => {
    const pos = getFinancialPosition(emp.id, selectedYear, selectedMonth);
    const add = pos.total_bonuses_ytd + pos.total_overtime_ytd;
    const ded = pos.current_advances_balance + pos.total_deductions_ytd;
    globalBase += pos.prorated_base_salary;
    globalAdditions += add;
    globalDeductions += ded;
    globalNet += pos.total_net_salary_ytd;
    if (pos.is_paid) {
      globalPaid += pos.total_net_salary_ytd;
      paidCount++;
    } else {
      globalRemaining += pos.total_net_salary_ytd;
      unpaidCount++;
    }
  });

  const handleGeneratePayroll = () => {
    message.loading('جاري التجميع التلقائي واحتساب المرتبات من السجلات...', 1).then(() => {
      setPayrollRunStatus(selectedYear, selectedMonth, 'calculated');
      message.success(`تم احتساب كشف رواتب شهر ${selectedMonth}/${selectedYear} لـ ${employees.length} موظفاً بنجاح`);
    });
  };

  const handleApprovePayroll = () => {
    Modal.confirm({
      title: 'تأكيد اعتماد المرتبات',
      content: `هل أنت متأكد من اعتماد كشف رواتب شهر ${selectedMonth}/${selectedYear}؟ لن تتاح التعديلات المباشرة بعد الاعتماد.`,
      okText: 'اعتماد',
      cancelText: 'إلغاء',
      onOk: () => {
        setPayrollRunStatus(selectedYear, selectedMonth, 'approved');
        message.success('تم اعتماد دورة المرتبات بنجاح');
      },
    });
  };

  const handlePayAll = () => {
    if (unpaidCount === 0) {
      message.info('جميع المرتبات مصروفة بالفعل لهذا الشهر');
      return;
    }
    Modal.confirm({
      title: 'تأكيد صرف جميع المرتبات المتبقية',
      content: (
        <div dir="rtl">
          <p>سيتم صرف رواتب <strong>{unpaidCount} موظف</strong> متبقي بقيمة إجمالية:</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>{(globalRemaining / 100).toLocaleString()} ج.م</p>
          <p className="text-gray-500">سيتم ترحيل القيود فورياً لكشوف حسابات الموظفين.</p>
        </div>
      ),
      okText: `تأكيد صرف ${unpaidCount} مرتب الآن`,
      okType: 'primary',
      cancelText: 'إلغاء',
      onOk: () => {
        payPayrollRun(selectedYear, selectedMonth, 'cash');
        message.success(`تم صرف جميع مرتبات شهر ${selectedMonth}/${selectedYear} بنجاح!`);
      },
    });
  };

  const handlePaySingleEmployee = (record: any) => {
    Modal.confirm({
      title: `تأكيد صرف مرتب: ${record.employee_name}`,
      content: (
        <div dir="rtl">
          <p>الموظف: <strong>{record.employee_name}</strong> ({record.employee_number})</p>
          <p>القسم: {record.department} — {record.job_title}</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669', marginTop: '12px' }}>
            صافي المستحق: {(record.net_salary / 100).toLocaleString()} ج.م
          </p>
          <p className="text-gray-500 text-xs mt-2">
            سيتم تسجيل الصرف وترحيل القيد في كشف حساب الموظف فوراً.
          </p>
        </div>
      ),
      okText: 'تأكيد الصرف نقداً',
      okType: 'primary',
      cancelText: 'إلغاء',
      onOk: () => {
        paySingleEmployeePayroll(record.employee_id, selectedYear, selectedMonth, 'cash');
        message.success(`تم صرف مرتب ${record.employee_name} بمبلغ ${(record.net_salary / 100).toLocaleString()} ج.م بنجاح`);
      },
    });
  };

  const columns = [
    {
      title: 'كود',
      dataIndex: 'employee_number',
      key: 'employee_number',
      width: 90,
      render: (val: string) => <span className="font-mono text-gray-500 text-xs">{val}</span>,
    },
    {
      title: 'الموظف',
      key: 'employee',
      render: (_: any, record: any) => (
        <div>
          <a onClick={() => setActiveDetailModal(record)} className="font-bold text-blue-800 hover:underline">
            {record.employee_name}
          </a>
          <div className="text-xs text-gray-500">{record.department} - {record.job_title}</div>
          {record.is_prorated && (
            <span className="inline-block bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded mt-0.5 font-bold">
              مجزأ ({record.worked_days} يوم من {record.total_days_in_month})
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'الراتب المستحق',
      dataIndex: 'base_salary',
      key: 'base_salary',
      render: (val: number, record: any) => (
        <div>
          <MoneyDisplay amount={val} />
          {record.is_prorated && (
            <div className="text-[10px] text-gray-400">
              الأساسي الكامل: <MoneyDisplay amount={record.full_base_salary} style={{ fontSize: '10px' }} />
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'الإضافات (+)',
      dataIndex: 'total_additions',
      key: 'total_additions',
      render: (val: number) => <MoneyDisplay amount={val} type="positive" />,
    },
    {
      title: 'الاستقطاعات (-)',
      dataIndex: 'total_deductions',
      key: 'total_deductions',
      render: (val: number) => <MoneyDisplay amount={val} type="negative" />,
    },
    {
      title: 'صافي المرتب',
      dataIndex: 'net_salary',
      key: 'net_salary',
      render: (val: number) => <MoneyDisplay amount={val} type="positive" style={{ fontSize: '15px', fontWeight: 'bold' }} />,
    },
    {
      title: 'الحالة',
      key: 'status',
      width: 120,
      render: (_: any, record: any) => {
        if (record.is_paid) {
          return (
            <Tooltip title={`تم الصرف: ${record.payout_record?.payout_date || ''}`}>
              <Tag color="green" className="font-bold">
                <CheckOutlined /> تم الصرف
              </Tag>
            </Tooltip>
          );
        }
        return (
          <Tag color="orange" className="font-bold">
            <ClockCircleOutlined /> لم يُصرف
          </Tag>
        );
      },
    },
    {
      title: 'إجراء',
      key: 'actions',
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} size="small" onClick={() => setActiveDetailModal(record)}>
            التفاصيل
          </Button>
          {!record.is_paid && (
            <Button
              type="primary"
              size="small"
              icon={<WalletOutlined />}
              style={{ backgroundColor: '#059669', borderColor: '#047857' }}
              onClick={() => handlePaySingleEmployee(record)}
            >
              صرف مرتبه
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Department options dynamically from employees
  const uniqueDepts = Array.from(new Set(employees.map((e) => e.department_id)));

  return (
    <div className="p-6 bg-gray-50 min-h-screen dir-rtl" dir="rtl">
      <Card style={{ borderRadius: '12px' }}>
        {/* Header Toolbar */}
        <Row justify="space-between" align="middle" className="mb-6" gutter={[16, 16]}>
          <Col>
            <h1 className="text-2xl font-bold text-gray-800 m-0">مسير المرتبات الشهري — مطعم رابحة</h1>
            <p className="text-gray-500 text-sm m-0 mt-1">
              احتساب وصرف رواتب {employees.length} موظفاً — يمكنك الصرف بشكل فردي أو جماعي
            </p>
          </Col>
          <Col>
            <Space wrap>
              <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 110 }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <Option key={i + 1} value={i + 1}>
                    شهر {i + 1}
                  </Option>
                ))}
              </Select>
              <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 100 }}>
                <Option value={2026}>2026</Option>
                <Option value={2025}>2025</Option>
              </Select>

              <Button
                type="primary"
                style={{ background: '#d97706', borderColor: '#b45309' }}
                icon={<PlusCircleOutlined />}
                onClick={() => setActionModalOpen(true)}
              >
                + حركة مالية
              </Button>
              <Button type="primary" icon={<CalculatorOutlined />} onClick={handleGeneratePayroll}>
                احتساب تلقائي
              </Button>
              <Button
                icon={<CheckCircleOutlined />}
                disabled={payrollStatus === 'approved' || payrollStatus === 'paid'}
                onClick={handleApprovePayroll}
              >
                اعتماد
              </Button>
              <Button
                type="primary"
                style={{ backgroundColor: '#059669', borderColor: '#047857' }}
                icon={<DollarOutlined />}
                disabled={unpaidCount === 0}
                onClick={handlePayAll}
              >
                صرف الكل ({unpaidCount})
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Summary Cards with Remaining Balance Tracker */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card size="small" className="text-center bg-blue-50 border-blue-200">
              <div className="text-xs text-blue-700 font-bold mb-1">إجمالي المرتبات الأساسية</div>
              <MoneyDisplay amount={globalBase} style={{ fontSize: '16px' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="text-center bg-green-50 border-green-200">
              <div className="text-xs text-green-700 font-bold mb-1">تم صرفه ({paidCount} موظف)</div>
              <MoneyDisplay amount={globalPaid} type="positive" style={{ fontSize: '16px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="text-center bg-amber-50 border-amber-200">
              <div className="text-xs text-amber-700 font-bold mb-1">
                المتبقي للصرف ({unpaidCount} موظف)
              </div>
              <MoneyDisplay
                amount={globalRemaining}
                style={{ fontSize: '18px', fontWeight: 'bold', color: unpaidCount > 0 ? '#d97706' : '#059669' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="text-center bg-slate-100 border-slate-300">
              <div className="text-xs text-slate-600 font-bold mb-1">صافي المرتبات الإجمالي</div>
              <MoneyDisplay amount={globalNet} style={{ fontSize: '16px' }} />
              <div className="text-[10px] text-gray-500 mt-1">
                (إضافات: {(globalAdditions / 100).toLocaleString()} | خصم: {(globalDeductions / 100).toLocaleString()})
              </div>
            </Card>
          </Col>
        </Row>

        {/* Progress Bar */}
        {employees.length > 0 && (
          <div className="mb-4 bg-gray-100 rounded-full h-6 overflow-hidden relative">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${(paidCount / employees.length) * 100}%`,
                background: paidCount === employees.length ? '#059669' : 'linear-gradient(90deg, #059669, #10b981)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
              تم صرف {paidCount} من {employees.length} موظف
              {paidCount === employees.length && ' ✓ — اكتمل صرف جميع المرتبات'}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="ابحث باسم الموظف أو الكود..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select value={selectedDept} onChange={setSelectedDept} style={{ width: '100%' }}>
              <Option value="all">جميع الأقسام</Option>
              {uniqueDepts.map((deptId) => {
                const emp = employees.find((e) => e.department_id === deptId);
                return (
                  <Option key={deptId} value={String(deptId)}>
                    {emp?.department?.name_ar || `قسم ${deptId}`}
                  </Option>
                );
              })}
            </Select>
          </Col>
        </Row>

        {/* Payroll Table */}
        <Table
          columns={columns}
          dataSource={payrollItems}
          rowKey="id"
          pagination={{ pageSize: 15, showSizeChanger: false }}
          bordered
          rowClassName={(record) => record.is_paid ? 'bg-green-50/50' : ''}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-slate-800">
                <Table.Summary.Cell index={0} colSpan={2}>
                  <span className="font-bold text-white">الإجمالي ({employees.length} موظف)</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <MoneyDisplay amount={globalBase} style={{ color: 'white' }} />
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <MoneyDisplay amount={globalAdditions} type="positive" style={{ color: '#4ade80' }} />
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <MoneyDisplay amount={globalDeductions} type="negative" style={{ color: '#f87171' }} />
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <MoneyDisplay amount={globalNet} style={{ color: '#4ade80', fontSize: '16px', fontWeight: 'bold' }} />
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <Tag color={paidCount === employees.length ? 'green' : 'orange'} className="font-bold">
                    {paidCount}/{employees.length}
                  </Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  <span className="text-white text-xs font-bold">
                    متبقي: {(globalRemaining / 100).toLocaleString()} ج.م
                  </span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* Interactive Detail Modal */}
      {activeDetailModal && (
        <PayrollDetailsModal
          open={!!activeDetailModal}
          payrollDetail={activeDetailModal}
          onClose={() => setActiveDetailModal(null)}
        />
      )}

      <QuickFinancialActionModal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
      />
    </div>
  );
};

export default PayrollListPage;
