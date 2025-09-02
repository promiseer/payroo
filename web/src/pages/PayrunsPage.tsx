import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayruns } from '../api/hooks';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatCurrency, formatDate, formatDateTime, formatHours } from '../lib/formatters';

const PayrunsPage: React.FC = () => {
  const [expandedPayrun, setExpandedPayrun] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { data: payruns, isLoading, error } = usePayruns();

  const toggleExpanded = (payrunId: string) => {
    setExpandedPayrun(expandedPayrun === payrunId ? null : payrunId);
  };

  const viewPayslip = (employeeId: string, payrunId: string) => {
    navigate(`/payslips/${employeeId}/${payrunId}`);
  };

  if (isLoading) {
    return <LoadingSpinner className="h-32" />;
  }

  if (error) {
    return <ErrorMessage error={error} title="Error loading payruns" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Run Pay  History</h1>
        <div className="text-sm text-gray-500">
          {payruns?.length || 0} payrun{(payruns?.length || 0) !== 1 ? 's' : ''} found
        </div>
      </div>

      {payruns && payruns.length > 0 ? (
        <div className="space-y-4">
          {payruns.map((payrun) => (
            <div key={payrun.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Payrun #{payrun.id}
                      </h3>
                      <span className="text-sm text-gray-500">
                        Generated: {formatDateTime(payrun.createdAt)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block">Period</span>
                        <span className="font-medium">
                          {formatDate(payrun.periodStart)} - {formatDate(payrun.periodEnd)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Employees</span>
                        <span className="font-medium">{payrun.payslips.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Total Gross</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(payrun.totals.gross)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Total Tax</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(payrun.totals.tax)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Total Net</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(payrun.totals.net)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleExpanded(payrun.id)}
                  >
                    {expandedPayrun === payrun.id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>

                {expandedPayrun === payrun.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Employee Payslips
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employee ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Normal Hours
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              OT Hours
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Gross Pay
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tax
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Super
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Net Pay
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payrun.payslips.map((payslip) => (
                            <tr key={payslip.employeeId} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {payslip.employeeId}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatHours(payslip.normalHours)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatHours(payslip.overtimeHours)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(payslip.gross)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">
                                {formatCurrency(payslip.tax)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-purple-600">
                                {formatCurrency(payslip.super)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                {formatCurrency(payslip.net)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => viewPayslip(payslip.employeeId, payrun.id)}
                                  className="text-blue-600 hover:text-blue-900 text-xs underline"
                                >
                                  View Payslip
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Gross:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(payrun.totals.gross)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Tax:</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(payrun.totals.tax)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Super:</span>
                          <span className="font-medium text-purple-600">
                            {formatCurrency(payrun.totals.super)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Net:</span>
                          <span className="font-medium text-blue-600">
                            {formatCurrency(payrun.totals.net)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Payruns Yet
          </h3>
          <p className="text-gray-500 mb-4">
            Generate your first payrun to see the history here.
          </p>
          <Button onClick={() => window.location.href = '/run-pay'}>
            Generate Payrun
          </Button>
        </div>
      )}
    </div>
  );
};

export default PayrunsPage;
