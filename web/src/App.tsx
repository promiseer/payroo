import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/common/Toast';
import Layout from './components/common/Layout';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import TimesheetsPage from './pages/TimesheetsPage';
import RunPayPage from './pages/RunPayPage';
import PayrunsPage from './pages/PayrunsPage';
import PayslipDetailPage from './pages/PayslipDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/timesheets" element={<TimesheetsPage />} />
              <Route path="/run-pay" element={<RunPayPage />} />
              <Route path="/payruns" element={<PayrunsPage />} />
              <Route path="/payslips/:employeeId/:payrunId" element={<PayslipDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
