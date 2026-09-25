import React from 'react';
import { Modal, Descriptions, Tag, Button, Card, Divider, Space } from 'antd';
import { PaperClipOutlined, PrinterOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import type { EmployeeAccountLedgerEntry } from '@/types/hr.types';

interface LedgerTransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  entry: EmployeeAccountLedgerEntry | null;
}

export const LedgerTransactionDetailModal: React.FC<LedgerTransactionDetailModalProps> = ({
  open,
  onClose,
  entry,
}) => {
  if (!entry) return null;

  const isDebit = entry.debit > 0;
  const amount = isDebit ? entry.debit : entry.credit;

  return (
    <Modal
      title={
        <div className="flex items-center justify-between dir-rtl" dir="rtl">
          <div>
            <span className="font-bold text-lg">تفاصيل الحركة المالية: {entry.transaction_number}</span>
            <Tag color={isDebit ? 'green' : 'volcano'} className="mr-2">
              {entry.transaction_type_label || entry.transaction_type}
            </Tag>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
          طباعة الإيصال
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          إغلاق
        </Button>,
      ]}
    >
      <div className="dir-rtl p-2" dir="rtl">
        {/* Key Amount Summary Banner */}
        <Card size="small" className={`mb-4 text-center ${isDebit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <span className="text-xs text-gray-500 block mb-1">مبلغ الحركة المباشرة</span>
          <MoneyDisplay amount={amount} type={isDebit ? 'positive' : 'negative'} style={{ fontSize: '24px' }} />
          <span className="text-xs text-gray-400 block mt-1">الرصيد بعد الحركة: <MoneyDisplay amount={entry.running_balance} /></span>
        </Card>

        {/* Detailed Descriptions Grid */}
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="رقم المعاملة">{entry.transaction_number}</Descriptions.Item>
          <Descriptions.Item label="رقم المرجع (Ref)">{entry.reference_number}</Descriptions.Item>
          <Descriptions.Item label="تاريخ الحركة">{entry.transaction_date}</Descriptions.Item>
          <Descriptions.Item label="تاريخ التسجيل">{entry.recording_date}</Descriptions.Item>
          <Descriptions.Item label="دورة المرتبات">{entry.payroll_period || 'غير مرتبط بدورة محددة'}</Descriptions.Item>
          <Descriptions.Item label="نوع الحركة">{entry.transaction_type_label || entry.transaction_type}</Descriptions.Item>
          <Descriptions.Item label="المستند المرتبط">{entry.related_document_type ? `${entry.related_document_type} #${entry.related_document_id}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="المُنشئ">{entry.created_by_name || 'النظام / المحاسب الرئيسي'}</Descriptions.Item>
          <Descriptions.Item label="البيان والتفاصيل" span={2}>{entry.description}</Descriptions.Item>
          <Descriptions.Item label="ملاحظات إضافية" span={2}>{entry.notes || 'لا يوجد ملاحظات إضافية'}</Descriptions.Item>
        </Descriptions>

        {/* Specialized Breakdown for specific types */}
        {entry.transaction_type === 'advance' && (
          <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
            <h4 className="font-bold text-yellow-900 m-0 mb-1">بيانات السلفة:</h4>
            <div className="text-xs text-gray-700">
              مبلغ السلفة الأصلي: <MoneyDisplay amount={amount} /> | المتبقي للخصم: <MoneyDisplay amount={amount} type="negative" />
            </div>
          </div>
        )}

        {entry.transaction_type === 'salary_payment' && (
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <h4 className="font-bold text-blue-900 m-0 mb-1">تفاصيل صرف مسير الراتب:</h4>
            <div className="text-xs text-gray-700 space-y-1">
              <div>طريقة الصرف: <strong>خزينة المطعم الرئيسية (نقداً)</strong></div>
              <div>تم الصرف بواسطة: <strong>مدير الحسابات الرئيسي</strong></div>
            </div>
          </div>
        )}

        {/* Attachments Section */}
        {entry.attachment_path && (
          <div className="mt-4 flex items-center justify-between p-3 bg-gray-100 rounded">
            <span className="text-xs font-bold text-gray-700">المرفقات والوثائق المؤيدة:</span>
            <Button size="small" type="link" icon={<PaperClipOutlined />}>
              تحميل المرفق الرسمي
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LedgerTransactionDetailModal;
