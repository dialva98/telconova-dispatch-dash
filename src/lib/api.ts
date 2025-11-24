// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'; // Usar mock por defecto

// Import mock service
import { mockApiService } from './mockApi';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  role: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface RegisterResponse {
  message: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  zone: string;
  availability: 'available' | 'busy' | 'offline';
  currentLoad: number;
  certifications: string[];
}

export interface WorkOrder {
  id: string;
  clientName: string;
  address: string;
  zone: string;
  priority: 'high' | 'medium' | 'low';
  specialty: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  assignedTechnicianId?: string;
  assignedAt?: string;
  assignedBy?: string;
  createdAt: string;
}

export interface AssignmentRequest {
  orderId: string;
  technicianId?: string;
  automatic?: boolean;
}

export interface NotificationData {
  orderId: string;
  technicianId: string;
  channels: ('email' | 'sms')[];
}

export interface TechnicianRegistration {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  zone: string;
}

export interface TechnicianMetrics {
  technicianId: string;
  technicianName: string;
  zone: string;
  totalOrders: number;
  completedOrders: number;
  avgResolutionTime: number;
  pendingOrders: number;
  specialty: string;
}

export interface MetricsFilters {
  startDate?: string;
  endDate?: string;
  serviceType?: string;
  zones?: string[];
}

export interface SavedReport {
  id: string;
  name: string;
  filters: MetricsFilters;
  metrics: TechnicianMetrics[];
  generatedAt: string;
}

