import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Card,
  Avatar,
  Row,
  Col,
  message,
  Popconfirm,
  Dropdown,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  UserOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ClearOutlined,
  ReloadOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { QuickFinancialActionModal } from '@/components/modules/hr/QuickFinancialActionModal';
import { EmployeeFormModal, EmployeeFormValues } from '@/components/modules/hr/EmployeeFormModal';
import { useHr, TransactionTypeKey } from '@/context/HrContext';
import type { Employee } from '@/types/hr.types';

const { Option } = Select;

export const EmployeeListPage: React.FC<{
  onSelectEmployee?: (id: number) => void;
}> = ({ onSelectEmployee }) => {
  const {
    employees,
    getFinancialPosition,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    clearAllEmployees,
    clearAllTransactions,
  } = useHr();

  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Financial Quick Action Modal State
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [targetEmpId, setTargetEmpId] = useState<number>(1);
  const [actionType, setActionType] = useState<TransactionTypeKey>('advance');

  // Employee Form Modal (Add / Edit) State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'add' | 'edit'>('add');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const openAction = (empId: number, type: TransactionTypeKey = 'advance') => {
    setTargetEmpId(empId);
    setActionType(type);
    setActionModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setFormModalMode('add');
    setEditingEmployee(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setFormModalMode('edit');
    setEditingEmployee(emp);
    setFormModalOpen(true);
  };

  const handleFormSubmit = (values: EmployeeFormValues) => {
    if (formModalMode === 'add') {
      const created = addEmployee(values);
      message.success(`تمت إضافة الموظف "${created.name_ar}" بنجاح (${created.employee_number})`);
    } else if (formModalMode === 'edit' && editingEmployee) {
      updateEmployee(editingEmployee.id, values);
      message.success(`تم تحديث بيانات الموظف "${values.name_ar}" بنجاح`);
    }
  };

  const handleDelete = (emp: Employee) => {
    deleteEmployee(emp.id);
    message.success(`تم حذف الموظف "${emp.name_ar}" من النظام`);
  };

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.name_ar.includes(searchText) ||
      e.employee_number.includes(searchText) ||
      e.phone.includes(searchText);

    const matchesDept = !selectedDepartment || e.department?.name_ar === selectedDepartment;
    const matchesStatus = !selectedStatus || e.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Extract unique departments dynamically
  const uniqueDepartments = Array.from(
    new Set(employees.map((e) => e.department?.name_ar).filter(Boolean))
  );

  const columns = [
    {
      title: 'كود',
      dataIndex: 'employee_number',
      key: 'employee_number',
      width: 90,
      render: (text: string, record: Employee) => (
        <a
          className="font-mono font-bold text-amber-700 hover:text-amber-800"
          onClick={() => onSelectEmployee?.(record.id)}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'اسم الموظف',
      dataIndex: 'name_ar',
      key: 'name_ar',
      render: (text: string, record: Employee) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#d97706' }} />
          <div>
            <div
              className="font-bold text-gray-800 cursor-pointer hover:text-amber-700"
              onClick={() => onSelectEmployee?.(record.id)}
            >
              {text}
            </div>
            <div className="text-xs text-gray-500">{record.job_title?.name_ar || 'عامل'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'القسم',
      dataIndex: ['department', 'name_ar'],
      key: 'department',
      render: (text: string) => text || 'قسم عام',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <StatusBadge
          status={status}
          label={status === 'active' ? 'نشط' : status === 'on_leave' ? 'إجازة' : 'مؤرشف'}
        />
      ),
    },
    {
      title: 'الراتب الأساسي',
      dataIndex: 'base_salary',
      key: 'base_salary',
      render: (val: number) => <MoneyDisplay amount={val} />,
    },
    {
      title: 'الصافي المستحق الحالى',
      key: 'net_position',
      render: (_: any, record: Employee) => {
        const position = getFinancialPosition(record.id);
        return (
          <div>
            <MoneyDisplay
              amount={position.current_balance}
              type={position.current_balance >= 0 ? 'positive' : 'negative'}
              style={{ fontSize: '14px', fontWeight: 'bold' }}
            />
            {position.is_prorated && (
              <div className="text-[10px] text-amber-700 font-bold">
                مجزأ ({position.worked_days} يوم من {position.total_days_in_month})
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'الهاتف',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => <span className="font-mono text-xs">{phone}</span>,
    },
    {
      title: 'الإجراءات والعمليات',
      key: 'actions',
      render: (_: any, record: Employee) => (
        <Space wrap size="small">
          <Button
            size="small"
            type="primary"
            style={{ background: '#d97706', borderColor: '#b45309' }}
            icon={<PlusCircleOutlined />}
            onClick={() => openAction(record.id, 'advance')}
          >
            حركة مالية
          </Button>

          <Button
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => onSelectEmployee?.(record.id)}
          >
            كشف حساب
          </Button>

          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
          >
            تعديل
          </Button>

          <Popconfirm
            title="هل أنت تأكد من حذف هذا الموظف؟"
            description="سوف يتم مسح كافة سجلات الموظف"
            onConfirm={() => handleDelete(record)}
            okText="نعم، احذف"
            cancelText="إلغاء"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dataManagementMenu = {
    items: [
      {
        key: 'clear-all',
        icon: <ClearOutlined className="text-red-500" />,
        label: <span className="text-red-600 font-bold">تفريغ ومسح جميع الموظفين (بداية جديدة)</span>,
        onClick: () => {
          clearAllEmployees();
          message.success('تم مسح جميع بيانات الموظفين بنجاح. يمكنك الآن إضافة موظفيك الحقيقيين');
        },
      },
      {
        key: 'clear-txns',
        icon: <ClearOutlined className="text-orange-500" />,
        label: <span>تفريغ المعاملات المالية فقط (تصفير السلف والخصومات)</span>,
        onClick: () => {
          clearAllTransactions();
          message.success('تم تفريغ كافة الحركات المالية والسلف بنجاح');
        },
      },
    ],
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen dir-rtl" dir="rtl">
      <Card className="shadow-sm" style={{ borderRadius: '12px' }}>
        {/* Header Toolbar */}
        <Row justify="space-between" align="middle" className="mb-6" gutter={[16, 16]}>
          <Col>
            <h1 className="text-2xl font-bold text-gray-800 m-0">شؤون الموظفين — مطعم رابحة</h1>
            <p className="text-gray-500 text-sm m-0 mt-1">
              إدارة بيانات وشؤون {employees.length} موظف بالمطعم وتحديث حساباتهم ورواتبهم
            </p>
          </Col>
          <Col>
            <Space wrap>
              <Button
                type="primary"
                size="large"
                style={{ background: '#d97706', borderColor: '#b45309', fontWeight: 'bold' }}
                icon={<UserAddOutlined />}
                onClick={handleOpenAddModal}
              >
                + إضافة موظف جديد
              </Button>

              <Dropdown menu={dataManagementMenu} trigger={['click']}>
                <Button size="large" icon={<ExclamationCircleOutlined />}>
                  إدارة وتنظيف البيانات <DownOutlined />
                </Button>
              </Dropdown>

              <Button icon={<FileExcelOutlined />} onClick={() => message.info('جاري تصدير قائمة الموظفين إلى Excel')}>
                تصدير Excel
              </Button>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                طباعة
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Search and Filters */}
        <Row gutter={16} className="mb-4">
          <Col xs={24} md={10}>
            <Input
              placeholder="البحث بالاسم، الكود، أو رقم الهاتف..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={7}>
            <Select
              placeholder="القسم"
              style={{ width: '100%' }}
              allowClear
              onChange={(val) => setSelectedDepartment(val)}
            >
              {uniqueDepartments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={7}>
            <Select
              placeholder="حالة التوظيف"
              style={{ width: '100%' }}
              allowClear
              onChange={(val) => setSelectedStatus(val)}
            >
              <Option value="active">نشط بالعمل</Option>
              <Option value="on_leave">في إجازة</Option>
              <Option value="archived">مؤرشف</Option>
            </Select>
          </Col>
        </Row>

        {/* Data Table or Empty State */}
        {employees.length === 0 ? (
          <Card className="py-12 text-center border-dashed border-2 border-gray-300 rounded-lg">
            <Empty
              description={<span className="text-gray-600 text-base font-semibold">لا يوجد أي موظفين حالياً بالسجل</span>}
            >
              <Space className="mt-4">
                <Button
                  type="primary"
                  size="large"
                  style={{ background: '#d97706', borderColor: '#b45309' }}
                  icon={<UserAddOutlined />}
                  onClick={handleOpenAddModal}
                >
                  إضافة أول موظف للمطعم
                </Button>
              </Space>
            </Empty>
          </Card>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            bordered
          />
        )}
      </Card>

      <QuickFinancialActionModal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        defaultEmployeeId={targetEmpId}
        defaultType={actionType}
      />

      <EmployeeFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingEmployee}
        mode={formModalMode}
      />
    </div>
  );
};

export default EmployeeListPage;
