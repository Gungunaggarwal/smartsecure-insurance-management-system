import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container animate-fade">
      <div class="glass-card auth-card">
        <h2 class="auth-title">Welcome <span class="gradient-text">Back</span></h2>
        <p class="auth-subtitle">Login to access your premium insurance portal.</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" formControlName="email" class="form-control" placeholder="john@example.com">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" formControlName="password" class="form-control" placeholder="••••••••">
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/register">Create Account</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 100px);
      padding: 2rem;
    }

    .auth-card {
      width: 100%;
      max-width: 450px;
    }

    .auth-title {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .auth-subtitle {
      color: var(--text-secondary);
      text-align: center;
      margin-bottom: 2rem;
    }

    .w-full {
      width: 100%;
      height: 3.5rem;
      margin-top: 1rem;
    }

    .auth-footer {
      margin-top: 2rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .auth-footer a {
      color: var(--accent-teal);
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.toastService.show('Logged in successfully!', 'success');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Login error:', err);
          
          let errorMsg = 'Login failed.';
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error && typeof err.error === 'object') {
            errorMsg = err.error.message || Object.values(err.error)[0] || errorMsg;
          }
          
          this.toastService.show(errorMsg, 'error');
        }
      });
    }
  }
}
