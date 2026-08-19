import { Component, OnInit ,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/course.model';
import { Enrollment } from '../../models/enrollment.model';
import { ApiError } from '../../models/api-error.model';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { StatusHighlightDirective } from '../../directives/status-highlight.directive';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusLabelPipe, StatusHighlightDirective],
  templateUrl: './course-detail.component.html'
})
export class CourseDetailComponent implements OnInit {

  course: Course | null = null;
  enrollments: Enrollment[] = [];
  loading = true;
  errorMessage = '';

  private route =inject( ActivatedRoute);
  private router=inject( Router);
  private courseService=inject( CourseService);
  private enrollmentService=inject( EnrollmentService);
  public auth=inject( AuthService);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.load(id);
    });
  }

  private load(id: number): void {
    this.loading = true;

    this.courseService.getCourseById(id).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Course not found.';
        this.loading = false;
      }
    });

    this.enrollmentService.getEnrollmentsByCourse(id).subscribe({
      next: (data) => (this.enrollments = data),
      error: () => {} // enrollment data is extra data 
    });
  }

  canManageCourses(): boolean {
    return this.auth.hasRole('ROLE_ADMIN');
  }

  deleteCourse(): void {
    if (!this.course) {
      return;
    }
    if (!confirm(`Delete course "${this.course.courseName}"? This cannot be undone.`)) {
      return;
    }

    this.courseService.deleteCourse(this.course.courseId).subscribe({
      next: () => this.router.navigate(['/courses']),
      error: (err: HttpErrorResponse) => {
        const body = err.error as ApiError | undefined;
        this.errorMessage = body?.error ?? 'Could not delete this course.';
      }
    });
  }
}
