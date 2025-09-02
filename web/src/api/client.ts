import { 
  Employee, 
  Timesheet, 
  PayrunRequest, 
  Payrun, 
  PayslipDetail,
  ApiError 
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const AUTH_TOKEN = import.meta.env.VITE_API_TOKEN || 'demo-token';

class ApiClient {
  private baseURL: string;
  private authToken: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.authToken = AUTH_TOKEN;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'Network Error',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Handle responses with no content (like 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Employee endpoints
  async getEmployees(): Promise<Employee[]> {
    return this.request('/employees');
  }

  async getEmployee(id: string): Promise<Employee> {
    return this.request(`/employees/${id}`);
  }

  async createOrUpdateEmployee(employee: Employee): Promise<Employee> {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  async deleteEmployee(id: string): Promise<void> {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Timesheet endpoints
  async getTimesheets(params?: {
    employeeId?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<Timesheet[]> {
    const searchParams = new URLSearchParams();
    if (params?.employeeId) searchParams.append('employeeId', params.employeeId);
    if (params?.periodStart) searchParams.append('periodStart', params.periodStart);
    if (params?.periodEnd) searchParams.append('periodEnd', params.periodEnd);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/timesheets${query}`);
  }

  async createOrUpdateTimesheet(timesheet: Timesheet): Promise<Timesheet> {
    return this.request('/timesheets', {
      method: 'POST',
      body: JSON.stringify(timesheet),
    });
  }

  async deleteTimesheet(employeeId: string, periodStart: string, periodEnd: string): Promise<void> {
    return this.request(`/timesheets/${employeeId}/${periodStart}/${periodEnd}`, {
      method: 'DELETE',
    });
  }

  // Payrun endpoints
  async generatePayrun(request: PayrunRequest): Promise<Payrun> {
    return this.request('/payruns', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getPayruns(): Promise<Payrun[]> {
    return this.request('/payruns');
  }

  async getPayrun(id: string): Promise<Payrun> {
    return this.request(`/payruns/${id}`);
  }

  // Payslip endpoints
  async getPayslip(employeeId: string, payrunId: string): Promise<PayslipDetail> {
    return this.request(`/payslips/${employeeId}/${payrunId}`);
  }
}

export const apiClient = new ApiClient();
