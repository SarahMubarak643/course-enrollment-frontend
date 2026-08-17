// Matches courseEnrollement.example.demo.entity.Course
export interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  category: string;
  description: string | null;
  durationHours: number;
  capacity: number;
  active: boolean;
  createdAt: string;
}

// Fields sent to POST/PUT /api/courses — the same shape minus the
// server-generated id and createdAt.
export interface CourseRequest {
  courseCode: string;
  courseName: string;
  category: string;
  description: string | null;
  durationHours: number;
  capacity: number;
  active: boolean;
}
