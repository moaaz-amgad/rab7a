import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import type { Employee } from '@/types/hr.types';

const { Option } = Select;

export interface EmployeeFormValues {
  name_ar: string;
  phone: string;
  national_id?: string;
  department_name: string;
  job_title_name: string;
  base_salary_egp: number;
  contract_type: string;
  hire_date?: dayjs.Dayjs | string;
  status: 'active' | 'on_leave' | 'archived';
  gender: string;
}

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
  initialValues?: Employee | null;
  mode: 'add' | 'edit';
}

export const DEPARTMENTS_LIST = [
  'المطبخ والتحضير',
  'الكاشير وصالة الطعام',
  'الإدارة والتشغيل',
  'التوصيل والدليفري',
  'النظافة والصيانة',
  'المشتريات والمخزن',
];

export const JOB_TITLES_LIST = [
  'الشيف الرئيسي',
  'شيف شواية',
  'شيف تجهيز ومقبلات',
  'طباخ أول',
  'مساعد مطبخ',
  'كاشير صالة',
  'مدير صالة',
  'ويتر (مقدم طعام)',
  'سائق دليفري',
  'عامل نظافة وتجهيز',
  'محاسب موقع',
  'مدير التشغيل',
];

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  mode,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue({
          name_ar: initialValues.name_ar,
          phone: initialValues.phone,
          national_id: initialValues.national_id || '',
          department_name: initialValues.department?.name_ar || 'المطبخ والتحضير',
          job_title_name: initialValues.job_title?.name_ar || 'عامل مطبخ',
          base_salary_egp: Math.round(initialValues.base_salary / 100),
          contract_type: initialValues.contract_type || 'full_time',
          hire_date: initialValues.hire_date ? dayjs(initialValues.hire_date) : dayjs(),
          status: initialValues.status || 'active',
          gender: initialValues.gender || 'male',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          department_name: 'المطبخ والتحضير',
          job_title_name: 'طباخ أول',
          base_salary_egp: 5000,
          contract_type: 'full_time',
          hire_date: dayjs(),
          status: 'active',
          gender: 'male',
        });
      }
    }
  }, [open, mode, initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit({
      ...values,
      hire_date: values.hire_date ? values.hire_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    });
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <span className="text-lg font-bold text-amber-800 dir-rtl" dir="rtl">
          {mode === 'add' ? '➕ إضافة موظف جديد لبيانات المطعم' : '✏️ تعديل بيانات الموظف'}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={mode === 'add' ? 'إضافة الموظف' : 'حفظ التعديلات'}
      cancelText="إلغاء"
      okButtonProps={{ style: { background: '#d97706', borderColor: '#b45309' } }}
      destroyOnClose
      width={650}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="dir-rtl mt-4"
        dir="rtl"
      >
        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="name_ar"
              label="اسم الموظف بالكامل"
              rules={[{ required: true, message: 'برجاء كتابة اسم الموظف' }]}
            >
              <Input placeholder="مثال: أحمد محمد علي" />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="phone"
              label="رقم الهاتف"
              rules={[{ required: true, message: 'برجاء كتابة رقم الهاتف' }]}
            >
              <Input placeholder="010xxxxxxx" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="department_name"
              label="قسم المطعم"
              rules={[{ required: true, message: 'اختر القسم' }]}
            >
              <Select showSearch placeholder="اختر القسم">
                {DEPARTMENTS_LIST.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="job_title_name"
              label="المسمى الوظيفي"
              rules={[{ required: true, message: 'اختر المسمى الوظيفي' }]}
            >
              <Select showSearch placeholder="اختر المسمى الوظيفي">
                {JOB_TITLES_LIST.map((title) => (
                  <Option key={title} value={title}>
                    {title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="base_salary_egp"
              label="الراتب الأساسي الشهري (بالجنيه)"
              rules={[{ required: true, message: 'يرجى تحديد الراتب الأساسي' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                addonAfter="ج.م"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="national_id" label="الرقم القومي (اختياري)">
              <Input placeholder="14 رقم قومي" maxLength={14} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="contract_type" label="نوع العقد / الدوام">
              <Select>
                <Option value="full_time">دوام كامل (شهري)</Option>
                <Option value="part_time">دوام جزئي</Option>
                <Option value="daily">حساب باليومية</Option>
                <Option value="temporary">مؤقت / موسم</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="حالة التوظيف">
              <Select>
                <Option value="active">نشط بالعمل</Option>
                <Option value="on_leave">في إجازة</Option>
                <Option value="archived">مؤرشف / منتهي خدمة</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="hire_date" label="تاريخ التعيين">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
