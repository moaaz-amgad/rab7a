import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Button } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { QuickFinancialActionModal } from '@/components/modules/hr/QuickFinancialActionModal';
import { useHr } from '@/context/HrContext';

export const PayrollDashboardWidget: React.FC = () => {
  const { employees, getFinancialPosition } = useHr();
  const [actionModalOpen, setActionModalOpen] = useState(false);

  // Compute live metrics across all real employees
  let totalContractBaseSalaries = 0;
  let totalProratedBaseSalaries = 0;
  let totalAdvances = 0;
  let totalBonuses = 0;
  let totalDeductions = 0;
  let totalOvertime = 0;
  let highestEmp = employees[0] || null;

  employees.forEach((emp) => {
    totalContractBaseSalaries += emp.base_salary;
    const pos = getFinancialPosition(emp.id);
    totalProratedBaseSalaries += pos.prorated_base_salary;
    totalAdvances += pos.current_advances_balance;
    totalBonuses += pos.total_bonuses_ytd;
    totalDeductions += pos.total_deductions_ytd;
    totalOvertime += pos.total_overtime_ytd;

    if (!highestEmp || emp.base_salary > highestEmp.base_salary) {
      highestEmp = emp;
    }
  });

  const averageContractSalary = employees.length > 0 ? Math.round(totalContractBaseSalaries / employees.length) : 0;
  const netPayrollRequired = totalProratedBaseSalaries + totalBonuses + totalOvertime - (totalAdvances + totalDeductions);

  // Department distribution calculations - strict matching by department_id
  const kitchenEmps = employees.filter((e) => e.department_id === 1);
  const cashierEmps = employees.filter((e) => e.department_id === 2);
  const adminEmps = employees.filter((e) => e.department_id === 3);
  const otherEmps = employees.filter((e) => e.department_id > 3);

  const getDeptTotal = (emps: typeof employees) =>
    emps.reduce((s, e) => s + getFinancialPosition(e.id).prorated_base_salary, 0);

  const kitchenTotal = getDeptTotal(kitchenEmps);
  const cashierTotal = getDeptTotal(cashierEmps);
  const adminTotal = getDeptTotal(adminEmps);
  const otherTotal = getDeptTotal(otherEmps);

  const kitchenPct = totalProratedBaseSalaries > 0 ? Math.round((kitchenTotal / totalProratedBaseSalaries) * 100) : 0;
  const cashierPct = totalProratedBaseSalaries > 0 ? Math.round((cashierTotal / totalProratedBaseSalaries) * 100) : 0;
  const adminPct = totalProratedBaseSalaries > 0 ? Math.round((adminTotal / totalProratedBaseSalaries) * 100) : 0;
  const otherPct = totalProratedBaseSalaries > 0 ? Math.round((otherTotal / totalProratedBaseSalaries) * 100) : 0;

  return (
    <div className="dir-rtl p-6 bg-slate-50 min-h-screen" dir="rtl">
      {/* Header Banner */}
      <Card className="mb-6 shadow-sm border-amber-200" style={{ borderRadius: '12px' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <h1 className="text-2xl font-bold text-gray-800 m-0">ملخص الرواتب والعمليات المالية — مطعم رابحة</h1>
            <p className="text-gray-500 text-sm m-0 mt-1">
              متابعة كتلة الأجور الحقيقية لـ {employees.length} موظفاً بالمطعم، مع السلف والمكافآت والخصومات
            </p>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', borderColor: '#b45309', fontWeight: 700 }}
              icon={<PlusCircleOutlined />}
              onClick={() => setActionModalOpen(true)}
            >
              + تسجيل حركة مالية / إدارية
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Primary KPI Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="bg-blue-50 border-blue-200 text-center shadow-sm" style={{ borderRadius: '12px' }}>
            <Statistic
              title={<span className="font-bold text-gray-700">إجمالي كتلة المرتبات الشهري (العقود)</span>}
              valueRender={() => <MoneyDisplay amount={totalContractBaseSalaries} style={{ fontSize: '22px' }} />}
            />
            <div className="text-xs text-blue-700 mt-1 font-semibold">لجميع الـ {employees.length} موظفاً بالمطعم (عقود أساسية)</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="bg-emerald-50 border-emerald-200 text-center shadow-sm" style={{ borderRadius: '12px' }}>
            <Statistic
              title={<span className="font-bold text-gray-700">صافي الرواتب المستحقة للصرف</span>}
              valueRender={() => <MoneyDisplay amount={netPayrollRequired} type="positive" style={{ fontSize: '22px' }} />}
            />
            <div className="text-xs text-emerald-700 mt-1 font-semibold">عن أيام العمل الفعلية بعد التسويات</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="bg-amber-50 border-amber-200 text-center shadow-sm" style={{ borderRadius: '12px' }}>
            <Statistic
              title={<span className="font-bold text-gray-700">إجمالي السلف الصادرة</span>}
              valueRender={() => <MoneyDisplay amount={totalAdvances} type="negative" style={{ fontSize: '22px' }} />}
            />
            <div className="text-xs text-amber-800 mt-1 font-semibold">تُخصم من صافي راتب الشهر</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="bg-purple-50 border-purple-200 text-center shadow-sm" style={{ borderRadius: '12px' }}>
            <Statistic
              title={<span className="font-bold text-gray-700">إجمالي المكافآت والحوافز</span>}
              valueRender={() => <MoneyDisplay amount={totalBonuses} type="positive" style={{ fontSize: '22px' }} />}
            />
            <div className="text-xs text-purple-700 mt-1 font-semibold">مكافآت وحوافز التميز</div>
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8} md={6}>
          <Card size="small" className="bg-rose-50 border-rose-200 text-center" style={{ borderRadius: '12px' }}>
            <Statistic
              title={<span className="font-bold text-gray-700">إجمالي الخصومات والجزاءات</span>}
              valueRender={() => <MoneyDisplay amount={totalDeductions} type="negative" />}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card size="small" className="bg-teal-50 border-teal-200 text-center" style={{ borderRadius: '12px' }}>
            <Statistic
              title={<span className="font-bold text-gray-700">متوسط الراتب الأساسي بالمطعم</span>}
              valueRender={() => <MoneyDisplay amount={averageContractSalary} />}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card size="small" className="bg-indigo-50 border-indigo-200 text-center" style={{ borderRadius: '12px' }}>
            <Statistic
              title={<span className="font-bold text-gray-700">أعلى راتب موظف بالمطعم</span>}
              valueRender={() => <MoneyDisplay amount={highestEmp ? highestEmp.base_salary : 0} type="positive" />}
            />
            <div className="text-xs text-gray-600 mt-1 font-bold">
              {highestEmp ? `${highestEmp.name_ar} (${highestEmp.job_title?.name_ar})` : '-'}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card size="small" className="bg-emerald-100 border-emerald-300 text-center" style={{ borderRadius: '12px' }}>
            <Statistic
              title={<span className="font-bold text-gray-700">حالة اعتماد وسداد الرواتب</span>}
              valueRender={() => <span className="text-emerald-800 font-bold text-lg">جاهز لاحتساب الشهر</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Distribution Chart / Summary Card */}
      <Card className="shadow-sm" style={{ borderRadius: '12px' }}>
        <h3 className="font-bold text-gray-800 mb-4">توزيع كتلة الأجور حسب أقسام مطعم رابحة:</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-semibold mb-1">
              <span>قسم المطبخ والتحضير ({kitchenEmps.length} موظفين)</span>
              <span>{(kitchenTotal / 100).toLocaleString('ar-EG')} ج.م ({kitchenPct}%)</span>
            </div>
            <Progress percent={kitchenPct} strokeColor="#d97706" status="active" />
          </div>

          <div>
            <div className="flex justify-between text-sm font-semibold mb-1">
              <span>قسم الكاشير وصالة الطعام ({cashierEmps.length} موظفين)</span>
              <span>{(cashierTotal / 100).toLocaleString('ar-EG')} ج.م ({cashierPct}%)</span>
            </div>
            <Progress percent={cashierPct} strokeColor="#059669" status="active" />
          </div>

          <div>
            <div className="flex justify-between text-sm font-semibold mb-1">
              <span>الإدارة العامة والتشغيل ({adminEmps.length} موظفين)</span>
              <span>{(adminTotal / 100).toLocaleString('ar-EG')} ج.م ({adminPct}%)</span>
            </div>
            <Progress percent={adminPct} strokeColor="#2563eb" status="active" />
          </div>

          {otherEmps.length > 0 && (
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>أقسام أخرى ({otherEmps.length} موظفين)</span>
                <span>{(otherTotal / 100).toLocaleString('ar-EG')} ج.م ({otherPct}%)</span>
              </div>
              <Progress percent={otherPct} strokeColor="#8b5cf6" status="active" />
            </div>
          )}
        </div>
      </Card>

      <QuickFinancialActionModal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
      />
    </div>
  );
};

export default PayrollDashboardWidget;
