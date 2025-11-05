import api from './api';
import type { AuthResponse, RegisterData, LoginData } from '../types';

// Authentication API functions
export const authApi = {
  // Register new user
  register: (data: RegisterData) => 
    api.post<AuthResponse>('/auth/register', data),

  // Login user
  login: (data: LoginData) => 
    api.post<AuthResponse>('/auth/login', data),
};
