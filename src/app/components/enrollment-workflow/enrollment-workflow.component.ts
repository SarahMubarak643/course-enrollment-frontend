import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EnrollmentService } from '../../services/enrollment.service';
import { ResultService } from '../../services/result.service';
import { AuthService } from '../../services/auth.service';
import { Enrollment, EnrollmentStatus } from '../../models/enrollment.model';
import { Result, ResultRequest } from '../../models/result.model';
import { ApiError } from '../../models/api-error.model';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { notBlankValidator } from '../../validators/not-blank.validator';

// Mirrors courseEnrollement.example.demo.entity.EnrollmentStatus.
// This is only used to decide which buttons to SHOW — the backend is
// still the one that actually enforces which transitions are valid.
const ALLOWED_TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  ENROLLED: ['APPROVED', 'REJECTED', 'WITHDRAWN'],
  APPROVED: ['COMPLETED', 'WITHDRAWN'],
  REJECTED: [],
  WITHDRAWN: [],
  COMPLETED: []
};

const STATUSES_REQUIRING_REASON: EnrollmentStatus[] = ['REJECTED', 'WITHDRAWN'];

@Component({
  selector: 'app-enrollment-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, StatusLabelPipe],
  templateUrl: './enrollment-workflow.component.html'
})
export class EnrollmentWorkflowComponent implements OnInit {

  private fb = inject(FormBuilder);

  enrollment: Enrollment | null = null;
  loading = true;
  errorMessage = '';
  submitting = false;

  // Set while the user is filling in a reason for REJECTED/WITHDRAWN.
  pendingStatus: EnrollmentStatus | null = null;
  reason = '';

  // "Record Assessment Result" panel state -- only relevant once status is COMPLETED.
  existingResult: Result | null = null;
  checkingResult = false;
  showResultForm = false;
  resultSubmitting = false;
  resultError = '';

  resultForm = this.fb.group({
    score: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    completionStatus: ['', [Validators.required, notBlankValidator(), Validators.maxLength(30)]]
  });

  constructor(
    private route: ActivatedRoute,
    private enrollmentService: EnrollmentService,
    private resultService: ResultService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.load(id);
    });
  }

  private load(id: number): void {
    this.loading = true;
    this.enrollmentService.getEnrollmentById(id).subscribe({
      next: (data) => {
        this.enrollment = data;
        this.loading = false;

        if (data.status === 'COMPLETED') {
          this.checkExistingResult(id);
        }
      },
      error: () => {
        this.errorMessage = 'Enrollment not found.';
        this.loading = false;
      }
    });
  }

  // The backend returns 404 when no result has been recorded yet for
  // this enrollment -- that is an expected, normal outcome here, not an error.
  private checkExistingResult(enrollmentId: number): void {
    this.checkingResult = true;
    this.resultService.getResultByEnrollment(enrollmentId).subscribe({
      next: (result) => {
        this.existingResult = result;
        this.checkingResult = false;
      },
      error: () => {
        this.existingResult = null;
        this.checkingResult = false;
      }
    });
  }

  get availableActions(): EnrollmentStatus[] {
    if (!this.enrollment) {
      return [];
    }
    return ALLOWED_TRANSITIONS[this.enrollment.status] ?? [];
  }

  canManageWorkflow(): boolean {
    return this.auth.hasRole('ROLE_INSTRUCTOR', 'ROLE_ADMIN');
  }

  // Same role rule the backend enforces for POST /api/results.
  canRecordResult(): boolean {
    return this.auth.hasRole('ROLE_INSTRUCTOR', 'ROLE_ADMIN');
  }

  // For REJECTED/WITHDRAWN, first ask for a reason. For others, confirm and go.
  requestTransition(status: EnrollmentStatus): void {
    if (STATUSES_REQUIRING_REASON.includes(status)) {
      this.pendingStatus = status;
      this.reason = '';
      return;
    }

    if (confirm(`Change status to ${status}?`)) {
      this.performTransition(status);
    }
  }

  confirmWithReason(): void {
    if (!this.pendingStatus || !this.reason.trim()) {
      return;
    }
    this.performTransition(this.pendingStatus, this.reason.trim());
    this.pendingStatus = null;
  }

  cancelReason(): void {
    this.pendingStatus = null;
    this.reason = '';
  }

  private performTransition(status: EnrollmentStatus, reason?: string): void {
    if (!this.enrollment) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.enrollmentService.updateStatus(this.enrollment.enrollmentId, status, reason).subscribe({
      next: (updated) => {
        this.enrollment = updated;
        this.submitting = false;

        if (updated.status === 'COMPLETED') {
          this.checkExistingResult(updated.enrollmentId);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const body = err.error as ApiError | undefined;
        this.errorMessage = body?.error ?? 'Could not update the enrollment status.';
      }
    });
  }

  openResultForm(): void {
    this.showResultForm = true;
    this.resultError = '';
  }

  cancelResultForm(): void {
    this.showResultForm = false;
    this.resultForm.reset();
  }

  submitResult(): void {
    if (this.resultForm.invalid || !this.enrollment) {
      this.resultForm.markAllAsTouched();
      return;
    }

    const { score, completionStatus } = this.resultForm.getRawValue();

    const request: ResultRequest = {
      enrollmentId: this.enrollment.enrollmentId,
      score: score!,
      completionStatus: completionStatus!
    };

    this.resultSubmitting = true;
    this.resultError = '';

    this.resultService.createResult(request).subscribe({
      next: (result) => {
        this.existingResult = result;
        this.showResultForm = false;
        this.resultSubmitting = false;
        this.resultForm.reset();
      },
      error: (err: HttpErrorResponse) => {
        this.resultSubmitting = false;
        const body = err.error as ApiError | undefined;
        this.resultError = body?.error ?? 'Could not record this result.';
      }
    });
  }
}
