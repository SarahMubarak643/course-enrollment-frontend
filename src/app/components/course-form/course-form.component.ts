import { Component, OnInit ,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CourseService } from '../../services/course.service';
import { CourseRequest } from '../../models/course.model';
import { ApiError } from '../../models/api-error.model';
import { notBlankValidator } from '../../validators/not-blank.validator';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './course-form.component.html'
})
export class CourseFormComponent implements OnInit {

  private fb = inject(FormBuilder);

  courseId: number | null = null; 
  submitting = false;
  loading = false;
  generalError = '';

  form = this.fb.group({
    courseCode: ['', [Validators.required, notBlankValidator(), Validators.pattern(/^[A-Za-z0-9]{2,20}$/)]],
    courseName: ['', [Validators.required, notBlankValidator(), Validators.maxLength(100)]],
    category: ['', [Validators.required, notBlankValidator(), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    durationHours: [1, [Validators.required, Validators.min(1)]],
    capacity: [1, [Validators.required, Validators.min(1)]],
    active: [true, [Validators.required]]
  });

  private courseService =inject(CourseService);
  private route=inject(ActivatedRoute);
  private router=inject(Router);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.courseId = Number(idParam);
      this.loading = true;

      this.courseService.getCourseById(this.courseId).subscribe({
        next: (course) => {
          this.form.patchValue(course);
          this.loading = false;
        },
        error: () => {
          this.generalError = 'Could not load this course.';
          this.loading = false;
        }
      });
    }
  }

  get isEditMode(): boolean {
    return this.courseId !== null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.generalError = '';

    const payload = this.form.getRawValue() as CourseRequest;

    const request$ = this.isEditMode
      ? this.courseService.updateCourse(this.courseId!, payload)
      : this.courseService.createCourse(payload);

    request$.subscribe({
      next: (course) => {
        this.submitting = false;
        this.router.navigate(['/courses', course.courseId]);
      },
      error: (err: HttpErrorResponse) => this.handleError(err)
    });
  }

  private handleError(err: HttpErrorResponse): void {
    this.submitting = false;
    const body = err.error as ApiError | undefined;

    if (err.status === 400 && body) {
      // Field-level validation errors 
      for (const field of Object.keys(body)) {
        if (field !== 'error' && this.form.contains(field)) {
          this.form.get(field)?.setErrors({ backend: body[field] });
        }
      }
      if (body['error']) {
        this.generalError = body['error'];
      }
    } else if (body?.error) {
      // 409 conflict 
      this.generalError = body.error;
    } else {
      this.generalError = 'Something went wrong while saving this course.';
    }
  }
}
