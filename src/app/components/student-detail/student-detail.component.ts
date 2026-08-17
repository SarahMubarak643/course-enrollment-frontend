import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { Student } from '../../models/student.model';
import { Enrollment } from '../../models/enrollment.model';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { StatusHighlightDirective } from '../../directives/status-highlight.directive';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusLabelPipe, StatusHighlightDirective],
  templateUrl: './student-detail.component.html'
})
export class StudentDetailComponent implements OnInit {

  student: Student | null = null;
  enrollments: Enrollment[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      this.studentService.getStudentById(id).subscribe({
        next: (student) => {
          this.student = student;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Student not found.';
          this.loading = false;
        }
      });

      this.enrollmentService.getEnrollmentsByStudent(id).subscribe({
        next: (data) => (this.enrollments = data),
        error: () => {}
      });
    });
  }
}
