import React, { useState } from 'react';
import { Table, Card, Row, Col, Button, Select, Space, Tag, Modal, Form, Input, InputNumber, message, Divider } from 'antd';
import { PlusOutlined, CheckCircleOutlined, CalculatorOutlined } from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { PurchaseOrder } from '@/types/inventory.types';

export const PurchaseOrderListPage: React.FC = () => {
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  const [orders] = useState<PurchaseOrder[]>([
    {
      id: 1,
      branch_id: 1,
      supplier_id: 1,
      supplier_name: 'شركة النيل للحوم والطازج',
      po_number: 'PO-202607-001',
      order_date: '2026-07-20',
      expected_delivery_date: '2026-07-22',
      subtotal: 1600000,
      tax_amount: 0,
      total_amount: 1600000, // 16,000.00 EGP
      status: 'approved',
    },
    {
      id: 2,
      branch_id: 1,
      supplier_id: 2,
      supplier_name: 'مؤسسة الأهرام للألبان والتعبئة',
      po_number: 'PO-202607-002',
      order_date: '2026-07-21',
      expected_delivery_date: '2026-07-23',
      subtotal: 350000,
      tax_amount: 0,
      total_amount: 350000, // 3,500.00 EGP
      status: 'received',
    },
  ]);

  const handleReceiveGrnSubmit = () => {
    message.loading('جاري استلام البضاعة وإعادة احتساب المتوسط المرجح (WAC) وترحيل كشف المورد...', 1.5).then(() => {
      message.success('تم تنفيذ إذن الاستلام GRN وإعادة حساب WAC وترحيل الفاتورة لحساب المورد بنجاح');
      setIsGrnModalOpen(false);
    });
  };

  const columns = [
    {
      title: 'رقم أمر الشراء (PO)',
      dataIndex: 'po_number',
      key: 'po_number',
      render: (text: string) => <span className="font-mono font-bold text-blue-700">{text}</span>,
    },
    {
      title: 'المورد',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
      render: (name: string) => <span className="font-bold">{name}</span>,
    },
    {
      title: 'تاريخ الطلب',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date: string) => <span className="font-mono">{date}</span>,
    },
    {
      title: 'الإجمالي (ج.م)',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val: number) => <MoneyDisplay amount={val} type="positive" style={{ fontSize: '15px' }} />,
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status} label={status === 'received' ? 'مستلم بالكامل' : 'معتماد للانتظار'} />,
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: PurchaseOrder) => (
        <Space>
          {record.status === 'approved' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setSelectedPo(record);
                setIsGrnModalOpen(true);
              }}
            >
              إذن استلام بضاعة (GRN)
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen dir-rtl" dir="rtl">
      <Card>
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h1 className="text-2xl font-bold text-gray-800 m-0">أوامر الشراء واستلام البضائع (PO & GRN)</h1>
            <p className="text-gray-500 text-sm m-0 mt-1">دورة المشتريات من إنشآء أمر الشراء إلى استلام المخزن وإعادة حساب الـ WAC</p>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />}>إنشاء أمر شراء جديد (PO)</Button>
          </Col>
        </Row>

        <Table columns={columns} dataSource={orders} rowKey="id" pagination={{ pageSize: 10 }} bordered />
      </Card>

      {/* GRN Receiving Modal with WAC Preview */}
      {isGrnModalOpen && selectedPo && (
        <Modal
          title={`إذن استلام بضاعة (GRN) لأمر الشراء: ${selectedPo.po_number}`}
          open={isGrnModalOpen}
          onCancel={() => setIsGrnModalOpen(false)}
          width={700}
          onOk={handleReceiveGrnSubmit}
          okText="تأكيد استلام البضاعة وتحديث WAC"
        >
          <div className="dir-rtl p-2" dir="rtl">
            <div className="mb-4">
              <strong>المورد:</strong> {selectedPo.supplier_name}
            </div>

            {/* WAC Preview Calculation Box */}
            <Card size="small" className="bg-blue-50 mb-4 border-blue-200">
              <h4 className="font-bold text-blue-900 m-0 mb-2">
                <CalculatorOutlined /> المعاينة التلقائية للمتوسط المرجح (WAC):
              </h4>
              <div className="text-xs space-y-1">
                <div>الصنف: <strong>لحم بقر مفروم (بلدي)</strong></div>
                <div>الكمية الحالية: 45.5 كجم @ WAC قديم: 320.00 ج.م</div>
                <div>الكمية المستلمة: 50.0 كجم @ سعر الشراء الحالي: 330.00 ج.م</div>
                <Divider style={{ margin: '6px 0' }} />
                <div className="font-bold text-green-800">
                  المتوسط المرجح الجديد بعد الاستلام: <strong>325.24 ج.م / كجم</strong>
                </div>
              </div>
            </Card>

            <Form layout="vertical">
              <Form.Item label="رقم إذن تسليم المورد (Delivery Note Number)">
                <Input placeholder="مثال: DN-889911" />
              </Form.Item>
            </Form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PurchaseOrderListPage;
