// Matches courseEnrollement.example.demo.entity.Student
export interface Student {
  studentId: number;
  studentNumber: string;
  fullName: string;
  email: string;
  active: boolean;
  createdAt: string;
}

// Fields sent to POST/PUT /api/students -- the same shape minus the
// server-generated id and createdAt.
export interface StudentRequest {
  studentNumber: string;
  fullName: string;
  email: string;
  active: boolean;
}
