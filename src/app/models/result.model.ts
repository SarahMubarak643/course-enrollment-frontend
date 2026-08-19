import { Enrollment } from './enrollment.model';

export interface Result {
  resultId: number;
  enrollment: Enrollment;
  score: number;
  completionStatus: string;
  lastUpdated: string;
}

export interface ResultRequest {
  enrollmentId: number;
  score: number;
  completionStatus: string;
}
