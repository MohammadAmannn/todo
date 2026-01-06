
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum TodoCategory {
  URGENT = 'Urgent',
  NON_URGENT = 'Non-Urgent'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  password?: string; // Only used for simulated DB
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  category: TodoCategory;
  completed: boolean;
  userId: string;
  userName?: string; // For admin view
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}
