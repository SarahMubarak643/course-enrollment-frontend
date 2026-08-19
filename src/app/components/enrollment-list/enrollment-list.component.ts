import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { Enrollment } from '../../models/enrollment.model';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { StatusHighlightDirective } from '../../directives/status-highlight.directive';

@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusLabelPipe, StatusHighlightDirective],
  templateUrl: './enrollment-list.component.html'
})
export class EnrollmentListComponent implements OnInit {

  enrollments: Enrollment[] = [];
  loading = true;
  errorMessage = '';

  constructor(private enrollmentService: EnrollmentService, public auth: AuthService) {}

  ngOnInit(): void {
    const enrollments$ = this.auth.hasRole('ROLE_STUDENT')
      ? this.enrollmentService.getMyEnrollments()
      : this.enrollmentService.getAllEnrollments();

    enrollments$.subscribe({
      next: (data) => {
        this.enrollments = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load enrollments.';
        this.loading = false;
      }
    });
  }

  canCreateEnrollments(): boolean {
    return this.auth.hasRole('ROLE_INSTRUCTOR', 'ROLE_ADMIN');
  }
}
