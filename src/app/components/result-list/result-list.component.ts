import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResultService } from '../../services/result.service';
import { AuthService } from '../../services/auth.service';
import { Result } from '../../models/result.model';

@Component({
  selector: 'app-result-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './result-list.component.html'
})
export class ResultListComponent implements OnInit {

  results: Result[] = [];
  loading = true;
  errorMessage = '';

  constructor(private resultService: ResultService, public auth: AuthService) {}

  ngOnInit(): void {
    // STUDENT sees only their own results; INSTRUCTOR/ADMIN see everyone's.
    const results$ = this.auth.hasRole('ROLE_STUDENT')
      ? this.resultService.getMyResults()
      : this.resultService.getAllResults();

    results$.subscribe({
      next: (data) => {
        this.results = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load results.';
        this.loading = false;
      }
    });
  }
}
