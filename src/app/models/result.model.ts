import { Enrollment } from './enrollment.model';

// Matches courseEnrollement.example.demo.entity.Result
export interface Result {
  resultId: number;
  enrollment: Enrollment;
  score: number;
  completionStatus: string;
  lastUpdated: string;
}

// Fields sent to POST /api/results (as request params, matching the
// backend controller signature) to record an assessment result.
export interface ResultRequest {
  enrollmentId: number;
  score: number;
  completionStatus: string;
}
