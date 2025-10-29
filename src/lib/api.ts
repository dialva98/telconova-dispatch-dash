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
    
    // Convertir formato para Spring Boot backend
    const backendCredentials = {
      correo: credentials.username,
      contraseña: credentials.password
    };
    
    const response = await this.request<{ message: string; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(backendCredentials),
    });
    
    this.setToken(response.token);
    
    // Construir respuesta en formato esperado por el frontend
    return {
      message: response.message,
      token: response.token,
      user: {
        id: credentials.username,
        username: credentials.username,
        role: 'supervisor' // El backend debería devolver esto, asumimos supervisor por ahora
      }
    };
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    if (USE_MOCK_API) {
      return mockApiService.register(credentials);
    }
    
    // Convertir formato para Spring Boot backend
    const backendCredentials = {
      nombre: credentials.name,
      rol: credentials.role,
      correo: credentials.username,
      contraseña: credentials.password
    };
    
    const response = await this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(backendCredentials),
    });
    
    return {
      message: response.message
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
    const params = new URLSearchParams();
    if (filters?.zone) params.append('zone', filters.zone);
    if (filters?.specialty) params.append('specialty', filters.specialty);
    if (filters?.availability) params.append('availability', filters.availability);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Technician[]>(`/technicians${query}`);
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
}

export const apiService = new ApiService();
