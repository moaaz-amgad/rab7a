import React, { useState } from 'react';
import { Modal, Card, Row, Col, Divider, Table, Tag, Button, Typography, Empty } from 'antd';
import { InfoCircleOutlined, PrinterOutlined } from '@ant-design/icons';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { useHr } from '@/context/HrContext';

const { Text } = Typography;

interface PayrollDetailsModalProps {
  open: boolean;
  payrollDetail: any;
  onClose: () => void;
}

export const PayrollDetailsModal: React.FC<PayrollDetailsModalProps> = ({ open, payrollDetail, onClose }) => {
  const { getEmployeeLedger, getFinancialPosition } = useHr();
  const [drillDownModal, setDrillDownModal] = useState<{
    title: string;
    type: string;
    data: any[];
  } | null>(null);

  const empId = payrollDetail?.employee_id || payrollDetail?.id;
  const detailYear = payrollDetail?.year || 2026;
  const detailMonth = payrollDetail?.month || 7;
  const ledgerEntries = empId ? getEmployeeLedger(empId) : [];
  const pos = empId ? getFinancialPosition(empId, detailYear, detailMonth) : null;

  const handleOpenDrillDown = (title: string, type: string) => {
    const filtered = ledgerEntries.filter((e) => {
      if (type === 'bonuses') return e.transaction_type === 'bonus';
      if (type === 'advances') return e.transaction_type === 'advance';
      if (type === 'penalties') return e.transaction_type === 'penalty' || e.transaction_type === 'late' || e.transaction_type === 'absence';
      if (type === 'overtime') return e.transaction_type === 'overtime';
      return false;
    });

    setDrillDownModal({
      title,
      type,
      data: filtered.map((e) => ({
        date: e.transaction_date,
        reason: e.description,
        amount: e.debit || e.credit,
        created_by: e.created_by_name || 'إدارة المطعم',
      })),
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=750');
    if (!printWindow) return;

    const workedDays = pos?.worked_days || 30;
    const totalDays = pos?.total_days_in_month || 30;
    const baseSalary = ((pos?.prorated_base_salary || payrollDetail?.base_salary || 0) / 100).toLocaleString();
    const bonuses = ((pos?.total_bonuses_ytd || 0) / 100).toLocaleString();
    const overtime = ((pos?.total_overtime_ytd || 0) / 100).toLocaleString();
    const advances = ((pos?.current_advances_balance || 0) / 100).toLocaleString();
    const penalties = ((pos?.total_deductions_ytd || 0) / 100).toLocaleString();
    const netPaid = ((pos?.total_net_salary_ytd || payrollDetail?.net_salary || 0) / 100).toLocaleString();
    const payoutStatus = pos?.is_paid ? `✓ تم الصرف بتاريخ (${pos.payout_record?.payout_date})` : 'قيد الصرف والاستحقاق';

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>مفردات راتب - ${payrollDetail?.employee_name || ''}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Cairo', 'Segoe UI', Arial, sans-serif; direction: rtl; margin: 0; padding: 24px; color: #0f172a; background: #fff; }
          .header { text-align: center; border-bottom: 3px solid #d97706; padding-bottom: 14px; margin-bottom: 24px; }
          .header h1 { font-size: 24px; margin: 0; color: #0f172a; font-weight: 800; }
          .header p { font-size: 13px; color: #475569; margin: 4px 0 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 12px; }
          .info-table td { padding: 9px 14px; }
          .info-label { font-weight: bold; background: #f8fafc; color: #334155; }
          .financial-table th { background: #0f172a; color: #ffffff; text-align: right; font-size: 13px; }
          .positive { color: #059669; font-weight: bold; }
          .negative { color: #dc2626; font-weight: bold; }
          .net-box { background: #0f172a; color: #ffffff; padding: 16px 24px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin: 30px 0 40px; }
          .net-title { font-size: 17px; font-weight: bold; }
          .net-amount { font-size: 26px; color: #4ade80; font-weight: bold; }
          .signatures { width: 100%; margin-top: 50px; text-align: center; font-size: 13px; border: none; }
          .signatures td { border: none; vertical-align: top; padding: 0 10px; }
          .sig-title { font-weight: bold; margin-bottom: 50px; font-size: 14px; color: #1e293b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>مطعم رابحة — طعم البيوت</h1>
          <p>مسير وإيصال استلام مفردات مرتب موظف رسمية معتمدة</p>
        </div>

        <table class="info-table">
          <tbody>
            <tr>
              <td class="info-label" style="width:18%;">اسم الموظف:</td>
              <td style="width:32%; font-weight:bold;">${payrollDetail?.employee_name || ''} (${payrollDetail?.employee_number || ''})</td>
              <td class="info-label" style="width:18%;">فترة الاستحقاق:</td>
              <td style="width:32%;">شهر ${detailMonth} / ${detailYear}</td>
            </tr>
            <tr>
              <td class="info-label">الوظيفة والقسم:</td>
              <td>${payrollDetail?.job_title || ''} - ${payrollDetail?.department || ''}</td>
              <td class="info-label">أيام العمل الفعلية:</td>
              <td><strong>${workedDays} يوم</strong> (من ${totalDays} يوم)</td>
            </tr>
            <tr>
              <td class="info-label">حالة الصرف:</td>
              <td colspan="3" style="font-weight:bold; color: ${pos?.is_paid ? '#059669' : '#d97706'};">
                ${payoutStatus}
              </td>
            </tr>
          </tbody>
        </table>

        <h3 style="font-size:15px; margin:22px 0 10px; color:#1e3a8a; font-weight:bold;">تفاصيل المستحقات والاستقطاعات المالية:</h3>
        <table class="financial-table">
          <thead>
            <tr>
              <th>بيان المستحقات / الإضافات (+)</th>
              <th style="width:22%; text-align:left;">المبلغ</th>
              <th>بيان الاستقطاعات / الخصومات (-)</th>
              <th style="width:22%; text-align:left;">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>الراتب الأساسي عن أيام العمل (${workedDays} يوم)</td>
              <td style="text-align:left; font-weight:bold;">${baseSalary} ج.م</td>
              <td>السلف المسحوبة الحالية</td>
              <td style="text-align:left;" class="negative">${advances} ج.م</td>
            </tr>
            <tr>
              <td>المكافآت والحوافز المسجلة</td>
              <td style="text-align:left;" class="positive">${bonuses} ج.م</td>
              <td>الجزاءات والخصومات الإدارية</td>
              <td style="text-align:left;" class="negative">${penalties} ج.م</td>
            </tr>
            <tr>
              <td>إجمالي الإضافي والأوفرتايم</td>
              <td style="text-align:left;" class="positive">${overtime} ج.م</td>
              <td>-</td>
              <td style="text-align:left;">-</td>
            </tr>
          </tbody>
        </table>

        <div class="net-box">
          <span class="net-title">صافي المرتب المستحق النهائي للصرف:</span>
          <span class="net-amount">${netPaid} ج.م</span>
        </div>

        <table class="signatures">
          <tbody>
            <tr>
              <td style="width:33%;">
                <div class="sig-title">المحاسب المسئول</div>
                <div>التوقيع: ...........................................</div>
              </td>
              <td style="width:33%;">
                <div class="sig-title">اعتماد مدير الفرع</div>
                <div>التوقيع: ...........................................</div>
              </td>
              <td style="width:33%;">
                <div class="sig-title">توقيع الموظف بالاستلام</div>
                <div>التوقيع: ...........................................</div>
              </td>
            </tr>
          </tbody>
        </table>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const netSalaryVal = pos?.total_net_salary_ytd || payrollDetail?.net_salary || 0;
  const baseSalaryVal = pos?.prorated_base_salary || payrollDetail?.base_salary || 0;
  const overtimeVal = pos?.total_overtime_ytd || 0;
  const bonusesVal = pos?.total_bonuses_ytd || 0;
  const advancesVal = pos?.current_advances_balance || 0;
  const penaltiesVal = pos?.total_deductions_ytd || 0;
  const workedDaysVal = pos?.worked_days || 30;
  const totalDaysVal = pos?.total_days_in_month || 30;

  return (
    <>
      <Modal
        title={`تفاصيل وبيانات مفصل كشف راتب: ${payrollDetail?.employee_name}`}
        open={open}
        onCancel={onClose}
        width={900}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            طباعة كشف مفصل
          </Button>,
          <Button key="close" onClick={onClose}>
            إغلاق
          </Button>,
        ]}
      >
        <div className="dir-rtl" dir="rtl">
          {/* Top Info Banner */}
          <Card size="small" className="bg-slate-50 mb-4 border-slate-200">
            <Row justify="space-between" align="middle">
              <Col>
                <div className="text-lg font-bold text-slate-800">مطعم رابحة الرئيسي — مفردات راتب</div>
                <div><strong>الموظف:</strong> {payrollDetail?.employee_name} ({payrollDetail?.employee_number})</div>
                <div><strong>الوظيفة والقسم:</strong> {payrollDetail?.job_title} ({payrollDetail?.department})</div>
              </Col>
              <Col className="text-left">
                <div><strong>فترة الاستحقاق:</strong> شهر {detailMonth} / {detailYear}</div>
                <div><strong>أيام العمل الفعلية:</strong> <span className="font-bold text-amber-800">{workedDaysVal} يوم</span> (من {totalDaysVal} يوم)</div>
                <div className="mt-1">
                  <strong>حالة الصرف:</strong>{' '}
                  {pos?.is_paid ? (
                    <Tag color="green" className="font-bold text-xs px-2 py-0.5">
                      ✓ تم الصرف بتاريخ ({pos.payout_record?.payout_date})
                    </Tag>
                  ) : (
                    <Tag color="orange" className="font-bold text-xs px-2 py-0.5">
                      قيد الصرف والاستحقاق
                    </Tag>
                  )}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Section 1: Base Salary & Attendance */}
          <h3 className="font-bold text-base mb-2 text-blue-900">1. الراتب المستحق عن أيام العمل الفعلية</h3>
          <Row gutter={16} className="mb-4">
            <Col span={12}>
              <Card size="small" className="text-center">
                <Text type="secondary">الراتب المستحق عن {workedDaysVal} يوم عمل</Text>
                <div>
                  <MoneyDisplay amount={baseSalaryVal} />
                </div>
                {pos?.is_prorated && (
                  <div className="text-xs text-amber-700 font-bold mt-1">
                    محسوب مجزأ لـ {pos.worked_days} يوم من إجمالي {pos.total_days_in_month} يوم
                  </div>
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" className="text-center cursor-pointer hover:bg-gray-100" onClick={() => handleOpenDrillDown('تفاصيل ساعات الإضافي', 'overtime')}>
                <Text type="secondary">إجمالي الإضافي والأوفرتايم <InfoCircleOutlined /></Text>
                <div>
                  <MoneyDisplay amount={overtimeVal} type="positive" />
                </div>
              </Card>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }} />

          {/* Section 2: Additions & Earnings */}
          <h3 className="font-bold text-base mb-2 text-green-800">2. الإضافات والمستحقات (+)</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between p-2.5 bg-green-50 rounded cursor-pointer hover:bg-green-100 border border-green-200" onClick={() => handleOpenDrillDown('تفاصيل المكافآت والحوافز', 'bonuses')}>
              <span className="font-semibold text-green-900">المكافآت والحوافز المسجلة <InfoCircleOutlined /></span>
              <MoneyDisplay amount={bonusesVal} type="positive" />
            </div>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* Section 3: Deductions */}
          <h3 className="font-bold text-base mb-2 text-red-800">3. الاستقطاعات والخصومات المسواة (-)</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between p-2.5 bg-red-50 rounded cursor-pointer hover:bg-red-100 border border-red-200" onClick={() => handleOpenDrillDown('تفاصيل السلف المسحوبة', 'advances')}>
              <span className="font-semibold text-red-900">السلف المسحوبة الحالية <InfoCircleOutlined /></span>
              <MoneyDisplay amount={advancesVal} type="negative" />
            </div>
            <div className="flex justify-between p-2.5 bg-red-50 rounded cursor-pointer hover:bg-red-100 border border-red-200" onClick={() => handleOpenDrillDown('تفاصيل الجزاءات والخصومات', 'penalties')}>
              <span className="font-semibold text-red-900">الجزاءات والخصومات الإدارية <InfoCircleOutlined /></span>
              <MoneyDisplay amount={penaltiesVal} type="negative" />
            </div>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* Final Summary Card */}
          <Card className="bg-slate-900 text-white text-center mb-6">
            <Row justify="space-between" align="middle">
              <Col><span className="text-lg font-bold">صافي المرتب المستحق النهائي للصرف:</span></Col>
              <Col><MoneyDisplay amount={netSalaryVal} style={{ color: '#4ade80', fontSize: '24px', fontWeight: 'bold' }} /></Col>
            </Row>
          </Card>

          {/* Official Signatures Section */}
          <Row justify="space-between" className="mt-8 pt-6 border-t border-gray-300 text-center text-xs text-gray-700">
            <Col span={7}>
              <div className="font-bold mb-10 text-sm">المحاسب المسئول</div>
              <div>التوقيع: ...................................</div>
            </Col>
            <Col span={7}>
              <div className="font-bold mb-10 text-sm">اعتماد مدير الفرع</div>
              <div>التوقيع: ...................................</div>
            </Col>
            <Col span={7}>
              <div className="font-bold mb-10 text-sm">توقيع الموظف بالإستلام</div>
              <div>التوقيع: ...................................</div>
            </Col>
          </Row>
        </div>
      </Modal>

      {/* Inner Drill-Down Breakdown Modal */}
      {drillDownModal && (
        <Modal
          title={drillDownModal.title}
          open={!!drillDownModal}
          onCancel={() => setDrillDownModal(null)}
          footer={[<Button key="ok" type="primary" onClick={() => setDrillDownModal(null)}>تم</Button>]}
          width={600}
        >
          {drillDownModal.data.length === 0 ? (
            <Empty description="لا توجد حركات مسجلة من هذا النوع لهذا الموظف" />
          ) : (
            <Table
              dataSource={drillDownModal.data}
              rowKey={(r, i) => i?.toString() || '0'}
              pagination={false}
              columns={[
                { title: 'التاريخ والوقت', dataIndex: 'date', key: 'date' },
                { title: 'السبب / البيان', dataIndex: 'reason', key: 'reason' },
                {
                  title: 'المبلغ',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (val: number) => (val ? <MoneyDisplay amount={val} /> : '-'),
                },
                { title: 'بواسطة', dataIndex: 'created_by', key: 'created_by' },
              ]}
            />
          )}
        </Modal>
      )}
    </>
  );
};

export default PayrollDetailsModal;
