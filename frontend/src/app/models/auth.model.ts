export interface AuthResponse {
  token: string;
  username: string;
  name: string;
  role: string;
}

export interface UserResponse {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  address: string;
  role?: string;
}
