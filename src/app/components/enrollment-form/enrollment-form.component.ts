import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { Student } from '../../models/student.model';
import { Course } from '../../models/course.model';
import { ApiError } from '../../models/api-error.model';

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './enrollment-form.component.html'
})
export class EnrollmentFormComponent implements OnInit {

  private fb = inject(FormBuilder);

  students: Student[] = [];
  courses: Course[] = [];
  loading = true;
  submitting = false;
  errorMessage = '';

  form = this.fb.group({
    studentId: [null as number | null, [Validators.required]],
    courseId: [null as number | null, [Validators.required]]
  });

  constructor(
    private studentService: StudentService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Dropdown values come from the backend, never hardcoded.
    forkJoin({
      students: this.studentService.getAllStudents(),
      courses: this.courseService.getAllCourses()
    }).subscribe({
      next: ({ students, courses }) => {
        this.students = students;
        this.courses = courses;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load students/courses.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { studentId, courseId } = this.form.getRawValue();
    this.submitting = true;
    this.errorMessage = '';

    this.enrollmentService.enrollStudent(studentId!, courseId!).subscribe({
      next: (enrollment) => {
        this.submitting = false;
        this.router.navigate(['/enrollments', enrollment.enrollmentId]);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const body = err.error as ApiError | undefined;
        this.errorMessage = body?.error ?? 'Could not create this enrollment.';
      }
    });
  }
}
