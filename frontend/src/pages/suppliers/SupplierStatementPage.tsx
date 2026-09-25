import React, { useState } from 'react';
import { Card, Table, DatePicker, Select, Button, Row, Col, Space, Tag } from 'antd';
import { PrinterOutlined, FileExcelOutlined, SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';

const { RangePicker } = DatePicker;
const { Option } = Select;

export const SupplierStatementPage: React.FC<{ supplierId?: number; onBack?: () => void }> = ({
  supplierId = 1,
  onBack,
}) => {
  const [statementData] = useState([
    {
      id: 1,
      date: '2026-07-01',
      reference: 'BAL-2026-07-01',
      type: 'opening_balance',
      type_label: 'رصيد افتتاح',
      description: 'رصيد افتتاحي مستحق للمورد',
      debit: 0,
      credit: 500000, // 5,000.00 EGP credit (owed to supplier)
      running_balance: 500000,
      created_by: 'النظام',
    },
    {
      id: 2,
      date: '2026-07-08',
      reference: 'GRN-20260708-012',
      type: 'purchase_invoice',
      type_label: 'فاتورة توريد (GRN)',
      description: 'إذن استلام لحم بقر مفروم (50 كجم @ 320 ج.م)',
      debit: 0,
      credit: 1600000, // +16,000.00 EGP
      running_balance: 2100000, // 21,000.00 EGP total owed
      created_by: 'أمين المخزن',
    },
    {
      id: 3,
      date: '2026-07-18',
      reference: 'PMT-2026-0044',
      type: 'payment',
      type_label: 'سداد دفعة نقداً/بنكي',
      description: 'سداد جزء من حساب التوريد بموجب شيك بنكي',
      debit: 650000, // -6,500.00 EGP paid
      credit: 0,
      running_balance: 1450000, // 14,500.00 EGP remaining balance
      created_by: 'المحاسب الرئيسي',
    },
  ]);

  const columns = [
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      render: (val: string) => <span className="font-mono">{val}</span>,
    },
    {
      title: 'رقم المرجع / الإذن',
      dataIndex: 'reference',
      key: 'reference',
      render: (text: string) => <span className="font-mono text-blue-700 font-bold">{text}</span>,
    },
    {
      title: 'نوع الحركة',
      dataIndex: 'type_label',
      key: 'type',
      render: (label: string, record: any) => (
        <Tag color={record.debit > 0 ? 'green' : 'volcano'}>{label}</Tag>
      ),
    },
    {
      title: 'البيان والتفاصيل',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'مدين (مدفوعات للسداد -)',
      dataIndex: 'debit',
      key: 'debit',
      render: (val: number) => (val > 0 ? <MoneyDisplay amount={val} type="positive" /> : '-'),
    },
    {
      title: 'دائن (فواتير مستحقة +)',
      dataIndex: 'credit',
      key: 'credit',
      render: (val: number) => (val > 0 ? <MoneyDisplay amount={val} type="negative" /> : '-'),
    },
    {
      title: 'الرصيد التراكمي (المستحق)',
      dataIndex: 'running_balance',
      key: 'running_balance',
      render: (val: number) => <MoneyDisplay amount={val} type={val > 0 ? 'negative' : 'positive'} style={{ fontSize: '15px' }} />,
    },
    {
      title: 'المُنشئ',
      dataIndex: 'created_by',
      key: 'created_by',
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen dir-rtl" dir="rtl">
      {onBack && (
        <div className="mb-4">
          <Button icon={<ArrowRightOutlined />} onClick={onBack}>
            الرجوع إلى قائمة الموردين
          </Button>
        </div>
      )}

      <Card>
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h1 className="text-2xl font-bold text-gray-800 m-0">كشف حساب المورد (Supplier Ledger)</h1>
            <p className="text-gray-500 text-sm m-0 mt-1">كشف حركات دائن ومدين وتتبع الرصيد التراكمي المستحق للمورد: شركة النيل للحوم والطازج</p>
          </Col>
          <Col>
            <Space>
              <Button icon={<FileExcelOutlined />}>تصدير Excel</Button>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                طباعة كشف الحساب
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Statement Filter Toolbar */}
        <Row gutter={16} className="mb-6 bg-blue-50 p-4 rounded-lg">
          <Col xs={24} md={8}>
            <label className="block text-xs font-bold mb-1">الفترة الزمنية:</label>
            <RangePicker style={{ width: '100%' }} />
          </Col>
          <Col xs={12} md={6}>
            <label className="block text-xs font-bold mb-1">نوع الحركة:</label>
            <Select defaultValue="all" style={{ width: '100%' }}>
              <Option value="all">جميع الحركات</Option>
              <Option value="purchase_invoice">فواتير التوريد (GRN)</Option>
              <Option value="payment">المدفوعات والسداد</Option>
            </Select>
          </Col>
          <Col xs={24} md={4} className="flex items-end">
            <Button type="primary" icon={<SearchOutlined />} block>
              عرض كشف الحساب
            </Button>
          </Col>
        </Row>

        {/* Ledger Table */}
        <Table columns={columns} dataSource={statementData} rowKey="id" pagination={false} bordered />
      </Card>
    </div>
  );
};

export default SupplierStatementPage;
