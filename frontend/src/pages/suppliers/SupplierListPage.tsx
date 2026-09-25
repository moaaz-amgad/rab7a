import React, { useState } from 'react';
import { Table, Card, Row, Col, Button, Input, Space, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import type { Supplier } from '@/types/inventory.types';

export const SupplierListPage: React.FC<{ onSelectSupplierStatement?: (id: number) => void }> = ({
  onSelectSupplierStatement,
}) => {
  const [searchText, setSearchText] = useState('');

  const [suppliers] = useState<Supplier[]>([
    {
      id: 1,
      branch_id: 1,
      code: 'SUP-001',
      name_ar: 'شركة النيل للحوم والطازج',
      name_en: 'El Nile Meats Co.',
      company_name: 'شركة النيل للاستيراد والتوزيع',
      tax_number: '123-456-789',
      phone: '01001112233',
      payment_terms_days: 30,
      credit_limit: 5000000, // 50,000.00 EGP credit limit
      current_balance: 1450000, // 14,500.00 EGP current balance (owed to supplier)
      status: 'active',
    },
    {
      id: 2,
      branch_id: 1,
      code: 'SUP-002',
      name_ar: 'مؤسسة الأهرام للألبان والتعبئة',
      name_en: 'Al Ahram Dairy & Packaging',
      company_name: 'مؤسسة الأهرام للتجارة',
      tax_number: '987-654-321',
      phone: '01122334455',
      payment_terms_days: 15,
      credit_limit: 2000000, // 20,000.00 EGP
      current_balance: 0, // Paid in full
      status: 'active',
    },
  ]);

  const columns = [
    {
      title: 'كود المورد',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <span className="font-mono font-bold text-blue-700">{text}</span>,
    },
    {
      title: 'اسم المورد والشركة',
      key: 'name_ar',
      render: (_: any, record: Supplier) => (
        <div>
          <span className="font-bold block">{record.name_ar}</span>
          <span className="text-xs text-gray-400">{record.company_name}</span>
        </div>
      ),
    },
    {
      title: 'رقم الهاتف والتواصل',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => <span className="font-mono">{phone}</span>,
    },
    {
      title: 'فترة السداد المتاحة',
      dataIndex: 'payment_terms_days',
      key: 'payment_terms_days',
      render: (days: number) => <span>{days} يومآ</span>,
    },
    {
      title: 'الحد الأقصى للائتمان',
      dataIndex: 'credit_limit',
      key: 'credit_limit',
      render: (val: number) => <MoneyDisplay amount={val} />,
    },
    {
      title: 'الرصيد المستحق الحالي',
      dataIndex: 'current_balance',
      key: 'current_balance',
      render: (val: number) => <MoneyDisplay amount={val} type={val > 0 ? 'negative' : 'neutral'} style={{ fontSize: '15px' }} />,
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'نشط' : 'موقوف'}</Tag>,
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: Supplier) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<FileTextOutlined />}
            onClick={() => onSelectSupplierStatement?.(record.id)}
          >
            كشف حساب المورد
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen dir-rtl" dir="rtl">
      <Card>
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h1 className="text-2xl font-bold text-gray-800 m-0">قائمة الموردين وحسابات الدائنين</h1>
            <p className="text-gray-500 text-sm m-0 mt-1">متابعة أرصدة الموردين وفترات السداد وكشوف الحسابات التراكمية</p>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />}>إضافة مورد جديد</Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col span={12}>
            <Input
              placeholder="البحث باسم المورد، كود المورد، أو رقم الهاتف..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        <Table columns={columns} dataSource={suppliers} rowKey="id" pagination={{ pageSize: 10 }} bordered />
      </Card>
    </div>
  );
};

export default SupplierListPage;
