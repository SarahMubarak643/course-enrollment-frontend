import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mt-5 text-center">
      <h2>Access Denied</h2>
      <p class="text-muted">You do not have permission to view this page.</p>
      <a routerLink="/dashboard" class="btn btn-primary">Back to Dashboard</a>
    </div>
  `
})
export class AccessDeniedComponent {}
