import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-list.component.html'
})
export class StudentListComponent implements OnInit {

  students: Student[] = [];
  loading = true;
  errorMessage = '';

  constructor(private studentService: StudentService, public auth: AuthService) {}

  ngOnInit(): void {
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

  canManageStudents(): boolean {
    return this.auth.hasRole('ROLE_INSTRUCTOR', 'ROLE_ADMIN');
  }
}
