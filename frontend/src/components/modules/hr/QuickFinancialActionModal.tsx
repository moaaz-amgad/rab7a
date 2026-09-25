import React, { useState } from 'react';
import { Modal, Form, Select, InputNumber, Input, DatePicker, message } from 'antd';
import { PlusCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { useHr, TransactionTypeKey } from '@/context/HrContext';
import dayjs from 'dayjs';

interface QuickFinancialActionModalProps {
  open: boolean;
  onClose: () => void;
  defaultEmployeeId?: number;
  defaultType?: TransactionTypeKey;
}

export const QuickFinancialActionModal: React.FC<QuickFinancialActionModalProps> = ({
  open,
  onClose,
  defaultEmployeeId,
  defaultType = 'advance',
}) => {
  const [form] = Form.useForm();
  const { employees, addTransaction } = useHr();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionTypeKey>(defaultType);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const customDateStr = values.customDate ? dayjs(values.customDate).format('YYYY-MM-DD HH:mm') : undefined;

      addTransaction({
        employeeId: values.employeeId,
        type: values.type,
        amount: values.amount || 0,
        daysOrHours: values.daysOrHours,
        description: values.description,
        notes: values.notes,
        date: customDateStr,
      });

      const selectedEmp = employees.find((e) => e.id === values.employeeId);
      const actionNames: Record<string, string> = {
        advance: 'صرف السلفة',
        bonus: 'منح المكافأة',
        penalty: 'تطبيق الخصم والجزاء',
        overtime: 'تسجيل الأوفرتايم',
        late: 'تسجيل التأخير',
        absence: 'تسجيل الغياب',
      };

      message.success(`تم تسجيل ${actionNames[values.type]} بنجاح للموظف (${selectedEmp?.name_ar || ''}) وتحديث كشف الحساب والرواتب فورياً.`);
      form.resetFields();
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 dir-rtl" dir="rtl">
          <PlusCircleOutlined className="text-xl text-amber-600" />
          <span className="font-bold text-lg">تسجيل حركة مالية / إدارية موحدة</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="تسجيل وتسميع فورياً"
      cancelText="إلغاء"
      width={580}
    >
      <Form
        form={form}
        layout="vertical"
        className="dir-rtl mt-4"
        dir="rtl"
        initialValues={{
          employeeId: defaultEmployeeId || (employees[0] ? employees[0].id : undefined),
          type: defaultType,
          customDate: dayjs(),
        }}
        onValuesChange={(changed) => {
          if (changed.type) setSelectedType(changed.type);
        }}
      >
        <Form.Item
          name="employeeId"
          label="الموظف المستهدف"
          rules={[{ required: true, message: 'يرجى اختيار الموظف' }]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            placeholder="ابحث باسم الموظف أو الكود"
          >
            {employees.map((emp) => (
              <Select.Option key={emp.id} value={emp.id}>
                {emp.name_ar} ({emp.employee_number}) - {emp.job_title?.name_ar}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="type"
          label="نوع الحركة (إيجابية أو استقطاع)"
          rules={[{ required: true, message: 'يرجى اختيار نوع الحركة' }]}
        >
          <Select>
            <Select.Option value="advance">
              <span className="text-amber-700 font-semibold">💳 صرف سلفة مالية (تُخصم من المرتب)</span>
            </Select.Option>
            <Select.Option value="bonus">
              <span className="text-green-700 font-semibold">🎁 منح مكافأة / حافز (تُضاف للمرتب)</span>
            </Select.Option>
            <Select.Option value="penalty">
              <span className="text-red-700 font-semibold">⚠️ تطبيق خصم / جزاء مالي (تُخصم من المرتب)</span>
            </Select.Option>
            <Select.Option value="overtime">
              <span className="text-blue-700 font-semibold">⏰ ساعات إضافية (أوفرتايم) (تُضاف للمرتب)</span>
            </Select.Option>
            <Select.Option value="late">
              <span className="text-rose-700 font-semibold">⌛ خصم تأخير (تُخصم من المرتب)</span>
            </Select.Option>
            <Select.Option value="absence">
              <span className="text-red-800 font-bold">❌ خصم غياب (يُحسب تلقائياً ويُخصم)</span>
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="customDate"
          label="تاريخ وتوقيت الحركة (افتراضياً: الوقت الحالي — يمكنك تعديله لتسجيل حركات قديمة)"
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder="اختر التاريخ والوقت"
            suffixIcon={<CalendarOutlined />}
          />
        </Form.Item>

        {selectedType === 'absence' ? (
          <Form.Item
            name="daysOrHours"
            label="عدد أيام الغياب"
            rules={[{ required: true, message: 'يرجى تحديد عدد الأيام' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0.5} max={30} step={0.5} placeholder="مثال: 1 (يُحسب الخصم تلقائياً من راتب اليوم)" addonAfter="يوم" />
          </Form.Item>
        ) : selectedType === 'overtime' ? (
          <>
            <Form.Item name="daysOrHours" label="عدد الساعات الإضافية">
              <InputNumber style={{ width: '100%' }} min={1} max={100} placeholder="مثال: 3 ساعات" addonAfter="ساعة" />
            </Form.Item>
            <Form.Item
              name="amount"
              label="المبلغ المستحق (EGP)"
              rules={[{ required: true, message: 'يرجى تحديد المبلغ' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} step={50} placeholder="مثال: 150" addonAfter="ج.م" />
            </Form.Item>
          </>
        ) : (
          <Form.Item
            name="amount"
            label="المبلغ بالجنيه المصري (EGP)"
            rules={[{ required: true, message: 'يرجى إدخال المبلغ' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              step={50}
              placeholder="أدخل المبلغ..."
              addonAfter="ج.م"
            />
          </Form.Item>
        )}

        <Form.Item
          name="description"
          label="البيان / السبب"
          rules={[{ required: true, message: 'يرجى كتابة البيان أو السبب' }]}
        >
          <Input.TextArea rows={2} placeholder="مثال: سلفة منتصف الشهر / مكافأة تميز في العمل / غياب بدون إذن..." />
        </Form.Item>

        <Form.Item name="notes" label="ملاحظات إضافية (اختياري)">
          <Input placeholder="أدخل أي ملاحظات إدارية أو رقم الموافقة..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
