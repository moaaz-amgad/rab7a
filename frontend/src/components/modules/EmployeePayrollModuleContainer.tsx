import React, { useState } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Avatar } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  InboxOutlined,
  HistoryOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { HrProvider, useHr } from '../../context/HrContext';
import { EmployeeListPage } from '../../pages/hr/EmployeeListPage';
import { EmployeeProfilePage } from '../../pages/hr/EmployeeProfilePage';
import { EmployeeStatementPage } from '../../pages/hr/EmployeeStatementPage';
import { PayrollListPage } from '../../pages/payroll/PayrollListPage';
import { PayrollDashboardWidget } from '../../pages/payroll/PayrollDashboardWidget';
import { InventoryListPage } from '../../pages/inventory/InventoryListPage';
import { StockMovementsPage } from '../../pages/inventory/StockMovementsPage';
import { PurchaseOrderListPage } from '../../pages/purchases/PurchaseOrderListPage';
import { SupplierListPage } from '../../pages/suppliers/SupplierListPage';
import { SupplierStatementPage } from '../../pages/suppliers/SupplierStatementPage';

const { Header, Sider, Content } = Layout;

export type PageKey =
  | 'home'
  | 'emp-list'
  | 'emp-profile'
  | 'payroll-dashboard'
  | 'payroll-list'
  | 'payroll-statement'
  | 'inventory-list'
  | 'stock-movements'
  | 'purchases-list'
  | 'supplier-list'
  | 'supplier-statement';

interface HomePageProps {
  onNavigate: (page: PageKey) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { employees } = useHr();
  const totalSalaries = employees.reduce((sum, emp) => sum + emp.base_salary, 0);

