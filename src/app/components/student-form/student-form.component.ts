import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentService } from '../../services/student.service';
import { StudentRequest } from '../../models/student.model';
import { ApiError } from '../../models/api-error.model';
import { notBlankValidator } from '../../validators/not-blank.validator';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-form.component.html'
})
export class StudentFormComponent implements OnInit {

  private fb = inject(FormBuilder);

  studentId: number | null = null; 
  submitting = false;
  loading = false;
  generalError = '';

  form = this.fb.group({
    studentNumber: ['', [Validators.required, notBlankValidator(), Validators.pattern(/^STU[A-Za-z0-9]*$/), Validators.maxLength(50)]],
    fullName: ['', [Validators.required, notBlankValidator(), Validators.maxLength(100)]],
    email: ['', [Validators.required, notBlankValidator(), Validators.email, Validators.maxLength(100)]],
    active: [true, [Validators.required]]
  });

  constructor(
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.studentId = Number(idParam);
      this.loading = true;

      this.studentService.getStudentById(this.studentId).subscribe({
        next: (student) => {
          this.form.patchValue(student);
          this.loading = false;
        },
        error: () => {
          this.generalError = 'Could not load this student.';
          this.loading = false;
        }
      });
    }
  }

  get isEditMode(): boolean {
    return this.studentId !== null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.generalError = '';

    const payload = this.form.getRawValue() as StudentRequest;

    const request$ = this.isEditMode
      ? this.studentService.updateStudent(this.studentId!, payload)
      : this.studentService.createStudent(payload);

    request$.subscribe({
      next: (student) => {
        this.submitting = false;
        this.router.navigate(['/students', student.studentId]);
      },
      error: (err: HttpErrorResponse) => this.handleError(err)
    });
  }

  private handleError(err: HttpErrorResponse): void {
    this.submitting = false;
    const body = err.error as ApiError | undefined;

    if (err.status === 400 && body) {
      // Field level validation errors 
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
      this.generalError = 'Something went wrong while saving this student.';
    }
  }
}
