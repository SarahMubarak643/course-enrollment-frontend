import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ApiError } from '../../models/api-error.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  private fb = inject(FormBuilder);

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  submitting = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const { username, password } = this.form.getRawValue();

    this.auth.login(username ?? '', password ?? '').subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const body = err.error as ApiError | undefined;
        this.errorMessage = body?.error ?? 'Login failed. Please try again.';
      }
    });
  }
}
