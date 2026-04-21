import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RegisterRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-page animate-fade">
      <header class="page-header">
        <h1>User <span class="gradient-text">Profile</span></h1>
        <p>View and manage your account information.</p>
      </header>

      <div class="profile-grid">
        <div class="glass-card profile-card">
          <div class="profile-avatar">
            {{ getInitials() }}
          </div>
          <h2 class="user-name">{{ authService.currentUser()?.name }}</h2>
          <span class="user-role badge">{{ authService.currentUser()?.role }}</span>
          
          <div class="profile-stats">
            <div class="stat">
              <span class="stat-lbl">Joined</span>
              <span class="stat-val">April 2026</span>
            </div>
            <div class="stat">
              <span class="stat-lbl">Status</span>
              <span class="stat-val text-success">Active</span>
            </div>
          </div>
        </div>

        <div class="glass-card edit-section">
          <h3>Edit Details</h3>
          <form [formGroup]="profileForm" (ngSubmit)="onUpdate()">
            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">Full Name</label>
                <input type="text" formControlName="name" class="form-control">
              </div>
              <div class="form-group half">
                <label class="form-label">Username</label>
                <input type="text" formControlName="username" class="form-control" readonly>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" formControlName="email" class="form-control">
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">Phone Number</label>
                <input type="text" formControlName="phone" class="form-control">
              </div>
              <div class="form-group half">
                <label class="form-label">Role</label>
                <input type="text" formControlName="role" class="form-control" readonly>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Address</label>
              <textarea formControlName="address" class="form-control" rows="3"></textarea>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || isLoading()">
              {{ isLoading() ? 'Saving Changes...' : 'Update Profile' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding: 1rem 0; }
    .page-header { margin-bottom: 3rem; }

    .profile-grid {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 2rem;
      align-items: flex-start;
    }

    .profile-card {
      padding: 3rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, var(--accent-teal), var(--accent-violet));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: 800;
      color: #000;
      box-shadow: 0 0 30px rgba(0, 212, 170, 0.3);
    }

    .user-name { font-size: 1.75rem; margin-bottom: 0.25rem; }
    .badge {
      background: rgba(124, 58, 237, 0.1);
      color: var(--accent-violet);
      padding: 0.35rem 1rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      border: 1px solid rgba(124, 58, 237, 0.2);
    }

    .profile-stats {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--glass-border);
    }

    .stat-lbl { color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
    .stat-val { display: block; font-weight: 600; margin-top: 0.25rem; }
    .text-success { color: var(--accent-teal); }

    .edit-section { padding: 2.5rem; }
    .edit-section h3 { margin-bottom: 2rem; font-size: 1.5rem; }

    .form-row { display: flex; gap: 1.5rem; margin-bottom: 1rem; }
    .half { flex: 1; }

    .form-control[readonly] {
      background: rgba(255, 255, 255, 0.02);
      color: var(--text-muted);
      cursor: not-allowed;
    }

    @media (max-width: 900px) {
      .profile-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private toastService: ToastService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      role: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      });
    }
  }

  getInitials() {
    const name = this.authService.currentUser()?.name || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  onUpdate() {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
      const user = this.authService.currentUser();
      if (!user) return;

      const request: RegisterRequest = {
        ...this.profileForm.getRawValue(),
        password: '' // Backend ignores password if blank usually, or we'd need a separate logic
      };

      this.authService.updateUser(user.username, request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastService.show('Profile updated successfully!', 'success');
        },
        error: () => {
          this.isLoading.set(false);
          this.toastService.show('Failed to update profile.', 'error');
        }
      });
    }
  }
}