  return (
    <div className="p-6 dir-rtl" dir="rtl">
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
              نظام الإدارة الشامل — الموارد البشرية، الرواتب، وسلاسل الإمداد والمخزون
            </p>
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md cursor-pointer hover:shadow-lg transition-shadow" style={{ borderRadius: '14px', borderTop: '4px solid #d97706' }} onClick={() => onNavigate('emp-list')}>
            <Statistic
              title={<span className="font-bold text-gray-600">عدد الموظفين</span>}
              value={employees.length}
              prefix={<TeamOutlined className="text-amber-600" />}
              valueStyle={{ color: '#d97706', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md cursor-pointer hover:shadow-lg transition-shadow" style={{ borderRadius: '14px', borderTop: '4px solid #059669' }} onClick={() => onNavigate('payroll-dashboard')}>
            <Statistic
              title={<span className="font-bold text-gray-600">كتلة المرتبات الشهرية</span>}
              value={(totalSalaries / 100).toLocaleString('ar-EG')}
              suffix="ج.م"
              valueStyle={{ color: '#059669', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md cursor-pointer hover:shadow-lg transition-shadow" style={{ borderRadius: '14px', borderTop: '4px solid #2563eb' }} onClick={() => onNavigate('inventory-list')}>
            <Statistic
              title={<span className="font-bold text-gray-600">المخزون والمشتريات</span>}
              value="سلاسل الإمداد"
              prefix={<InboxOutlined className="text-blue-600" />}
              valueStyle={{ color: '#2563eb', fontWeight: 700, fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md cursor-pointer hover:shadow-lg transition-shadow" style={{ borderRadius: '14px', borderTop: '4px solid #7c3aed' }} onClick={() => onNavigate('supplier-list')}>
            <Statistic
              title={<span className="font-bold text-gray-600">الموردين والحسابات</span>}
              value="حسابات الموردين"
              prefix={<ShopOutlined className="text-purple-600" />}
              valueStyle={{ color: '#7c3aed', fontWeight: 700, fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      <h2 className="text-lg font-bold text-gray-700 mt-6 mb-3">أقسام ووحدات النظام:</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable className="shadow-md text-center cursor-pointer" style={{ borderRadius: '14px' }} onClick={() => onNavigate('emp-list')}>
            <TeamOutlined style={{ fontSize: '32px', color: '#d97706' }} />
            <h3 className="font-bold text-base mt-2 mb-1">شؤون الموظفين</h3>
            <p className="text-gray-500 text-xs">سجلات وبيانات الموظفين والعمليات المالية</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable className="shadow-md text-center cursor-pointer" style={{ borderRadius: '14px' }} onClick={() => onNavigate('payroll-dashboard')}>
            <DollarOutlined style={{ fontSize: '32px', color: '#059669' }} />
            <h3 className="font-bold text-base mt-2 mb-1">الرواتب ومسيرات الصرف</h3>
            <p className="text-gray-500 text-xs">احتساب مسيرات الرواتب الشهرية والتدقيق</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable className="shadow-md text-center cursor-pointer" style={{ borderRadius: '14px' }} onClick={() => onNavigate('inventory-list')}>
            <InboxOutlined style={{ fontSize: '32px', color: '#2563eb' }} />
            <h3 className="font-bold text-base mt-2 mb-1">المخزون وخامات التشغيل</h3>
            <p className="text-gray-500 text-xs">حصر الأصناف، متوسط التكلفة، وتسوية الهالك</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable className="shadow-md text-center cursor-pointer" style={{ borderRadius: '14px' }} onClick={() => onNavigate('purchases-list')}>
            <ShoppingCartOutlined style={{ fontSize: '32px', color: '#0284c7' }} />
            <h3 className="font-bold text-base mt-2 mb-1">أوامر الشراء والاستلام (GRN)</h3>
            <p className="text-gray-500 text-xs">دورة الشراء وتأكيد الاستلام الفعلي بالمخزن</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable className="shadow-md text-center cursor-pointer" style={{ borderRadius: '14px' }} onClick={() => onNavigate('supplier-list')}>
            <ShopOutlined style={{ fontSize: '32px', color: '#7c3aed' }} />
            <h3 className="font-bold text-base mt-2 mb-1">إدارة الموردين وكشوف الحساب</h3>
            <p className="text-gray-500 text-xs">سجل الموردين والأرصدة المستحقة وحركات السداد</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable className="shadow-md text-center cursor-pointer" style={{ borderRadius: '14px' }} onClick={() => onNavigate('stock-movements')}>
            <HistoryOutlined style={{ fontSize: '32px', color: '#ea580c' }} />
            <h3 className="font-bold text-base mt-2 mb-1">سجل الحركات المخزنية</h3>
            <p className="text-gray-500 text-xs">تتبع التوريد والصرف والهالك في الوقت الفعلي</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const AppShell: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSelectEmployee = (id: number) => {
    setSelectedEmployeeId(id);
    setCurrentPage('emp-profile');
  };

  const handleSelectSupplierStatement = (id: number) => {
    setSelectedSupplierId(id);
    setCurrentPage('supplier-statement');
  };

  const navigate = (page: PageKey) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
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
      case 'inventory-list':
        return <InventoryListPage />;
      case 'stock-movements':
        return <StockMovementsPage />;
      case 'purchases-list':
        return <PurchaseOrderListPage />;
      case 'supplier-list':
        return <SupplierListPage onSelectSupplierStatement={handleSelectSupplierStatement} />;
      case 'supplier-statement':
        return (
          <SupplierStatementPage
            supplierId={selectedSupplierId || 1}
            onBack={() => navigate('supplier-list')}
          />
        );
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }} className="dir-rtl" dir="rtl">
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
              نظام الإدارة الشامل — ERP
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#d97706' }} size="default" />
          <span style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>مدير النظام</span>
        </div>
      </Header>

      <Layout style={{ flex: 1, height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
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
            defaultOpenKeys={['employees-section', 'payroll-section', 'supply-chain-section']}
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
                    label: 'لوحة مؤشرات الرواتب',
                  },
                  {
                    key: 'payroll-list',
                    icon: <FileTextOutlined />,
                    label: 'مسيرات الرواتب الشهرية',
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
                key: 'supply-chain-section',
                icon: <InboxOutlined style={{ fontSize: '17px', color: '#2563eb' }} />,
                label: <span className="font-bold text-blue-800">سلاسل الإمداد والمخزون</span>,
                children: [
                  {
                    key: 'inventory-list',
                    icon: <InboxOutlined />,
                    label: 'أصناف وخامات المخزون',
                  },
                  {
                    key: 'stock-movements',
                    icon: <HistoryOutlined />,
                    label: 'سجل حركات المخزون',
                  },
                  {
                    key: 'purchases-list',
                    icon: <ShoppingCartOutlined />,
                    label: 'أوامر الشراء والاستلام',
                  },
                  {
                    key: 'supplier-list',
                    icon: <ShopOutlined />,
                    label: 'الموردين والحسابات',
                  },
                  {
                    key: 'supplier-statement',
                    icon: <FileTextOutlined />,
                    label: 'كشف حساب مورد',
                  },
                ],
              },
            ]}
          />
        </Sider>

        <Content style={{ background: '#f1f5f9', height: '100%', overflowY: 'auto' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export const EmployeePayrollModuleContainer: React.FC = () => (
  <HrProvider>
    <AppShell />
  </HrProvider>
);

export default EmployeePayrollModuleContainer;
