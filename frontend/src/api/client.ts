const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error ${response.status}`);
  }

  const result = await response.json();
  return result.data ?? result;
}

export const hrApi = {
  getEmployees: () => fetchApi<any[]>('/hr/employees'),
  createEmployee: (data: any) => fetchApi<any>('/hr/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id: number, data: any) => fetchApi<any>(`/hr/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmployee: (id: number) => fetchApi<any>(`/hr/employees/${id}`, { method: 'DELETE' }),
  getStatement: (id: number) => fetchApi<any>(`/hr/employees/${id}/statement`),
};
