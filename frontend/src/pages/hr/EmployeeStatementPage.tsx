import React, { useState } from 'react';
import {
  Card,
  Table,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Space,
  Tag,
  Input,
  Statistic,
  message,
  Empty,
  Modal,
} from 'antd';
import {
  PrinterOutlined,
  FileExcelOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  PlusCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { LedgerTransactionDetailModal } from '@/components/modules/hr/LedgerTransactionDetailModal';
import { QuickFinancialActionModal } from '@/components/modules/hr/QuickFinancialActionModal';
import { useHr, TransactionTypeKey } from '@/context/HrContext';
import type { EmployeeAccountLedgerEntry } from '@/types/hr.types';

const { RangePicker } = DatePicker;
const { Option } = Select;

export const EmployeeStatementPage: React.FC<{
  employeeId?: number;
  onBack?: () => void;
}> = ({ employeeId = 1, onBack }) => {
  const { employees, getEmployeeLedger, getFinancialPosition, paySingleEmployeePayroll } = useHr();

  const [currentEmpId, setCurrentEmpId] = useState<number>(employeeId);
  const [selectedMonth, setSelectedMonth] = useState<number>(7);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<EmployeeAccountLedgerEntry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Action modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<TransactionTypeKey>('advance');

  const employee = employees.find((e) => e.id === currentEmpId) || employees.find((e) => e.id === employeeId) || employees[0];

  if (!employee) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen dir-rtl text-center" dir="rtl">
        <Card className="py-12 shadow-sm" style={{ borderRadius: '12px' }}>
          <Empty description={<span className="text-gray-600 font-semibold">لا يوجد أي موظف مسجل لعرض كشف حسابه</span>}>
            {onBack && (
              <Button icon={<ArrowRightOutlined />} onClick={onBack} className="mt-4">
                الرجوع للقائمة
              </Button>
            )}
          </Empty>
        </Card>
      </div>
    );
  }

  const entries = getEmployeeLedger(employee.id);
  const position = getFinancialPosition(employee.id, selectedYear, selectedMonth);

  const openAction = (type: TransactionTypeKey = 'advance') => {
    setActionType(type);
    setActionModalOpen(true);
  };

  const handlePaySalary = () => {
    if (position.is_paid) {
      message.info(`تم صرف مرتب ${employee.name_ar} لشهر ${selectedMonth}/${selectedYear} بالفعل!`);
      return;
    }

    Modal.confirm({
      title: `تأكيد صرف مرتب: ${employee.name_ar}`,
      content: (
        <div dir="rtl" className="mt-2">
          <p>الموظف: <strong>{employee.name_ar}</strong> ({employee.employee_number})</p>
          <p>عن فترة الاستحقاق: <strong>شهر {selectedMonth} / {selectedYear}</strong></p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669', marginTop: '12px' }}>
            صافي المستحق النهائي للصرف: {(position.total_net_salary_ytd / 100).toLocaleString()} ج.م
          </p>
          <p className="text-gray-500 text-xs mt-2">
            سيتم خصم السلف وتسوية الحساب وتثبيت القيد في كشف حساب الموظف فورياً.
          </p>
        </div>
      ),
      okText: 'تأكيد الصرف نقداً من الخزينة',
      okType: 'primary',
      cancelText: 'إلغاء',
      onOk: () => {
        paySingleEmployeePayroll(employee.id, selectedYear, selectedMonth, 'cash');
        message.success(`تم صرف مرتب الموظف ${employee.name_ar} لشهر ${selectedMonth}/${selectedYear} بنجاح!`);
      },
    });
  };

  const handleRowClick = (record: EmployeeAccountLedgerEntry) => {
    setSelectedEntry(record);
    setIsDetailModalOpen(true);
  };

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.description.includes(searchText) ||
      e.reference_number.includes(searchText) ||
      e.transaction_number.includes(searchText);

    const matchesType = !selectedType || e.transaction_type === selectedType;
    return matchesSearch && matchesType;
  });

  const columns = [
    {
      title: 'رقم الحركة',
      dataIndex: 'transaction_number',
      key: 'transaction_number',
      render: (text: string) => <span className="font-mono font-bold text-amber-700">{text}</span>,
    },
    {
      title: 'التاريخ',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (val: string) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      title: 'رقم المرجع',
      dataIndex: 'reference_number',
      key: 'reference_number',
      render: (text: string) => <span className="font-mono text-gray-500">{text}</span>,
    },
    {
      title: 'نوع الحركة',
      dataIndex: 'transaction_type_label',
      key: 'transaction_type',
      render: (label: string, record: EmployeeAccountLedgerEntry) => (
        <Tag color={record.debit > 0 ? 'green' : 'volcano'}>{label || record.transaction_type}</Tag>
      ),
    },
    {
      title: 'البيان',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'مستحقات / حوافز (+)',
      dataIndex: 'debit',
      key: 'debit',
      render: (val: number) => (val > 0 ? <MoneyDisplay amount={val} type="positive" /> : '-'),
    },
    {
      title: 'سلف / خصومات (-)',
      dataIndex: 'credit',
      key: 'credit',
      render: (val: number) => (val > 0 ? <MoneyDisplay amount={val} type="negative" /> : '-'),
    },
    {
      title: 'الرصيد التراكمي',
      dataIndex: 'running_balance',
      key: 'running_balance',
      render: (val: number) => <MoneyDisplay amount={val} type={val >= 0 ? 'positive' : 'negative'} style={{ fontWeight: 'bold' }} />,
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen dir-rtl" dir="rtl">
      {/* Header Toolbar */}
      <Card className="mb-6 shadow-sm" style={{ borderRadius: '12px' }}>
        <Row justify="space-between" align="middle" className="mb-4" gutter={[16, 16]}>
          <Col>
            <Space align="center" size="middle">
              {onBack && <Button icon={<ArrowRightOutlined />} onClick={onBack} />}
              <div>
                <div className="flex align-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-800 m-0">
                    كشف حساب الموظف: <span className="text-amber-700">{employee.name_ar}</span>
                  </h1>
                </div>
                <p className="text-gray-500 text-xs m-0 mt-1">
                  كود الموظف: {employee.employee_number} | القسم: {employee.department?.name_ar} | المسمى: {employee.job_title?.name_ar}
                </p>
              </div>
            </Space>
          </Col>

          <Col>
            <Space wrap align="center">
              <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 100 }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <Option key={i + 1} value={i + 1}>
                    شهر {i + 1}
                  </Option>
                ))}
              </Select>
              <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 90 }}>
                <Option value={2026}>2026</Option>
                <Option value={2025}>2025</Option>
              </Select>

              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                <UserOutlined className="text-amber-700" />
                <span className="text-xs font-bold text-amber-900">اختيار موظف:</span>
                <Select
                  showSearch
                  value={employee.id}
                  onChange={(val) => setCurrentEmpId(val)}
                  style={{ width: 220 }}
                  placeholder="اختر الموظف لعرض حسابه"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                  options={employees.map((emp) => ({
                    value: emp.id,
                    label: `${emp.name_ar} (${emp.employee_number})`,
                  }))}
                />
              </div>

              {position.is_paid ? (
                <Tag color="green" className="py-1 px-3 text-xs font-bold flex items-center gap-1" style={{ fontSize: '13px' }}>
                  ✓ تم صرف مرتب شهر {selectedMonth}
                </Tag>
              ) : (
                <Button
                  type="primary"
                  style={{ backgroundColor: '#059669', borderColor: '#047857' }}
                  icon={<PlusCircleOutlined />}
                  onClick={handlePaySalary}
                >
                  صرف مرتب الموظف
                </Button>
              )}

              <Button
                type="primary"
                style={{ background: '#d97706', borderColor: '#b45309' }}
                icon={<PlusCircleOutlined />}
                onClick={() => openAction('advance')}
              >
                + تسجيل حركة / سلفة
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={() => message.info('تصدير كشف الحساب إلى Excel')}>
                تصدير Excel
              </Button>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                طباعة
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Dynamic Financial Summary Cards */}
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6} md={4}>
            <Card size="small" className="bg-amber-50 text-center border-amber-200" style={{ borderRadius: '8px' }}>
              <Statistic title="الراتب الأساسي" valueRender={() => <MoneyDisplay amount={employee.base_salary} />} />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Card size="small" className="bg-emerald-50 text-center border-emerald-200" style={{ borderRadius: '8px' }}>
              <Statistic title="المكافآت والحوافز" valueRender={() => <MoneyDisplay amount={position.total_bonuses_ytd} type="positive" />} />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Card size="small" className="bg-red-50 text-center border-red-200" style={{ borderRadius: '8px' }}>
              <Statistic title="إجمالي السلف والخصومات" valueRender={() => <MoneyDisplay amount={position.current_advances_balance + position.total_deductions_ytd} type="negative" />} />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Card size="small" className="bg-blue-50 text-center border-blue-200" style={{ borderRadius: '8px' }}>
              <Statistic title="مستحق الإضافي" valueRender={() => <MoneyDisplay amount={position.total_overtime_ytd} type="positive" />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="bg-slate-900 text-white text-center" style={{ borderRadius: '8px' }}>
              <Statistic
                title={<span className="text-gray-300">رصيد الموظف التراكمي / الصافي</span>}
                valueRender={() => (
                  <MoneyDisplay
                    amount={position.current_balance}
                    type={position.current_balance >= 0 ? 'positive' : 'negative'}
                    style={{ fontSize: '18px', color: position.current_balance >= 0 ? '#4ade80' : '#f87171' }}
                  />
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Filter Controls */}
      <Card className="mb-6 shadow-sm" style={{ borderRadius: '12px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <label className="block text-xs font-bold mb-1">الفترة الزمنية:</label>
            <RangePicker style={{ width: '100%' }} />
          </Col>

          <Col xs={12} md={6}>
            <label className="block text-xs font-bold mb-1">نوع الحركة:</label>
            <Select
              placeholder="جميع الحركات المالية"
              style={{ width: '100%' }}
              allowClear
              onChange={(val) => setSelectedType(val)}
            >
              <Option value="advance">السلف فقط</Option>
              <Option value="bonus">المكافآت فقط</Option>
              <Option value="penalty">الخصومات والجزاءات</Option>
              <Option value="overtime">الإضافي</Option>
              <Option value="late">التأخير</Option>
              <Option value="absence">الغياب</Option>
            </Select>
          </Col>

          <Col xs={24} md={10}>
            <label className="block text-xs font-bold mb-1">بحث برقم الحركة أو البيان:</label>
            <Input
              placeholder="ابحث برقم الحركة أو البيان..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* Statement Table */}
      <Card className="shadow-sm" style={{ borderRadius: '12px' }}>
        <Table
          columns={columns}
          dataSource={filteredEntries}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: 'cursor-pointer hover:bg-amber-50 transition-colors',
          })}
          pagination={false}
          bordered
        />
      </Card>

      {/* Detail Modal */}
      <LedgerTransactionDetailModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        entry={selectedEntry}
      />

      {/* Financial Action Modal */}
      <QuickFinancialActionModal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        defaultEmployeeId={employee.id}
        defaultType={actionType}
      />
    </div>
  );
};

export default EmployeeStatementPage;
