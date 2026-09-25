import React, { useState } from 'react';
import { Table, Card, Row, Col, Button, Input, Select, Space, Tag, Modal, Form, InputNumber, message } from 'antd';
import { SearchOutlined, PlusOutlined, WarningOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import type { InventoryItem } from '@/types/inventory.types';

const { Option } = Select;

export const InventoryListPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [selectedItemForWaste, setSelectedItemForWaste] = useState<InventoryItem | null>(null);

  const [items] = useState<InventoryItem[]>([
    {
      id: 1,
      branch_id: 1,
      category_id: 1,
      uom_id: 1,
      sku: 'RAW-MEAT-01',
      name_ar: 'لحم بقر مفروم (بلدي)',
      name_en: 'Minced Beef',
      type: 'raw_material',
      current_stock: 45.5,
      reorder_level: 20.0,
      wac_unit_cost: 32000, // 320.00 EGP per kg WAC
      last_purchase_price: 33000,
      is_active: true,
      category: { id: 1, name_ar: 'لحوم وطازج' },
      uom: { id: 1, name_ar: 'كيلوجرام', symbol: 'كجم' },
    },
    {
      id: 2,
      branch_id: 1,
      category_id: 2,
      uom_id: 2,
      sku: 'RAW-DAIRY-05',
      name_ar: 'جبنة موزاريلا شيدر ميكس',
      name_en: 'Mozzarella Mix',
      type: 'raw_material',
      current_stock: 12.0,
      reorder_level: 15.0, // Alert: Stock < Reorder level
      wac_unit_cost: 18000, // 180.00 EGP per kg
      last_purchase_price: 18500,
      is_active: true,
      category: { id: 2, name_ar: 'ألبان وأجبان' },
      uom: { id: 2, name_ar: 'كيلوجرام', symbol: 'كجم' },
    },
    {
      id: 3,
      branch_id: 1,
      category_id: 3,
      uom_id: 3,
      sku: 'PKG-BOX-02',
      name_ar: 'علب برجر كرتون كرافت',
      name_en: 'Kraft Burger Box',
      type: 'packaging',
      current_stock: 1500,
      reorder_level: 500,
      wac_unit_cost: 350, // 3.50 EGP per piece
      last_purchase_price: 350,
      is_active: true,
      category: { id: 3, name_ar: 'تغليف وتعبئة' },
      uom: { id: 3, name_ar: 'قطعة', symbol: 'قطعة' },
    },
  ]);

  const handleRecordWasteSubmit = (values: any) => {
    message.success(`تم تسجيل هالك ${values.quantity} ${selectedItemForWaste?.uom?.symbol} وتخفيض الرصيد وتحديث الحسابات تلقائياً`);
    setIsWasteModalOpen(false);
  };

  const columns = [
    {
      title: 'كود الصنف (SKU)',
      dataIndex: 'sku',
      key: 'sku',
      render: (text: string) => <span className="font-mono font-bold text-blue-700">{text}</span>,
    },
    {
      title: 'اسم الخامة / الصنف',
      dataIndex: 'name_ar',
      key: 'name_ar',
      render: (name: string, record: InventoryItem) => (
        <div>
          <span className="font-bold">{name}</span>
          {record.current_stock <= record.reorder_level && (
            <Tag color="error" icon={<WarningOutlined />} className="mr-2">
              تنبيه حد إعادة الطلب!
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'التصنيف',
      dataIndex: ['category', 'name_ar'],
      key: 'category',
    },
    {
      title: 'الرصيد الحالي',
      key: 'current_stock',
      render: (_: any, record: InventoryItem) => (
        <span className={`font-mono font-bold ${record.current_stock <= record.reorder_level ? 'text-red-600' : 'text-gray-800'}`}>
          {record.current_stock} {record.uom?.symbol}
        </span>
      ),
    },
    {
      title: 'متوسط التكلفة المرجح (WAC)',
      dataIndex: 'wac_unit_cost',
      key: 'wac_unit_cost',
      render: (val: number, record: InventoryItem) => (
        <div>
          <MoneyDisplay amount={val} />
          <span className="text-xs text-gray-400 block">لكل {record.uom?.symbol}</span>
        </div>
      ),
    },
    {
      title: 'إجمالي تقييم المخزون',
      key: 'total_valuation',
      render: (_: any, record: InventoryItem) => (
        <MoneyDisplay amount={Math.round(record.current_stock * record.wac_unit_cost)} type="positive" />
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: InventoryItem) => (
        <Space>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedItemForWaste(record);
              setIsWasteModalOpen(true);
            }}
          >
            تسجيل هالك
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen dir-rtl" dir="rtl">
      <Card>
        {/* Header Toolbar */}
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h1 className="text-2xl font-bold text-gray-800 m-0">إدارة المخزون وأصناف الخامات</h1>
            <p className="text-gray-500 text-sm m-0 mt-1">تقييم المخزون بالمتوسط المرجح (WAC) والتنبيه التلقائي لنواقص المطبخ</p>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />}>تحديث الأرصدة</Button>
              <Button type="primary" icon={<PlusOutlined />}>إضافة خامة جديدة</Button>
            </Space>
          </Col>
        </Row>

        {/* Search & Summary Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} md={12}>
            <Input
              placeholder="البحث باسم الخامة، الكود SKU، أو الباركوود..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" className="bg-blue-50 text-center">
              <span className="text-xs text-gray-500 block">إجمالي قيمة المخزون الحالي</span>
              <MoneyDisplay amount={1722500} type="positive" style={{ fontSize: '18px' }} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" className="bg-red-50 text-center">
              <span className="text-xs text-gray-500 block">أصناف تجاوزت حد الطلب</span>
              <span className="text-xl font-bold text-red-600">1 أصناف</span>
            </Card>
          </Col>
        </Row>

        {/* Inventory Data Table */}
        <Table columns={columns} dataSource={items} rowKey="id" pagination={{ pageSize: 10 }} bordered />
      </Card>

      {/* Record Waste Modal */}
      {isWasteModalOpen && selectedItemForWaste && (
        <Modal
          title={`تسجيل هالك / فاقد مطبخ: ${selectedItemForWaste.name_ar}`}
          open={isWasteModalOpen}
          onCancel={() => setIsWasteModalOpen(false)}
          footer={null}
        >
          <Form layout="vertical" onFinish={handleRecordWasteSubmit}>
            <Form.Item label={`الكمية التالفة (${selectedItemForWaste.uom?.symbol})`} name="quantity" rules={[{ required: true, message: 'يرجى إدخال الكمية' }]}>
              <InputNumber style={{ width: '100%' }} min={0.1} max={selectedItemForWaste.current_stock} step={0.1} />
            </Form.Item>
            <Form.Item label="سبب التلف / الهالك" name="reason" rules={[{ required: true, message: 'يرجى إدخال السبب' }]}>
              <Input.TextArea placeholder="مثال: انتهاء صلاحية، تلف أثناء التحضير..." />
            </Form.Item>
            <Button type="primary" danger block htmlType="submit">
              تأكيد خصم الهالك من المخزن
            </Button>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default InventoryListPage;
