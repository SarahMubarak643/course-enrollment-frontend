export interface Student {
  studentId: number;
  studentNumber: string;
  fullName: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export interface StudentRequest {
  studentNumber: string;
  fullName: string;
  email: string;
  active: boolean;
}
