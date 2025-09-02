import React, { useState } from 'react';
import { useEmployees, useGeneratePayrun } from '../api/hooks';
import { PayrunRequest, Payrun } from '../types/api';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatHours } from '../lib/formatters';
import { useToast } from '../components/common/Toast';

const RunPayPage: React.FC = () => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [generatedPayrun, setGeneratedPayrun] = useState<Payrun | null>(null);
  const [periodStart, setPeriodStart] = useState('2025-09-02'); // Default to a date with timesheet data
  const [periodEnd, setPeriodEnd] = useState('2025-09-02'); // Default to a date with timesheet data
  const { addToast } = useToast();

  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const generatePayrunMutation = useGeneratePayrun();

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees?.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees?.map(emp => emp.id) || []);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!periodStart || !periodEnd) {
      alert('Please select period dates');
      return;
    }
    if (periodStart > periodEnd) {
      alert('Period end must be after or equal to period start');
      return;
    }

    try {
      const request: PayrunRequest = {
        periodStart,
        periodEnd,
        employeeIds: selectedEmployees.length > 0 ? selectedEmployees : undefined
      };
      
      const payrun = await generatePayrunMutation.mutateAsync(request);
      setGeneratedPayrun(payrun);
      addToast({
        type: 'success',
        title: 'Payrun Generated',
        message: `Payrun generated successfully for ${payrun.payslips.length} employees.`
      });
    } catch (err) {
      console.error('Error generating payrun:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate payrun. Please check your data and try again.'
      });
    }
  };

  const handleReset = () => {
    setGeneratedPayrun(null);
    setSelectedEmployees([]);
    setPeriodStart('2025-09-02');
    setPeriodEnd('2025-09-02');
  };

  if (employeesLoading) {
    return <LoadingSpinner className="h-32" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Run Payroll</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate payrun for selected employees and time period. Make sure there are timesheets for the selected period.
        </p>
      </div>

      {!generatedPayrun ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Payrun Configuration
          </h2>
          
          <div className="space-y-6">
            {/* Period Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period Start *</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period End *</label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Employee Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-medium text-gray-900">
                  Select Employees ({selectedEmployees.length} selected)
                </h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedEmployees.length === employees?.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {employees?.map((employee) => (
                  <label key={employee.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleEmployeeToggle(employee.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({employee.id}) - {formatCurrency(employee.baseHourlyRate)}/hr
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              
              <p className="mt-2 text-sm text-gray-500">
                {selectedEmployees.length === 0 
                  ? 'No employees selected - will include all employees' 
                  : `${selectedEmployees.length} employee(s) selected`
                }
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                onClick={handleSubmit}
                loading={generatePayrunMutation.isPending}
              >
                Generate Payrun
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Payrun Results */
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Payrun Results
              </h2>
              <Button
                variant="secondary"
                onClick={handleReset}
              >
                Create New Payrun
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {generatedPayrun.payslips.length}
                </div>
                <div className="text-sm text-gray-600">Employees</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(generatedPayrun.totals.gross)}
                </div>
                <div className="text-sm text-gray-600">Total Gross</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(generatedPayrun.totals.tax)}
                </div>
                <div className="text-sm text-gray-600">Total Tax</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(generatedPayrun.totals.net)}
                </div>
                <div className="text-sm text-gray-600">Total Net</div>
              </div>
            </div>

            {generatedPayrun.totals.gross === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="text-yellow-400">⚠️</div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      No Timesheet Data Found
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      The payrun shows $0 because there are no timesheets for the selected period ({periodStart} to {periodEnd}). 
                      Please ensure timesheets have been created for employees within this date range.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gross Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Super
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Pay
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedPayrun.payslips.map((payslip) => {
                    const employee = employees?.find(emp => emp.id === payslip.employeeId);
                    const totalHours = payslip.normalHours + payslip.overtimeHours;
                    
                    return (
                      <tr key={payslip.employeeId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {employee ? `${employee.firstName} ${employee.lastName}` : payslip.employeeId}
                          </div>
                          <div className="text-sm text-gray-500">{payslip.employeeId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatHours(totalHours)}
                          {payslip.overtimeHours > 0 && (
                            <div className="text-xs text-orange-600">
                              +{formatHours(payslip.overtimeHours)} OT
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payslip.gross)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {formatCurrency(payslip.tax)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          {formatCurrency(payslip.super)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          {formatCurrency(payslip.net)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunPayPage;
