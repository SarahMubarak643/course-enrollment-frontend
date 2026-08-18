import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { Student } from '../../models/student.model';
import { Enrollment } from '../../models/enrollment.model';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { StatusHighlightDirective } from '../../directives/status-highlight.directive';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusLabelPipe, StatusHighlightDirective],
  templateUrl: './student-list.component.html'
})
export class StudentListComponent implements OnInit {

  // INSTRUCTOR/ADMIN view: the full list.
  students: Student[] = [];

  // STUDENT view: only their own profile + enrollments.
  myProfile: Student | null = null;
  myEnrollments: Enrollment[] = [];

  loading = true;
  errorMessage = '';

  constructor(
    private studentService: StudentService,
    private enrollmentService: EnrollmentService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.auth.hasRole('ROLE_STUDENT')) {
      this.loadMyProfile();
      return;
    }

    this.loadAllStudents();
  }

  private loadAllStudents(): void {
    this.studentService.getAllStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load students.';
        this.loading = false;
      }
    });
  }

  private loadMyProfile(): void {
    this.studentService.getMyProfile().subscribe({
      next: (profile) => {
        this.myProfile = profile;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load your profile.';
        this.loading = false;
      }
    });

    this.enrollmentService.getMyEnrollments().subscribe({
      next: (data) => (this.myEnrollments = data),
      error: () => {}
    });
  }

  canManageStudents(): boolean {
    return this.auth.hasRole('ROLE_INSTRUCTOR', 'ROLE_ADMIN');
  }
}
