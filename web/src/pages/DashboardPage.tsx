import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees, usePayruns } from '../api/hooks';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../lib/formatters';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: payruns, isLoading: payrunsLoading } = usePayruns();

  const isLoading = employeesLoading || payrunsLoading;

  if (isLoading) {
    return <LoadingSpinner className="h-32" />;
  }

  const totalEmployees = employees?.length || 0;
  const totalPayruns = payruns?.length || 0;
  const lastPayrun = payruns?.[0]; // Assuming most recent first
  const totalPaidThisMonth = lastPayrun?.totals.net || 0;

  const quickActions = [
    {
      title: 'Add Employee',
      description: 'Create a new employee record',
      icon: '👥',
      action: () => navigate('/employees'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Create Timesheet',
      description: 'Record employee working hours',
      icon: '⏰',
      action: () => navigate('/timesheets'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Generate Payrun',
      description: 'Process payroll for employees',
      icon: '💰',
      action: () => navigate('/run-pay'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'View Payruns',
      description: 'Review payroll history',
      icon: '📊',
      action: () => navigate('/payruns'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Payroo
        </h1>
        <p className="text-gray-600">
          Your complete payroll management system. Manage employees, track timesheets, and process payroll with ease.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">👥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Employees
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalEmployees}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📊</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Payruns
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalPayruns}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">💰</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Last Payrun Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalPaidThisMonth ? formatCurrency(totalPaidThisMonth) : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">✅</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    System Status
                  </dt>
                  <dd className="text-lg font-medium text-green-600">
                    Active
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 text-left`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Add Employees</h3>
              <p className="text-sm text-gray-600">
                Start by adding your employees with their details and hourly rates.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Create Timesheets</h3>
              <p className="text-sm text-gray-600">
                Record working hours for each employee for the pay period.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Generate Payrun</h3>
              <p className="text-sm text-gray-600">
                Process payroll with automatic tax and superannuation calculations.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">View Results</h3>
              <p className="text-sm text-gray-600">
                Review payslips and payrun summaries in the system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