export interface SaveReportRequest {
  name: string;
  filters: MetricsFilters;
  metrics: TechnicianMetrics[];
  generatedAt: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Spring Boot puede devolver texto plano en algunos errores
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json().catch(() => ({ message: 'Error en la solicitud' }));
        throw new Error(error.message || 'Error en la solicitud');
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error en la solicitud');
      }
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (USE_MOCK_API) {
      return mockApiService.login(credentials);
    }
    
    // Backend espera: { email, password }
    const backendCredentials = {
      email: credentials.username,
      password: credentials.password
    };
    
    const response = await this.request<string>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(backendCredentials),
    });
    
    // Backend devuelve solo "Login successful", generamos token mock
    const mockToken = btoa(JSON.stringify({ email: credentials.username, timestamp: Date.now() }));
    this.setToken(mockToken);
    
    // Construir respuesta en formato esperado por el frontend
    return {
      message: response,
      token: mockToken,
      user: {
        id: credentials.username,
        username: credentials.username,
        role: 'supervisor' // El backend no devuelve rol en login
      }
    };
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    if (USE_MOCK_API) {
      return mockApiService.register(credentials);
    }
    
    // Backend espera: { email, password, name, role }
    const backendCredentials = {
      email: credentials.username,
      password: credentials.password,
      name: credentials.name,
      role: credentials.role
    };
    
    const response = await this.request<string>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(backendCredentials),
    });
    
    return {
      message: response
    };
  }

  async logout(): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.logout();
    }
    this.clearToken();
  }

  // Technicians endpoints
  async getTechnicians(filters?: {
    zone?: string;
    specialty?: string;
    availability?: string;
  }): Promise<Technician[]> {
    if (USE_MOCK_API) {
      return mockApiService.getTechnicians(filters);
    }
    
    // Backend: GET /api/technicians/all (no soporta filtros)
    const backendTechnicians = await this.request<Array<{
      idTecnico: number;
      nameTecnico: string;
      zoneTecnico: string;
      workloadTecnico: string;
      specialtyTecnico: string;
    }>>('/technicians/all');
    
    // Convertir formato backend a formato frontend
    let technicians: Technician[] = backendTechnicians.map(tech => ({
      id: tech.idTecnico.toString(),
      name: tech.nameTecnico,
      email: `${tech.nameTecnico.toLowerCase().replace(/\s+/g, '.')}@telconova.com`,
      phone: '+1234567890',
      specialty: tech.specialtyTecnico,
      zone: tech.zoneTecnico,
      availability: tech.workloadTecnico === 'low' ? 'available' : 
                   tech.workloadTecnico === 'high' ? 'busy' : 'offline',
      currentLoad: tech.workloadTecnico === 'low' ? 2 : 
                  tech.workloadTecnico === 'medium' ? 5 : 8,
      certifications: []
    }));
    
    // Aplicar filtros en frontend ya que el backend no los soporta
    if (filters?.zone) {
      technicians = technicians.filter(t => t.zone === filters.zone);
    }
    if (filters?.specialty) {
      technicians = technicians.filter(t => t.specialty === filters.specialty);
    }
    if (filters?.availability) {
      technicians = technicians.filter(t => t.availability === filters.availability);
    }
    
    return technicians;
  }

  async getTechnician(id: string): Promise<Technician> {
    if (USE_MOCK_API) {
      return mockApiService.getTechnician(id);
    }
    return this.request<Technician>(`/technicians/${id}`);
  }

  // Work orders endpoints
  async getWorkOrders(filters?: {
    status?: string;
    zone?: string;
  }): Promise<WorkOrder[]> {
    if (USE_MOCK_API) {
      return mockApiService.getWorkOrders(filters);
    }
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.zone) params.append('zone', filters.zone);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<WorkOrder[]>(`/work-orders${query}`);
  }

  async getWorkOrder(id: string): Promise<WorkOrder> {
    if (USE_MOCK_API) {
      return mockApiService.getWorkOrder(id);
    }
    return this.request<WorkOrder>(`/work-orders/${id}`);
  }

  // Assignment endpoints
  async assignManually(data: AssignmentRequest): Promise<WorkOrder> {
    if (USE_MOCK_API) {
      return mockApiService.assignManually(data);
    }
    return this.request<WorkOrder>('/assignments/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignAutomatically(orderId: string): Promise<WorkOrder> {
    if (USE_MOCK_API) {
      return mockApiService.assignAutomatically(orderId);
    }
    return this.request<WorkOrder>('/assignments/automatic', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  // Notifications endpoint
  async sendNotification(data: NotificationData): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.sendNotification(data);
    }
    await this.request('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Technician registration endpoint
  async registerTechnician(data: TechnicianRegistration): Promise<{ message: string }> {
    if (USE_MOCK_API) {
      return mockApiService.registerTechnician(data);
    }
    
    // Backend espera: { name, zone, workload, specialty }
    const backendData = {
      name: data.name,
      zone: data.zone,
      workload: 'low', // Valor por defecto
      specialty: data.specialty
    };
    
    const response = await this.request<string>('/technicians/create', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    
    return {
      message: response
    };
  }

  // Metrics endpoints
  async getTechnicianMetrics(filters?: MetricsFilters): Promise<TechnicianMetrics[]> {
    if (USE_MOCK_API) {
      return mockApiService.getTechnicianMetrics(filters);
    }
    
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);
    if (filters?.zones) params.append('zones', filters.zones.join(','));

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<TechnicianMetrics[]>(`/metrics/technicians${query}`);
  }

  async saveReport(data: SaveReportRequest): Promise<{ message: string; reportId: string }> {
    if (USE_MOCK_API) {
      return mockApiService.saveReport(data);
    }
    
    return this.request<{ message: string; reportId: string }>('/metrics/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSavedReports(): Promise<SavedReport[]> {
    if (USE_MOCK_API) {
      return mockApiService.getSavedReports();
    }
    
    return this.request<SavedReport[]>('/metrics/reports');
  }

  async getReportById(reportId: string): Promise<SavedReport> {
    if (USE_MOCK_API) {
      return mockApiService.getReportById(reportId);
    }
    
    return this.request<SavedReport>(`/metrics/reports/${reportId}`);
  }

  async deleteReport(reportId: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.deleteReport(reportId);
    }
    
    await this.request(`/metrics/reports/${reportId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
