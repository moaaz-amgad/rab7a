import React, { useState } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Avatar } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  DashboardOutlined,
  ShopOutlined,
  SettingOutlined,
  UserOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  BankOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { HrProvider, useHr } from '../../context/HrContext';
import { EmployeeListPage } from '../../pages/hr/EmployeeListPage';
import { EmployeeProfilePage } from '../../pages/hr/EmployeeProfilePage';
import { EmployeeStatementPage } from '../../pages/hr/EmployeeStatementPage';
import { PayrollListPage } from '../../pages/payroll/PayrollListPage';
import { PayrollDashboardWidget } from '../../pages/payroll/PayrollDashboardWidget';

const { Header, Sider, Content } = Layout;

/* ─────────── Home Dashboard Page ─────────── */
const HomePage: React.FC = () => {
  const { employees } = useHr();
  const totalSalaries = employees.reduce((s, e) => s + e.base_salary, 0);

  return (
    <div className="p-6 dir-rtl" dir="rtl">
      {/* Welcome Banner */}
      <Card
        className="mb-6 shadow-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #d97706 100%)',
          border: 'none',
          borderRadius: '16px',
        }}
      >
        <div className="flex items-center gap-5">
          <img
            src="/logo.png"
            alt="مطعم رابحة"
            style={{
              height: '80px',
              objectFit: 'contain',
              background: '#fff',
              padding: '6px 12px',
              borderRadius: '12px',
              border: '2px solid #fbbf24',
              boxShadow: '0 4px 16px rgba(217,119,6,0.3)',
            }}
          />
          <div>
            <h1 style={{ color: '#fbbf24', fontSize: '28px', fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
              مطعم رابحة — طعم البيوت
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '15px', margin: '4px 0 0' }}>
              نظام الإدارة الشامل — الموارد البشرية والرواتب وحسابات العاملين
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md" style={{ borderRadius: '14px', borderTop: '4px solid #d97706' }}>
            <Statistic
              title={<span className="font-bold text-gray-600">عدد الموظفين بالمطعم</span>}
              value={employees.length}
              prefix={<TeamOutlined className="text-amber-600" />}
              valueStyle={{ color: '#d97706', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md" style={{ borderRadius: '14px', borderTop: '4px solid #059669' }}>
            <Statistic
              title={<span className="font-bold text-gray-600">كتلة المرتبات الشهرية</span>}
              value={(totalSalaries / 100).toLocaleString('ar-EG')}
              suffix="ج.م"
              valueStyle={{ color: '#059669', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md" style={{ borderRadius: '14px', borderTop: '4px solid #2563eb' }}>
            <Statistic
              title={<span className="font-bold text-gray-600">أقسام المطعم</span>}
              value={3}
              prefix={<AppstoreOutlined className="text-blue-600" />}
              valueStyle={{ color: '#2563eb', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md" style={{ borderRadius: '14px', borderTop: '4px solid #7c3aed' }}>
            <Statistic
              title={<span className="font-bold text-gray-600">الوحدات النشطة</span>}
              value={2}
              suffix="/ 6"
              prefix={<BarChartOutlined className="text-purple-600" />}
              valueStyle={{ color: '#7c3aed', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Modules Overview */}
      <h2 className="text-lg font-bold text-gray-700 mt-6 mb-3">أقسام ووحدات النظام:</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable className="shadow-md text-center" style={{ borderRadius: '14px' }}>
            <TeamOutlined style={{ fontSize: '32px', color: '#d97706' }} />
            <h3 className="font-bold text-base mt-2 mb-1">شؤون الموظفين</h3>
            <p className="text-gray-500 text-xs">بيانات وسجلات كل العاملين بالمطعم</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable className="shadow-md text-center" style={{ borderRadius: '14px' }}>
            <DollarOutlined style={{ fontSize: '32px', color: '#059669' }} />
            <h3 className="font-bold text-base mt-2 mb-1">الرواتب والحسابات</h3>
            <p className="text-gray-500 text-xs">مسيرات الرواتب وكشوف الحسابات المالية</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="shadow-md text-center" style={{ borderRadius: '14px', opacity: 0.5 }}>
            <ShoppingCartOutlined style={{ fontSize: '32px', color: '#94a3b8' }} />
            <h3 className="font-bold text-base mt-2 mb-1 text-gray-400">المشتريات والمخزن</h3>
            <p className="text-gray-400 text-xs">قريباً...</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="shadow-md text-center" style={{ borderRadius: '14px', opacity: 0.5 }}>
            <BankOutlined style={{ fontSize: '32px', color: '#94a3b8' }} />
            <h3 className="font-bold text-base mt-2 mb-1 text-gray-400">الحسابات والقيود المالية</h3>
            <p className="text-gray-400 text-xs">قريباً...</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="shadow-md text-center" style={{ borderRadius: '14px', opacity: 0.5 }}>
            <ShopOutlined style={{ fontSize: '32px', color: '#94a3b8' }} />
            <h3 className="font-bold text-base mt-2 mb-1 text-gray-400">المبيعات ونقاط البيع</h3>
            <p className="text-gray-400 text-xs">قريباً...</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="shadow-md text-center" style={{ borderRadius: '14px', opacity: 0.5 }}>
            <SettingOutlined style={{ fontSize: '32px', color: '#94a3b8' }} />
            <h3 className="font-bold text-base mt-2 mb-1 text-gray-400">الإعدادات العامة</h3>
            <p className="text-gray-400 text-xs">قريباً...</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

/* ─────────── Main App Shell ─────────── */
type PageKey =
  | 'home'
  | 'emp-list'
  | 'emp-profile'
  | 'payroll-dashboard'
  | 'payroll-list'
  | 'payroll-statement';

const AppShell: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSelectEmployee = (id: number) => {
    setSelectedEmployeeId(id);
    setCurrentPage('emp-profile');
  };

  const navigate = (page: PageKey) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'emp-list':
        return <EmployeeListPage onSelectEmployee={handleSelectEmployee} />;
      case 'emp-profile':
        return (
          <EmployeeProfilePage
            employeeId={selectedEmployeeId || 1}
            onBack={() => navigate('emp-list')}
          />
        );
      case 'payroll-dashboard':
        return <PayrollDashboardWidget />;
      case 'payroll-list':
        return <PayrollListPage />;
      case 'payroll-statement':
        return <EmployeeStatementPage employeeId={selectedEmployeeId || 1} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }} className="dir-rtl" dir="rtl">
      {/* Top Header */}
      <Header
        style={{
          background: '#0f172a',
          height: '72px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #d97706',
          boxSizing: 'border-box',
          flexShrink: 0,
          zIndex: 1000,
          direction: 'rtl',
          lineHeight: 'normal',
        }}
      >
        <div
          onClick={() => navigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <img
            src="/logo.png"
            alt="مطعم رابحة"
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              background: '#ffffff',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1.5px solid #fbbf24',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#fbbf24', fontSize: '20px', fontWeight: 800, lineHeight: '1.2', whiteSpace: 'nowrap' }}>
              مطعم رابحة
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', marginTop: '2px' }}>
              نظام الإدارة الشامل
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#d97706' }} size="default" />
          <span style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>مدير النظام</span>
        </div>
      </Header>

      {/* Main Body */}
      <Layout style={{ flex: 1, height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
        {/* Professional Sidebar */}
        <Sider
          width={260}
          collapsedWidth={80}
          collapsible
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          theme="light"
          style={{
            boxShadow: '2px 0 12px rgba(0,0,0,0.06)',
            overflowY: 'auto',
            height: '100%',
            flexShrink: 0,
          }}
        >
          <Menu
            mode="inline"
            inlineIndent={16}
            selectedKeys={[currentPage]}
            defaultOpenKeys={['employees-section', 'payroll-section']}
            style={{ borderRight: 0, paddingTop: '8px', fontSize: '14px' }}
            onClick={({ key }) => navigate(key as PageKey)}
            items={[
              {
                key: 'home',
                icon: <HomeOutlined style={{ fontSize: '18px' }} />,
                label: <span className="font-bold">الصفحة الرئيسية</span>,
              },
              { type: 'divider' },
              {
                key: 'employees-section',
                icon: <TeamOutlined style={{ fontSize: '17px', color: '#d97706' }} />,
                label: <span className="font-bold text-amber-800">شؤون الموظفين</span>,
                children: [
                  {
                    key: 'emp-list',
                    icon: <UserOutlined />,
                    label: 'قائمة الموظفين',
                  },
                ],
              },
              {
                key: 'payroll-section',
                icon: <DollarOutlined style={{ fontSize: '17px', color: '#059669' }} />,
                label: <span className="font-bold text-emerald-800">الرواتب والحسابات</span>,
                children: [
                  {
                    key: 'payroll-dashboard',
                    icon: <DashboardOutlined />,
                    label: 'لوحة معلومات الرواتب',
                  },
                  {
                    key: 'payroll-list',
                    icon: <FileTextOutlined />,
                    label: 'مسيرات الرواتب الشهري',
                  },
                  {
                    key: 'payroll-statement',
                    icon: <FileTextOutlined />,
                    label: 'كشف حساب موظف',
                  },
                ],
              },
              { type: 'divider' },
              {
                key: 'coming-soon',
                icon: <AppstoreOutlined style={{ fontSize: '16px', color: '#94a3b8' }} />,
                label: <span className="text-gray-400">أقسام قادمة قريباً</span>,
                disabled: true,
                children: [
                  { key: 'inv', label: 'المشتريات والمخزن', disabled: true },
                  { key: 'fin', label: 'الحسابات والقيود', disabled: true },
                  { key: 'pos', label: 'المبيعات ونقاط البيع', disabled: true },
                ],
              },
            ]}
          />
        </Sider>

        {/* Main Content Area */}
        <Content style={{ background: '#f1f5f9', height: '100%', overflowY: 'auto' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

/* ─────────── Root Export ─────────── */
export const EmployeePayrollModuleContainer: React.FC = () => (
  <HrProvider>
    <AppShell />
  </HrProvider>
);

export default EmployeePayrollModuleContainer;
