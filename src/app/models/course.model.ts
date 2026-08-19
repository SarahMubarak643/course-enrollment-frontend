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

export interface CourseRequest {
  courseCode: string;
  courseName: string;
  category: string;
  description: string | null;
  durationHours: number;
  capacity: number;
  active: boolean;
}
