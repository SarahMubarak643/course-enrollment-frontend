import { Course } from './course.model';
import { Student } from './student.model';

// Matches courseEnrollement.example.demo.entity.EnrollmentStatus.
// Keep this list in sync with the backend enum — the backend is the
// source of truth for which transitions are actually allowed.
export type EnrollmentStatus =
  | 'ENROLLED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'COMPLETED';

// Matches courseEnrollement.example.demo.entity.Enrollment
export interface Enrollment {
  enrollmentId: number;
  student: Student;
  course: Course;
  enrollmentDate: string;
  status: EnrollmentStatus;
  reason: string | null;
  // Computed by the backend from EnrollmentStatus -- the single source
  // of truth for which transitions are valid from the current status.
  availableActions: EnrollmentStatus[];
}
