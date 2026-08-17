// Matches the JSON returned by GET /api/summary
export interface Summary {
  studentCount: number;
  enrollmentCount: number;
  averageScore: number;
}

// Matches the JSON returned by GET /api/summary/me (personal dashboard)
export interface MySummary {
  myEnrollmentCount: number;
  myCompletedCount: number;
  myAverageScore: number;
}

// Matches one row returned by GET /api/summary/courses
export interface CourseEnrollmentCount {
  courseCode: string;
  courseName: string;
  enrollmentCount: number;
}
