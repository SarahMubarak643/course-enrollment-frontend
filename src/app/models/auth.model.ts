export type Role = 'ROLE_STUDENT' | 'ROLE_INSTRUCTOR' | 'ROLE_ADMIN';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  role: Role;
}
