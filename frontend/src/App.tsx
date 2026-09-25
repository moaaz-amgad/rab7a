import React from 'react';
import { ConfigProvider } from 'antd';
import arEG from 'antd/locale/ar_EG';
import { EmployeePayrollModuleContainer } from './components/modules/EmployeePayrollModuleContainer';

export const App: React.FC = () => {
  return (
    <ConfigProvider
      direction="rtl"
      locale={arEG}
      theme={{
        token: {
          fontFamily: 'Cairo, sans-serif',
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <EmployeePayrollModuleContainer />
    </ConfigProvider>
  );
};

export default App;
