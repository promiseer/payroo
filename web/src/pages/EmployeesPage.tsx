import React, { useState } from 'react';
import { useEmployees, useCreateOrUpdateEmployee, useDeleteEmployee } from '../api/hooks';
import { Employee } from '../types/api';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatCurrency } from '../lib/formatters';

// Add Employee Form Component
const AddEmployeeForm: React.FC<{ onSuccess: () => void; onCancel: () => void }> = ({
  onSuccess,
  onCancel
}) => {
  const createMutation = useCreateOrUpdateEmployee();
  
  // Form state
  const [id, setId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [baseHourlyRate, setBaseHourlyRate] = useState(25.00);
  const [superRate, setSuperRate] = useState(0.115);
  const [bsb, setBsb] = useState('');
  const [account, setAccount] = useState('');

  const handleSubmit = async () => {
    // Basic validation
    if (!id || !firstName || !lastName) {
      alert('Please fill in all required fields (ID, First Name, Last Name)');
      return;
    }
    if (baseHourlyRate <= 0) {
      alert('Base hourly rate must be positive');
      return;
    }
    if (superRate < 0 || superRate > 1) {
      alert('Super rate must be between 0 and 1');
      return;
    }

    try {
      const employeeData: Employee = {
        id,
        firstName,
        lastName,
        type: 'hourly',
        baseHourlyRate,
        superRate,
        bank: (bsb && account) ? { bsb, account } : undefined
      };
      
      await createMutation.mutateAsync(employeeData);
      alert(`${firstName} ${lastName} has been created successfully!`);
      onSuccess();
    } catch (err) {
      console.error('Error creating employee:', err);
      alert('Failed to create employee. Please check your data and try again.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Employee</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID *</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g., EMP001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div></div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Hourly Rate ($) *</label>
            <input
              type="number"
              step="0.01"
              value={baseHourlyRate}
              onChange={(e) => setBaseHourlyRate(Number(e.target.value))}
              placeholder="25.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Super Rate (decimal) *</label>
            <input
              type="number"
              step="0.001"
              value={superRate}
              onChange={(e) => setSuperRate(Number(e.target.value))}
              placeholder="0.115"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
              max="1"
            />
            <p className="mt-1 text-sm text-gray-500">e.g., 0.115 for 11.5%</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank BSB</label>
            <input
              type="text"
              value={bsb}
              onChange={(e) => setBsb(e.target.value)}
              placeholder="123-456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="12345678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={createMutation.isPending}>
            Create Employee
          </Button>
        </div>
      </div>
    </div>
  );
};

// Edit Employee Form Component
const EditEmployeeForm: React.FC<{ 
  employee: Employee; 
  onSuccess: () => void; 
  onCancel: () => void 
}> = ({ employee, onSuccess, onCancel }) => {
  const updateMutation = useCreateOrUpdateEmployee();
  
  // Form state - initialize with employee data
  const [id] = useState(employee.id); // Don't allow changing ID
  const [firstName, setFirstName] = useState(employee.firstName);
  const [lastName, setLastName] = useState(employee.lastName);
  const [baseHourlyRate, setBaseHourlyRate] = useState(employee.baseHourlyRate);
  const [superRate, setSuperRate] = useState(employee.superRate);
  const [bsb, setBsb] = useState(employee.bank?.bsb || '');
  const [account, setAccount] = useState(employee.bank?.account || '');

  const handleSubmit = async () => {
    // Basic validation
    if (!firstName || !lastName) {
      alert('Please fill in all required fields (First Name, Last Name)');
      return;
    }
    if (baseHourlyRate <= 0) {
      alert('Base hourly rate must be positive');
      return;
    }
    if (superRate < 0 || superRate > 1) {
      alert('Super rate must be between 0 and 1');
      return;
    }

    try {
      const employeeData: Employee = {
        id,
        firstName,
        lastName,
        type: 'hourly',
        baseHourlyRate,
        superRate,
        bank: (bsb && account) ? { bsb, account } : undefined
      };
      
      await updateMutation.mutateAsync(employeeData);
      alert(`${firstName} ${lastName} has been updated successfully!`);
      onSuccess();
    } catch (err) {
      console.error('Error updating employee:', err);
      alert('Failed to update employee. Please check your data and try again.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Edit Employee: {employee.firstName} {employee.lastName}
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
            <input
              type="text"
              value={id}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-sm text-gray-500">Employee ID cannot be changed</p>
          </div>
          
          <div></div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Hourly Rate ($) *</label>
            <input
              type="number"
              step="0.01"
              value={baseHourlyRate}
              onChange={(e) => setBaseHourlyRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Super Rate (decimal) *</label>
            <input
              type="number"
              step="0.001"
              value={superRate}
              onChange={(e) => setSuperRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
              max="1"
            />
            <p className="mt-1 text-sm text-gray-500">e.g., 0.115 for 11.5%</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank BSB</label>
            <input
              type="text"
              value={bsb}
              onChange={(e) => setBsb(e.target.value)}
              placeholder="123-456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="12345678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={updateMutation.isPending}>
            Update Employee
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main EmployeesPage Component
const EmployeesPage: React.FC = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: employees, isLoading, error } = useEmployees();
  const deleteEmployeeMutation = useDeleteEmployee();

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsAddFormOpen(false);
  };

  const handleDelete = async (employee: Employee) => {
    const message = `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?\n\nThis action cannot be undone and will permanently remove:\n- Employee record\n- Associated timesheets\n- Historical payslips\n\nType "DELETE" to confirm:`;
    
    const confirmation = window.prompt(message);
    if (confirmation === 'DELETE') {
      try {
        await deleteEmployeeMutation.mutateAsync(employee.id);
        alert(`${employee.firstName} ${employee.lastName} has been deleted successfully.`);
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Failed to delete employee. They may have associated payroll data that prevents deletion.');
      }
    }
  };

  const handleAddSuccess = () => {
    setIsAddFormOpen(false);
  };

  const handleEditSuccess = () => {
    setEditingEmployee(null);
  };

  const handleCancel = () => {
    setIsAddFormOpen(false);
    setEditingEmployee(null);
  };

  const filteredEmployees = employees?.filter(employee => 
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your team members and their payroll information.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button onClick={() => setIsAddFormOpen(true)}>
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Add Form */}
      {isAddFormOpen && (
        <AddEmployeeForm 
          onSuccess={handleAddSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Edit Form */}
      {editingEmployee && (
        <EditEmployeeForm 
          employee={editingEmployee}
          onSuccess={handleEditSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Employees List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Team Members ({filteredEmployees.length})
          </h3>
          
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {searchTerm ? 'No employees found matching your search.' : 'No employees found. Add your first team member!'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">ID: {employee.id}</p>
                        </div>
                        <div className="hidden sm:block">
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {employee.type}
                          </span>
                        </div>
                        <div className="hidden md:block text-sm text-gray-900">
                          <strong>{formatCurrency(employee.baseHourlyRate)}/hr</strong>
                        </div>
                        <div className="hidden lg:block text-sm text-gray-500">
                          Super: {(employee.superRate * 100).toFixed(1)}%
                        </div>
                        {employee.bank && (
                          <div className="hidden xl:block text-xs text-gray-500">
                            Bank: {employee.bank.bsb} {employee.bank.account}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(employee)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(employee)}
                        loading={deleteEmployeeMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
