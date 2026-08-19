import { Course } from './course.model';
import { Student } from './student.model';

export type EnrollmentStatus =
  | 'ENROLLED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'COMPLETED';

export interface Enrollment {
  enrollmentId: number;
  student: Student;
  course: Course;
  enrollmentDate: string;
  status: EnrollmentStatus;
  reason: string | null;
  availableActions: EnrollmentStatus[];
}
