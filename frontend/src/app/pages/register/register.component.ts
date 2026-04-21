import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container animate-fade">
      <div class="glass-card auth-card">
        <h2 class="auth-title">Secure <span class="gradient-text">Account</span></h2>
        <p class="auth-subtitle">Join SmartSecure today and get premium protection.</p>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">Full Name</label>
              <input type="text" formControlName="name" class="form-control" placeholder="John Doe">
            </div>
            <div class="form-group half">
              <label class="form-label">Username</label>
              <input type="text" formControlName="username" class="form-control" placeholder="johndoe">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" formControlName="email" class="form-control" placeholder="john@example.com">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" formControlName="password" class="form-control" placeholder="••••••••">
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">Phone</label>
              <input type="text" formControlName="phone" class="form-control" placeholder="+1....">
            </div>
            <div class="form-group half">
              <label class="form-label">Role</label>
              <select formControlName="role" class="form-control">
                <option value="USER">Customer</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Address</label>
            <textarea formControlName="address" class="form-control" rows="2" placeholder="123 Smart St..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? 'Creating Account...' : 'Register Now' }}
          </button>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/login">Sign In</a>
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
      max-width: 550px;
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

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .half {
      flex: 1;
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
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      role: ['USER', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      console.log('--- REGISTRATION FLOW START ---');
      console.log('Payload:', this.registerForm.value);

      // Diagnostic Ping Test: Try to reach the gateway health endpoint directly
      fetch('http://localhost:8090/actuator/health')
        .then(res => console.log('PING TEST SUCCESS:', res.status))
        .catch(err => console.warn('PING TEST FAILED:', err));

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          console.log('Registration success');
          this.toastService.show('Account created successfully!', 'success');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Registration error:', err);
          
          let errorMsg = 'Registration failed.';
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error && typeof err.error === 'object') {
            // Check for validation errors map or message field
            errorMsg = err.error.message || Object.values(err.error)[0] || errorMsg;
          }
          
          this.toastService.show(errorMsg, 'error');
        }
      });
    }
  }
}
