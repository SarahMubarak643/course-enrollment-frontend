export interface Summary {
  studentCount: number;
  enrollmentCount: number;
  averageScore: number;
}

export interface MySummary {
  myEnrollmentCount: number;
  myCompletedCount: number;
  myAverageScore: number;
}

export interface CourseEnrollmentCount {
  courseCode: string;
  courseName: string;
  enrollmentCount: number;
}
