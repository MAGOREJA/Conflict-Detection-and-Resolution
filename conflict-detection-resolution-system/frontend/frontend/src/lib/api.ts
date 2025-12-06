// /**
//  * API Service Layer for Conflict Detection System
//  * 
//  * CONFIGURATION:
//  * Set API_BASE_URL to your backend server URL
//  * Example: 'http://localhost:5000' for Flask development server
//  * Example: 'https://your-api.com' for production
//  */

// //const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';


// interface ApiResponse<T = any> {
//   data?: T;
//   error?: string;
// }

// class ApiService {
//   private baseUrl: string;

//   constructor(baseUrl: string) {
//     this.baseUrl = baseUrl;
//   }

//   private async request<T>(
//     endpoint: string,
//     options?: RequestInit
//   ): Promise<ApiResponse<T>> {
//     try {
//       const response = await fetch(`${this.baseUrl}${endpoint}`, {
//         ...options,
//         headers: {
//           'Content-Type': 'application/json',
//           ...options?.headers,
//         },
//         credentials: 'include', // Important for session cookies
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         return { error: error.message || 'Request failed' };
//       }

//       const data = await response.json();
//       return { data };
//     } catch (error) {
//       console.error('API Error:', error);
//       return { error: 'Network error occurred' };
//     }
//   }

//   // Auth endpoints
//   async register(username: string, password: string, role: string) {
//     return this.request('/api/auth/register', {
//       method: 'POST',
//       body: JSON.stringify({ username, password, role }),
//     });
//   }

//   async login(username: string, password: string) {
//     return this.request('/api/auth/login', {
//       method: 'POST',
//       body: JSON.stringify({ username, password }),
//     });
//   }

//   async logout() {
//     return this.request('/api/auth/logout', {
//       method: 'POST',
//     });
//   }

//   // Task endpoints
//   async getTasks() {
//     return this.request('/api/tasks');
//   }

//   async createTask(task: any) {
//     return this.request('/api/tasks/', {
//       method: 'POST',
//       body: JSON.stringify(task),
//     });
//   }

//   async updateTask(id: string, task: any) {
//     return this.request(`/api/tasks/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(task),
//     });
//   }

//   async deleteTask(id: string) {
//     return this.request(`/api/tasks/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   // Conflict endpoints
//   async reportConflict(conflict: any) {
//     return this.request('/api/conflicts/report', {
//       method: 'POST',
//       body: JSON.stringify(conflict),
//     });
//   }

//   async detectConflicts() {
//     return this.request('/api/conflicts/detect');
//   }

//   async resolveConflict(id: string, resolution: any) {
//     return this.request(`/api/conflicts/${id}/resolve`, {
//       method: 'POST',
//       body: JSON.stringify(resolution),
//     });
//   }

//   // Reports endpoints
//   async exportReport(format: 'csv' | 'pdf') {
//     const response = await fetch(`${this.baseUrl}/api/reports/export?format=${format}`, {
//       credentials: 'include',
//     });
    
//     if (!response.ok) {
//       return { error: 'Export failed' };
//     }

//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `conflict_report.${format}`;
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//     document.body.removeChild(a);
    
//     return { data: 'Export successful' };
//   }
// }

// export const api = new ApiService(API_BASE_URL);











/**
 * API Service Layer for Conflict Detection System
 *
 * CONFIGURATION:
 * Set API_BASE_URL to your backend server URL
 * Example: 'http://localhost:5000' for Flask development server
 * Example: 'https://your-api.com' for production
 */

//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include', // Important for session cookies
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error occurred' };
    }
  }

  // =====================
  // AUTH ENDPOINTS
  // =====================
  async register(username: string, password: string, role: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  }

  async login(username: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // =====================
  // TASK ENDPOINTS
  // =====================
// =====================
// TASK ENDPOINTS
// =====================
  // Task endpoints
  async getTasks() {
    return this.request('/api/tasks');
  }

  async getTaskById<T = any>(id: string) {
    return this.request<T>(`/api/tasks/${id}`);
  }

  async createTask(task: any) {
    return this.request('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: any) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }


async deleteTask(id: string) {
  return this.request(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
}


  // =====================
  // CONFLICT ENDPOINTS
  // =====================

  // Fetch all active conflicts
  async getConflicts() {
    return this.request('/api/conflicts');
  }

  // Run conflict detection manually
  async detectConflicts() {
    return this.request('/api/conflicts/detect');
  }

  // Report a new conflict
  async reportConflict(conflict: any) {
    return this.request('/api/conflicts/report', {
      method: 'POST',
      body: JSON.stringify(conflict),
    });
  }

  // Resolve a conflict manually
  async resolveConflict(id: string, resolution: any) {
    return this.request(`/api/conflicts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolution),
    });
  }

  // =====================
  // REPORTS ENDPOINTS
  // =====================
  async exportReport(format: 'csv' | 'pdf') {
    const response = await fetch(`${this.baseUrl}/api/reports/export?format=${format}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return { error: 'Export failed' };
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conflict_report.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { data: 'Export successful' };
  }
}

export const api = new ApiService(API_BASE_URL);
