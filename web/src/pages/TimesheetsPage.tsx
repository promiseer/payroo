import React, { useState } from 'react';
import { useEmployees, useTimesheets, useCreateOrUpdateTimesheet, useDeleteTimesheet } from '../api/hooks';
import { Timesheet, TimesheetEntry } from '../types/api';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatHours, formatDate } from '../lib/formatters';
import { useToast } from '../components/common/Toast';

// Add Timesheet Form Component
const AddTimesheetForm: React.FC<{ onSuccess: () => void; onCancel: () => void }> = ({
  onSuccess,
  onCancel
}) => {
  const { addToast } = useToast();
  const { data: employees } = useEmployees();
  const createMutation = useCreateOrUpdateTimesheet();
  
  // Form state
  const [employeeId, setEmployeeId] = useState('');
  const [periodStart, setPeriodStart] = useState(new Date().toISOString().split('T')[0]);
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split('T')[0]);
  const [allowances, setAllowances] = useState(0);
  const [entries, setEntries] = useState<TimesheetEntry[]>([{
    date: new Date().toISOString().split('T')[0],
    start: '09:00',
    end: '17:00',
    unpaidBreakMins: 30
  }]);

  const handleAddEntry = () => {
    setEntries([...entries, {
      date: new Date().toISOString().split('T')[0],
      start: '09:00',
      end: '17:00',
      unpaidBreakMins: 30
    }]);
  };

  const handleRemoveEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (index: number, field: keyof TimesheetEntry, value: string | number) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const calculateHours = (entry: TimesheetEntry): number => {
    if (!entry.start || !entry.end) return 0;
    const [startHour, startMin] = entry.start.split(':').map(Number);
    const [endHour, endMin] = entry.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const totalMinutes = endMinutes - startMinutes - (entry.unpaidBreakMins || 0);
    return Math.max(0, totalMinutes / 60);
  };

  const getTotalHours = (): number => {
    return entries.reduce((total, entry) => total + calculateHours(entry), 0);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!employeeId) {
      alert('Please select an employee');
      return;
    }
    if (!periodStart || !periodEnd) {
      alert('Please select period dates');
      return;
    }
    if (entries.length === 0) {
      alert('Please add at least one time entry');
      return;
    }

    try {
      const timesheetData: Timesheet = {
        employeeId,
        periodStart,
        periodEnd,
        allowances,
        entries
      };
      
      await createMutation.mutateAsync(timesheetData);
      addToast({
        type: 'success',
        title: 'Timesheet Created',
        message: `Timesheet created successfully!`
      });
      onSuccess();
    } catch (err) {
      console.error('Error creating timesheet:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create timesheet. Please try again.'
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Timesheet</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Employee</option>
              {employees?.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.id})
                </option>
              ))}
            </select>
          </div>
          
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allowances ($)</label>
          <input
            type="number"
            step="0.01"
            value={allowances}
            onChange={(e) => setAllowances(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
          <p className="mt-1 text-sm text-gray-500">Additional allowances or reimbursements</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium text-gray-900">Time Entries</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Total Hours: <strong>{formatHours(getTotalHours())}</strong>
              </span>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddEntry}>
                Add Entry
              </Button>
            </div>
          </div>

          {entries.map((entry, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-medium text-gray-700">Entry {index + 1}</h4>
                {entries.length > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveEntry(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={entry.date}
                    onChange={(e) => handleEntryChange(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={entry.start}
                    onChange={(e) => handleEntryChange(index, 'start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={entry.end}
                    onChange={(e) => handleEntryChange(index, 'end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Break (mins)</label>
                  <input
                    type="number"
                    value={entry.unpaidBreakMins}
                    onChange={(e) => handleEntryChange(index, 'unpaidBreakMins', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                Working Hours: {formatHours(calculateHours(entry))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={createMutation.isPending}>
            Create Timesheet
          </Button>
        </div>
      </div>
    </div>
  );
};

// Edit Timesheet Form Component
const EditTimesheetForm: React.FC<{ 
  timesheet: Timesheet; 
  onSuccess: () => void; 
  onCancel: () => void 
}> = ({ timesheet, onSuccess, onCancel }) => {
  const { addToast } = useToast();
  const { data: employees } = useEmployees();
  const updateMutation = useCreateOrUpdateTimesheet();
  
  // Form state - initialize with timesheet data
  const [employeeId] = useState(timesheet.employeeId); // Don't allow changing employee
  const [periodStart, setPeriodStart] = useState(timesheet.periodStart);
  const [periodEnd, setPeriodEnd] = useState(timesheet.periodEnd);
  const [allowances, setAllowances] = useState(timesheet.allowances);
  const [entries, setEntries] = useState<TimesheetEntry[]>(timesheet.entries);

  const handleAddEntry = () => {
    setEntries([...entries, {
      date: new Date().toISOString().split('T')[0],
      start: '09:00',
      end: '17:00',
      unpaidBreakMins: 30
    }]);
  };

  const handleRemoveEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (index: number, field: keyof TimesheetEntry, value: string | number) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const calculateHours = (entry: TimesheetEntry): number => {
    if (!entry.start || !entry.end) return 0;
    const [startHour, startMin] = entry.start.split(':').map(Number);
    const [endHour, endMin] = entry.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const totalMinutes = endMinutes - startMinutes - (entry.unpaidBreakMins || 0);
    return Math.max(0, totalMinutes / 60);
  };

  const getTotalHours = (): number => {
    return entries.reduce((total, entry) => total + calculateHours(entry), 0);
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees?.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : employeeId;
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!periodStart || !periodEnd) {
      alert('Please select period dates');
      return;
    }
    if (entries.length === 0) {
      alert('Please add at least one time entry');
      return;
    }

    try {
      const timesheetData: Timesheet = {
        employeeId,
        periodStart,
        periodEnd,
        allowances,
        entries
      };
      
      await updateMutation.mutateAsync(timesheetData);
      addToast({
        type: 'success',
        title: 'Timesheet Updated',
        message: `Timesheet updated successfully!`
      });
      onSuccess();
    } catch (err) {
      console.error('Error updating timesheet:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update timesheet. Please try again.'
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Edit Timesheet: {getEmployeeName(employeeId)}
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
            <input
              type="text"
              value={getEmployeeName(employeeId)}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">Employee cannot be changed</p>
          </div>
          
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allowances ($)</label>
          <input
            type="number"
            step="0.01"
            value={allowances}
            onChange={(e) => setAllowances(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
          <p className="mt-1 text-sm text-gray-500">Additional allowances or reimbursements</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium text-gray-900">Time Entries</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Total Hours: <strong>{formatHours(getTotalHours())}</strong>
              </span>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddEntry}>
                Add Entry
              </Button>
            </div>
          </div>

          {entries.map((entry, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-medium text-gray-700">Entry {index + 1}</h4>
                {entries.length > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveEntry(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={entry.date}
                    onChange={(e) => handleEntryChange(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={entry.start}
                    onChange={(e) => handleEntryChange(index, 'start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={entry.end}
                    onChange={(e) => handleEntryChange(index, 'end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Break (mins)</label>
                  <input
                    type="number"
                    value={entry.unpaidBreakMins}
                    onChange={(e) => handleEntryChange(index, 'unpaidBreakMins', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                Working Hours: {formatHours(calculateHours(entry))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={updateMutation.isPending}>
            Update Timesheet
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main TimesheetsPage Component
const TimesheetsPage: React.FC = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: timesheets, isLoading, error } = useTimesheets();
  const { data: employees } = useEmployees();
  const deleteTimesheetMutation = useDeleteTimesheet();
  const { addToast } = useToast();

  const handleEdit = (timesheet: Timesheet) => {
    setEditingTimesheet(timesheet);
    setIsAddFormOpen(false);
  };

  const handleDelete = async (timesheet: Timesheet) => {
    if (!window.confirm(`Are you sure you want to delete the timesheet for ${getEmployeeName(timesheet.employeeId)} (${timesheet.periodStart} - ${timesheet.periodEnd})?`)) {
      return;
    }

    try {
      await deleteTimesheetMutation.mutateAsync({
        employeeId: timesheet.employeeId,
        periodStart: timesheet.periodStart,
        periodEnd: timesheet.periodEnd
      });
      addToast({
        type: 'success',
        title: 'Timesheet Deleted',
        message: 'Timesheet has been successfully deleted.'
      });
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete timesheet. Please try again.'
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddFormOpen(false);
  };

  const handleEditSuccess = () => {
    setEditingTimesheet(null);
  };

  const handleCancel = () => {
    setIsAddFormOpen(false);
    setEditingTimesheet(null);
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees?.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : employeeId;
  };

  const calculateTimesheetTotalHours = (timesheet: Timesheet): number => {
    return timesheet.entries.reduce((total, entry) => {
      if (!entry.start || !entry.end) return total;
      const [startHour, startMin] = entry.start.split(':').map(Number);
      const [endHour, endMin] = entry.end.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const totalMinutes = endMinutes - startMinutes - entry.unpaidBreakMins;
      return total + Math.max(0, totalMinutes / 60);
    }, 0);
  };

  const filteredTimesheets = timesheets?.filter(timesheet => {
    const employeeName = getEmployeeName(timesheet.employeeId).toLowerCase();
    const search = searchTerm.toLowerCase();
    return employeeName.includes(search) || 
           timesheet.employeeId.toLowerCase().includes(search) ||
           timesheet.periodStart.includes(search) ||
           timesheet.periodEnd.includes(search);
  }) || [];

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Timesheets</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage employee timesheets and track working hours.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button onClick={() => setIsAddFormOpen(true)}>
            Create Timesheet
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search timesheets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Add Form */}
      {isAddFormOpen && (
        <AddTimesheetForm 
          onSuccess={handleAddSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Edit Form */}
      {editingTimesheet && (
        <EditTimesheetForm 
          timesheet={editingTimesheet}
          onSuccess={handleEditSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Timesheets List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Timesheets ({filteredTimesheets.length})
          </h3>
          
          {filteredTimesheets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⏰</div>
              <div className="text-gray-500">
                {searchTerm ? 'No timesheets found matching your search.' : 'No timesheets found. Create your first timesheet!'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimesheets.map((timesheet, index) => (
                <div key={`${timesheet.employeeId}-${timesheet.periodStart}-${index}`} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {getEmployeeName(timesheet.employeeId)}
                          </h4>
                          <p className="text-sm text-gray-500">ID: {timesheet.employeeId}</p>
                        </div>
                        <div className="hidden sm:block">
                          <span className="text-sm text-gray-900">
                            {formatDate(timesheet.periodStart)} - {formatDate(timesheet.periodEnd)}
                          </span>
                        </div>
                        <div className="hidden md:block text-sm text-gray-900">
                          <strong>{formatHours(calculateTimesheetTotalHours(timesheet))}</strong>
                        </div>
                        <div className="hidden lg:block text-sm text-gray-500">
                          {timesheet.entries.length} entries
                        </div>
                        {timesheet.allowances > 0 && (
                          <div className="hidden xl:block text-xs text-gray-500">
                            Allowances: ${timesheet.allowances.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(timesheet)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDelete(timesheet)}
                        loading={deleteTimesheetMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

export default TimesheetsPage;
