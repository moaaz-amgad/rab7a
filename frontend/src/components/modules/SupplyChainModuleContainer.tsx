import React, { useState } from 'react';
import { Menu, Layout } from 'antd';
import {
  InboxOutlined,
  HistoryOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { InventoryListPage } from '../../pages/inventory/InventoryListPage';
import { StockMovementsPage } from '../../pages/inventory/StockMovementsPage';
import { PurchaseOrderListPage } from '../../pages/purchases/PurchaseOrderListPage';
import { SupplierListPage } from '../../pages/suppliers/SupplierListPage';
import { SupplierStatementPage } from '../../pages/suppliers/SupplierStatementPage';

const { Header, Content, Sider } = Layout;

export const SupplyChainModuleContainer: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<'inventory' | 'movements' | 'purchases' | 'suppliers' | 'statement'>('inventory');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);

  const handleSelectSupplierStatement = (id: number) => {
    setSelectedSupplierId(id);
    setActiveMenu('statement');
  };

  return (
    <Layout style={{ minHeight: '100vh' }} className="dir-rtl" dir="rtl">
      {/* Top Header Bar */}
      <Header style={{ background: '#001529', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
          نظام ربحة لإدارة المطاعم — Rabha ERP
        </div>
        <div style={{ color: '#e6f7ff', fontSize: '14px' }}>
          وحدة سلاسل الإمداد والمخزون (Supply Chain & WAC Costing)
        </div>
      </Header>

      <Layout>
        {/* Navigation Sidebar */}
        <Sider width={240} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            onClick={({ key }) => setActiveMenu(key as any)}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: 'inventory',
                icon: <InboxOutlined />,
                label: 'أصناف وخامات المخزون',
              },
              {
                key: 'movements',
                icon: <HistoryOutlined />,
                label: 'سجل حركة المخزون',
              },
              {
                key: 'purchases',
                icon: <ShoppingCartOutlined />,
                label: 'أوامر الشراء وإذن الاستلام',
              },
              {
                key: 'suppliers',
                icon: <TeamOutlined />,
                label: 'الموردين والحسابات',
              },
              {
                key: 'statement',
                icon: <FileTextOutlined />,
                label: 'كشف حساب المورد',
              },
            ]}
          />
        </Sider>

        {/* Content Area */}
        <Content style={{ background: '#f0f2f5', minHeight: 280 }}>
          {activeMenu === 'inventory' && <InventoryListPage />}

          {activeMenu === 'movements' && <StockMovementsPage />}

          {activeMenu === 'purchases' && <PurchaseOrderListPage />}

          {activeMenu === 'suppliers' && (
            <SupplierListPage onSelectSupplierStatement={handleSelectSupplierStatement} />
          )}

          {activeMenu === 'statement' && (
            <SupplierStatementPage
              supplierId={selectedSupplierId || 1}
              onBack={() => setActiveMenu('suppliers')}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SupplyChainModuleContainer;
