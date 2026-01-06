import { User, Todo, UserRole } from '../types';

/**
 * API Client
 * Connects to Node.js / Express backend
 */
const API_BASE_URL = 'http://127.0.0.1:5000/api';

type Session = {
  user: User;
  token: string;
};

class ApiClient {
  // -------------------------
  // Helpers
  // -------------------------

  private getSession(): Session | null {
    const raw = localStorage.getItem('todo_app_session');
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.token && parsed?.user) {
        return parsed;
      }
      return null;
    } catch {
      localStorage.removeItem('todo_app_session');
      return null;
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const session = this.getSession();
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }

    return headers;
  }

  private async parseResponse(response: Response) {
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    return data;
  }

  private async handleResponse(response: Response) {
    const data = await this.parseResponse(response);

    if (response.status === 401) {
      // token is invalid or missing
      localStorage.removeItem('todo_app_session');
      throw new Error(data?.message || 'Unauthorized');
    }

    if (!response.ok) {
      throw new Error(data?.message || 'Request failed');
    }

    return data;
  }

  // -------------------------
  // Auth
  // -------------------------

  async register(data: Partial<User>): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse(response);

    // Persist session
    localStorage.setItem(
      'todo_app_session',
      JSON.stringify({ user: result.user, token: result.token })
    );

    return result;
  }

  async login(
    credential: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, password }),
    });

    const result = await this.handleResponse(response);

    // Persist session
    localStorage.setItem(
      'todo_app_session',
      JSON.stringify({ user: result.user, token: result.token })
    );

    return result;
  }

  logout() {
    localStorage.removeItem('todo_app_session');
  }

  // -------------------------
  // Todos
  // -------------------------

  async fetchTodos(role: UserRole, ADMIN: UserRole): Promise<Todo[]> {
    const url =
      role === UserRole.ADMIN
        ? `${API_BASE_URL}/todos/admin/all`
        : `${API_BASE_URL}/todos`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createTodo(
    todoData: Omit<Todo, 'id' | 'completed'>
  ): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(todoData),
    });

    return this.handleResponse(response);
  }

  async updateTodo(
    id: string,
    updates: Partial<Todo>
  ): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    return this.handleResponse(response);
  }

  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    await this.handleResponse(response);
  }

  // -------------------------
  // Admin
  // -------------------------

  async fetchAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateUserRole(
    targetUserId: string,
    newRole: UserRole
  ): Promise<User> {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${targetUserId}/role`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ role: newRole }),
      }
    );

    return this.handleResponse(response);
  }
}

export const api = new ApiClient();
