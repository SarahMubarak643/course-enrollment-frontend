import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mt-5 text-center">
      <h2>404 — Page Not Found</h2>
      <p class="text-muted">The page you're looking for doesn't exist.</p>
      <a routerLink="/dashboard" class="btn btn-primary">Back to Dashboard</a>
    </div>
  `
})
export class PageNotFoundComponent {}
