// Matches the two backend roles used by the Course Enrollment workflow.
// The backend also has ROLE_ADMIN for full administrative access.
export type Role = 'ROLE_STUDENT' | 'ROLE_INSTRUCTOR' | 'ROLE_ADMIN';

// Matches courseEnrollement.example.demo.dto.LoginRequest
export interface LoginRequest {
  username: string;
  password: string;
}

// Matches courseEnrollement.example.demo.dto.LoginResponse
export interface LoginResponse {
  username: string;
  role: Role;
}
