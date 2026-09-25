import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Tabs,
  Avatar,
  Tag,
  Button,
  Statistic,
  Space,
  Table,
  Timeline,
  Descriptions,
  message,
  Popconfirm,
  Empty,
} from 'antd';
import {
  UserOutlined,
  ArrowRightOutlined,
  EditOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useHr, TransactionTypeKey } from '@/context/HrContext';
import { EmployeeFormModal, EmployeeFormValues } from '@/components/modules/hr/EmployeeFormModal';
import { QuickFinancialActionModal } from '@/components/modules/hr/QuickFinancialActionModal';

export const EmployeeProfilePage: React.FC<{
  employeeId: number;
  onBack?: () => void;
}> = ({ employeeId, onBack }) => {
  const {
    employees,
    getEmployeeLedger,
    getFinancialPosition,
    updateEmployee,
    deleteEmployee,
    clearEmployeeLedger,
  } = useHr();

  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<TransactionTypeKey>('advance');

  const employee = employees.find((e) => e.id === employeeId) || employees[0];

  if (!employee) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen dir-rtl text-center" dir="rtl">
        <Card className="py-12">
          <Empty description="لم يتم العثور على بيانات هذا الموظف">
            <Button icon={<ArrowRightOutlined />} onClick={onBack}>
              الرجوع لقائمة الموظفين
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const ledgerEntries = getEmployeeLedger(employee.id);
  const financialPos = getFinancialPosition(employee.id);

  const handleEditSubmit = (values: EmployeeFormValues) => {
    updateEmployee(employee.id, values);
    message.success(`تم تحديث بيانات الموظف ${values.name_ar} بنجاح`);
  };

  const openAction = (type: TransactionTypeKey = 'advance') => {
    setActionType(type);
    setActionModalOpen(true);
  };

  const tabItems = [
    {
      key: 'overview',
      label: 'نظرة عامة',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="بيانات التواصل والتوظيف الأساسية" size="small">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="رقم الهاتف">
                  <span className="font-mono font-bold">{employee.phone}</span>
                </Descriptions.Item>
                <Descriptions.Item label="الرقم القومي">
                  <span className="font-mono">{employee.national_id || 'غير مسجل'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="القسم">{employee.department?.name_ar || 'قسم عام'}</Descriptions.Item>
                <Descriptions.Item label="المسمى الوظيفي">{employee.job_title?.name_ar || 'عامل'}</Descriptions.Item>
                <Descriptions.Item label="تاريخ التعيين">{employee.hire_date}</Descriptions.Item>
                <Descriptions.Item label="نوع العقد">
                  {employee.contract_type === 'full_time'
                    ? 'دوام كامل (شهري)'
                    : employee.contract_type === 'part_time'
                    ? 'دوام جزئي'
                    : employee.contract_type === 'daily'
                    ? 'باليومية'
                    : 'مؤقت'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="ملخص الحساب والعمليات المالية الأخيرة" size="small">
              {ledgerEntries.length === 0 ? (
                <Empty description="لا توجد حركات مالية مسجلة لهذا الموظف حتى الآن" />
              ) : (
                <Timeline className="mt-2">
                  {ledgerEntries.slice(-5).reverse().map((entry) => (
                    <Timeline.Item
                      key={entry.id}
                      color={entry.debit > 0 ? 'green' : 'red'}
                    >
                      <div className="font-semibold text-gray-800">
                        {entry.transaction_type_label || entry.description} —{' '}
                        {entry.debit > 0 ? (
                          <span className="text-emerald-700 font-bold">+{(entry.debit / 100).toLocaleString('ar-EG')} ج.م</span>
                        ) : (
                          <span className="text-red-600 font-bold">-{(entry.credit / 100).toLocaleString('ar-EG')} ج.م</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{entry.transaction_date}</div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'statement',
      label: 'كشف الحساب التفصيلي',
      children: (
        <Card
          size="small"
          title="كشف حساب الموظف التراكمي (Ledger Statement)"
          extra={
            <Popconfirm
              title="تفريغ كشف الحساب؟"
              description="سوف يتم مسح كافة حركات كشف حساب هذا الموظف"
              onConfirm={() => {
                clearEmployeeLedger(employee.id);
                message.success('تم تفريغ كشف حساب الموظف');
              }}
              okText="تأكيد المسح"
              cancelText="إلغاء"
            >
              <Button size="small" icon={<ClearOutlined />} danger>
                تفريغ كشف الحساب
              </Button>
            </Popconfirm>
          }
        >
          <Table
            size="small"
            dataSource={ledgerEntries}
            rowKey="id"
            columns={[
              { title: 'التاريخ', dataIndex: 'transaction_date', key: 'transaction_date', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
              { title: 'رقم الحركة', dataIndex: 'transaction_number', key: 'transaction_number', render: (v: string) => <span className="font-mono text-amber-700 font-bold">{v}</span> },
              { title: 'نوع الحركة', dataIndex: 'transaction_type_label', key: 'transaction_type_label' },
              { title: 'البيان والتفاصيل', dataIndex: 'description', key: 'description' },
              {
                title: 'مستحقات (+)',
                dataIndex: 'debit',
                key: 'debit',
                render: (v: number) => (v > 0 ? <MoneyDisplay amount={v} type="positive" /> : '-'),
              },
              {
                title: 'مقتطعات / سلف (-)',
                dataIndex: 'credit',
                key: 'credit',
                render: (v: number) => (v > 0 ? <MoneyDisplay amount={v} type="negative" /> : '-'),
              },
              {
                title: 'الرصيد الجاري',
                dataIndex: 'running_balance',
                key: 'running_balance',
                render: (v: number) => <MoneyDisplay amount={v} type={v >= 0 ? 'positive' : 'negative'} style={{ fontWeight: 'bold' }} />,
              },
            ]}
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: 'personal',
      label: 'البيانات الشخصية والإدارية',
      children: (
        <Card size="small">
          <Descriptions title="تفاصيل البيانات الشخصية" bordered column={2}>
            <Descriptions.Item label="الاسم الكامل">{employee.name_ar}</Descriptions.Item>
            <Descriptions.Item label="رقم الكود">{employee.employee_number}</Descriptions.Item>
            <Descriptions.Item label="الرقم القومي">{employee.national_id || 'غير مدخل'}</Descriptions.Item>
            <Descriptions.Item label="رقم الهاتف">{employee.phone}</Descriptions.Item>
            <Descriptions.Item label="الفرع">{employee.branch?.name_ar || 'الفرع الرئيسي'}</Descriptions.Item>
            <Descriptions.Item label="تاريخ الإضافة بالنظام">{employee.created_at}</Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen dir-rtl" dir="rtl">
      <div className="mb-4 flex justify-between items-center">
        <Button icon={<ArrowRightOutlined />} onClick={onBack}>
          الرجوع إلى قائمة الموظفين
        </Button>
        <Space>
          <Button
            type="primary"
            style={{ background: '#d97706', borderColor: '#b45309' }}
            icon={<PlusCircleOutlined />}
            onClick={() => openAction('advance')}
          >
            + تسجيل حركة مالية / سلفة
          </Button>
          <Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
            تعديل بيانات الموظف
          </Button>
          <Popconfirm
            title="حذف هذا الموظف؟"
            onConfirm={() => {
              deleteEmployee(employee.id);
              message.success('تم حذف الموظف');
              onBack?.();
            }}
            okText="حذف"
            cancelText="إلغاء"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              حذف الموظف
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card className="mb-6 shadow-sm">
        <Row align="middle" gutter={16}>
          <Col>
            <Avatar size={70} icon={<UserOutlined />} style={{ backgroundColor: '#d97706' }} />
          </Col>
          <Col flex="1">
            <h2 className="text-2xl font-bold m-0 text-gray-800">{employee.name_ar}</h2>
            <div className="text-gray-500 font-semibold mt-1">
              {employee.job_title?.name_ar || 'وظيفة عامة'} — {employee.department?.name_ar || 'قسم عام'}
            </div>
            <Space className="mt-2">
              <Tag color="amber">{employee.employee_number}</Tag>
              <Tag color="blue">{employee.branch?.name_ar || 'مطعم رابحة الرئيسي'}</Tag>
              <StatusBadge
                status={employee.status}
                label={employee.status === 'active' ? 'نشط بالعمل' : employee.status === 'on_leave' ? 'في إجازة' : 'مؤرشف'}
              />
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={12} md={6}>
            <Card size="small" className="bg-amber-50 text-center border-amber-200">
              <Statistic title="الراتب الأساسي" valueRender={() => <MoneyDisplay amount={employee.base_salary} />} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" className="bg-emerald-50 text-center border-emerald-200">
              <Statistic title="الصافي المستحق الحالى" valueRender={() => <MoneyDisplay amount={financialPos.current_balance} type={financialPos.current_balance >= 0 ? 'positive' : 'negative'} />} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" className="bg-red-50 text-center border-red-200">
              <Statistic title="إجمالي السلف والخصومات" valueRender={() => <MoneyDisplay amount={financialPos.current_advances_balance + financialPos.total_deductions_ytd} type="negative" />} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" className="bg-blue-50 text-center border-blue-200">
              <Statistic title="إجمالي المكافآت والإضافي" valueRender={() => <MoneyDisplay amount={financialPos.total_bonuses_ytd + financialPos.total_overtime_ytd} type="positive" />} />
            </Card>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} type="card" />
      </Card>

      <EmployeeFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialValues={employee}
        mode="edit"
      />

      <QuickFinancialActionModal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        defaultEmployeeId={employee.id}
        defaultType={actionType}
      />
    </div>
  );
};

export default EmployeeProfilePage;
