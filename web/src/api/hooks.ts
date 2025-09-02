import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { Employee, Timesheet, PayrunRequest } from '../types/api';

// Query keys
export const queryKeys = {
  employees: ['employees'] as const,
  employee: (id: string) => ['employees', id] as const,
  timesheets: (params?: any) => ['timesheets', params] as const,
  payruns: ['payruns'] as const,
  payrun: (id: string) => ['payruns', id] as const,
  payslip: (employeeId: string, payrunId: string) => 
    ['payslips', employeeId, payrunId] as const,
};

// Employee hooks
export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: apiClient.getEmployees.bind(apiClient),
  });
}

export function useCreateOrUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (employee: Employee) => 
      apiClient.createOrUpdateEmployee(employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}

// Timesheet hooks
export function useTimesheets(params?: {
  employeeId?: string;
  periodStart?: string;
  periodEnd?: string;
}) {
  return useQuery({
    queryKey: queryKeys.timesheets(params),
    queryFn: () => apiClient.getTimesheets(params),
  });
}

export function useCreateOrUpdateTimesheet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (timesheet: Timesheet) => 
      apiClient.createOrUpdateTimesheet(timesheet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timesheets() });
    },
  });
}

export function useDeleteTimesheet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ employeeId, periodStart, periodEnd }: { employeeId: string, periodStart: string, periodEnd: string }) => 
      apiClient.deleteTimesheet(employeeId, periodStart, periodEnd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timesheets() });
    },
  });
}

// Payrun hooks
export function usePayruns() {
  return useQuery({
    queryKey: queryKeys.payruns,
    queryFn: apiClient.getPayruns.bind(apiClient),
  });
}

export function usePayrun(id: string) {
  return useQuery({
    queryKey: queryKeys.payrun(id),
    queryFn: () => apiClient.getPayrun(id),
    enabled: !!id,
  });
}

export function useGeneratePayrun() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: PayrunRequest) => 
      apiClient.generatePayrun(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payruns });
    },
  });
}

// Payslip hooks
export function usePayslip(employeeId: string, payrunId: string) {
  return useQuery({
    queryKey: queryKeys.payslip(employeeId, payrunId),
    queryFn: () => apiClient.getPayslip(employeeId, payrunId),
    enabled: !!employeeId && !!payrunId,
  });
}
