import React, { useState } from 'react';
import { Table, Card, Row, Col, Select, DatePicker, Tag, Button, Space } from 'antd';
import { SearchOutlined, PrinterOutlined, FileExcelOutlined } from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';

const { RangePicker } = DatePicker;
const { Option } = Select;

export const StockMovementsPage: React.FC = () => {
  const [movements] = useState([
    {
      id: 1,
      date: '2026-07-22 14:30',
      reference: 'GRN-20260722-101',
      item_name: 'لحم بقر مفروم (بلدي)',
      type_label: 'شراء وإذن استلام (GRN)',
      warehouse: 'المخزن الرئيسي',
      quantity: '+50.0 كجم',
      unit_cost: 33000,
      total_cost: 1650000,
      stock_after: '95.5 كجم',
      user: 'أمين المخزن',
    },
    {
      id: 2,
      date: '2026-07-22 11:15',
      reference: 'WST-20260722-004',
      item_name: 'جبنة موزاريلا شيدر ميكس',
      type_label: 'تخريد وهالك مطبخ',
      warehouse: 'مخزن المطبخ',
      quantity: '-1.5 كجم',
      unit_cost: 18000,
      total_cost: 27000,
      stock_after: '12.0 كجم',
      user: 'الشيف الرئيسي',
    },
  ]);

  const columns = [
    {
      title: 'التاريخ والوقت',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => <span className="font-mono">{text}</span>,
    },
    {
      title: 'رقم المرجع',
      dataIndex: 'reference',
      key: 'reference',
      render: (text: string) => <span className="font-mono font-bold text-blue-700">{text}</span>,
    },
    {
      title: 'الصنف والخامة',
      dataIndex: 'item_name',
      key: 'item_name',
      render: (text: string) => <span className="font-bold">{text}</span>,
    },
    {
      title: 'نوع الحركة',
      dataIndex: 'type_label',
      key: 'type_label',
      render: (label: string, record: any) => (
        <Tag color={record.quantity.startsWith('+') ? 'green' : 'red'}>{label}</Tag>
      ),
    },
    {
      title: 'المخزن',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: 'الكمية',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: string) => (
        <span className={`font-mono font-bold ${qty.startsWith('+') ? 'text-green-700' : 'text-red-600'}`}>
          {qty}
        </span>
      ),
    },
    {
      title: 'تكلفة الوحدة',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      render: (val: number) => <MoneyDisplay amount={val} />,
    },
    {
      title: 'إجمالي الحركة',
      dataIndex: 'total_cost',
      key: 'total_cost',
      render: (val: number) => <MoneyDisplay amount={val} />,
    },
    {
      title: 'الرصيد بعدها',
      dataIndex: 'stock_after',
      key: 'stock_after',
      render: (val: string) => <span className="font-mono font-bold">{val}</span>,
    },
    {
      title: 'المُنفذ',
      dataIndex: 'user',
      key: 'user',
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen dir-rtl" dir="rtl">
      <Card>
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h1 className="text-2xl font-bold text-gray-800 m-0">سجل حركات التدقيق للمخزون (Stock Movement Audit Trail)</h1>
            <p className="text-gray-500 text-sm m-0 mt-1">تتبع تاريخي غير قابل للتعديل لكافة عمليات الدخول، الخروج، والتخريد</p>
          </Col>
          <Col>
            <Space>
              <Button icon={<FileExcelOutlined />}>تصدير Excel</Button>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                طباعة السجل
              </Button>
            </Space>
          </Col>
        </Row>

        <Table columns={columns} dataSource={movements} rowKey="id" pagination={{ pageSize: 15 }} bordered />
      </Card>
    </div>
  );
};

export default StockMovementsPage;
