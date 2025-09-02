import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayslip } from '../api/hooks';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatCurrency, formatDate, formatHours } from '../lib/formatters';

const PayslipDetailPage: React.FC = () => {
  const { employeeId, payrunId } = useParams<{ employeeId: string; payrunId: string }>();
  const navigate = useNavigate();
  
  const { data: payslip, isLoading, error } = usePayslip(
    employeeId || '',
    payrunId || ''
  );

  if (!employeeId || !payrunId) {
    return <ErrorMessage error="Invalid payslip parameters" />;
  }

  if (isLoading) {
    return <LoadingSpinner className="h-32" />;
  }

  if (error) {
    return <ErrorMessage error={error} title="Error loading payslip" />;
  }

  if (!payslip) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <p className="text-gray-800">Payslip not found</p>
      </div>
    );
  }

  const printPayslip = () => {
    const printContent = document.getElementById('payslip-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${payslip?.employee.firstName} ${payslip?.employee.lastName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 20px;
            }
            .payslip-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
            h2 { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1f2937; }
            .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 24px; }
            .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
            .header-right { text-align: right; }
            .period-text { color: #6b7280; margin-top: 4px; }
            .payrun-id-label { font-size: 14px; color: #6b7280; }
            .payrun-id { font-size: 18px; font-family: monospace; }
            .grid { display: grid; gap: 32px; margin-bottom: 32px; }
            .grid-2 { grid-template-columns: 1fr 1fr; }
            .details-section { margin-bottom: 24px; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .detail-label { color: #6b7280; }
            .detail-value { font-weight: 500; }
            .net-pay { font-size: 20px; font-weight: bold; color: #2563eb; }
            .hours-section { background: #f9fafb; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
            .hours-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px; }
            .hours-total { margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 24px; }
            thead { background: #f9fafb; }
            th, td { padding: 12px 24px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
            .amount-cell { text-align: right; font-weight: 500; }
            .gross-pay { color: #059669; }
            .tax-deduction { color: #dc2626; }
            .net-pay-row { background: #dbeafe; }
            .net-pay-cell { font-weight: bold; color: #2563eb; }
            .super-section { background: #f3e8ff; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
            .super-amount { color: #7c3aed; font-weight: 500; }
            .super-note { font-size: 12px; color: #6b7280; margin-top: 4px; }
            .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; }
            .footer-text { font-size: 12px; color: #6b7280; }
            @media print {
              body { padding: 0; }
              .payslip-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="payslip-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Button 
          variant="secondary"
          onClick={() => navigate('/payruns')}
        >
          ← Back to Payruns
        </Button>
        <Button onClick={printPayslip}>
          Print Payslip
        </Button>
      </div>

      <div id="payslip-content" className="bg-white shadow rounded-lg p-8 print:shadow-none print:p-0">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payslip</h1>
              <p className="text-gray-600 mt-1">
                Pay Period: {formatDate(payslip.payrun.periodStart)} - {formatDate(payslip.payrun.periodEnd)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Payrun ID</p>
              <p className="text-lg font-mono">{payslip.payrun.id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Employee Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {payslip.employee.firstName} {payslip.employee.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Employee ID:</span>
                <span className="font-medium font-mono">{payslip.employeeId}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Net Pay:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(payslip.net)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Hours Worked</h2>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Normal Hours:</span>
                  <span className="font-medium">{formatHours(payslip.normalHours)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overtime Hours:</span>
                  <span className="font-medium">{formatHours(payslip.overtimeHours)}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Total Hours:</span>
                  <span>{formatHours(payslip.normalHours + payslip.overtimeHours)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Breakdown</h2>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Gross Pay
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                      {formatCurrency(payslip.gross)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Income Tax
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                      -{formatCurrency(payslip.tax)}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-blue-50">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Net Pay
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                      {formatCurrency(payslip.net)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Employer Contributions</h2>
            <div className="bg-purple-50 rounded-md p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Superannuation:</span>
                <span className="font-medium text-purple-600">
                  {formatCurrency(payslip.super)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Paid directly to your superannuation fund
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            This payslip was generated on {formatDate(new Date())} by Payroo Payroll System
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailPage;
