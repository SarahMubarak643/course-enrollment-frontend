import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryService } from '../../services/summary.service';
import { AuthService } from '../../services/auth.service';
import { Summary, MySummary, CourseEnrollmentCount } from '../../models/summary.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  // Full dashboard (INSTRUCTOR/ADMIN)
  summary: Summary | null = null;
  courseReport: CourseEnrollmentCount[] = [];

  // Personal dashboard (STUDENT)
  mySummary: MySummary | null = null;

  loading = true;
  errorMessage = '';

  constructor(private summaryService: SummaryService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loading = true;

    if (this.auth.hasRole('ROLE_STUDENT')) {
      // Personal dashboard: one real backend endpoint, aggregate values only.
      this.summaryService.getMySummary().subscribe({
        next: (data) => {
          this.mySummary = data;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Could not load your dashboard.';
          this.loading = false;
        }
      });
      return;
    }

    // Full dashboard: report 1 (overall counts) + report 2 (per-course).
    this.summaryService.getSummary().subscribe({
      next: (data) => (this.summary = data),
      error: () => (this.errorMessage = 'Could not load the summary report.')
    });

    this.summaryService.getEnrollmentsByCourse().subscribe({
      next: (data) => {
        this.courseReport = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load the course enrollment report.';
        this.loading = false;
      }
    });
  }
}
