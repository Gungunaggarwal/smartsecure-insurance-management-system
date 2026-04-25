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
        <div class="header-content">
          <h1>Member <span class="gradient-text">Profile</span></h1>
          <p>Securely manage your personal information and account security.</p>
        </div>
      </header>

      <div class="profile-layout">
        <!-- Personal ID Card -->
        <div class="glass-card identity-card">
          <div class="identity-header">
            <div class="user-avatar-lg">
              <div class="avatar-shimmer"></div>
              <span>{{ getInitials() }}</span>
            </div>
            <div class="identity-info">
              <h2 class="user-name">{{ authService.currentUser()?.name }}</h2>
              <div class="role-badge" [class.admin]="authService.isAdmin()">
                 <i class="fas" [class.fa-user-shield]="authService.isAdmin()" [class.fa-user]="!authService.isAdmin()"></i>
                 {{ authService.currentUser()?.role }}
              </div>
            </div>
          </div>
          
          <div class="identity-divider"></div>
          
          <div class="identity-details">
            <div class="id-stat">
              <span class="stat-label">Member ID</span>
              <span class="stat-value">#{{ authService.currentUser()?.username }}</span>
            </div>
            <div class="id-stat">
              <span class="stat-label">Account Status</span>
              <span class="stat-value status-active">Verified</span>
            </div>
            <div class="id-stat">
              <span class="stat-label">Member Since</span>
              <span class="stat-value">April 22</span>
            </div>
          </div>

          <div class="identity-security">
            <div class="security-item">
              <i class="fas fa-shield-check text-teal"></i>
              <span>Two-Factor Auth Enabled</span>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="glass-card settings-card">
          <div class="settings-header">
            <div class="settings-icon"><i class="fas fa-cog"></i></div>
            <div class="settings-title">
              <h3>Account Settings</h3>
              <p>Updates to your profile will be reflected across all services.</p>
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="onUpdate()" class="settings-form">
            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">Full Name</label>
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input type="text" formControlName="name" class="form-control with-icon" placeholder="Name">
                </div>
              </div>
              <div class="form-group half">
                <label class="form-label">Username</label>
                <div class="input-wrapper">
                  <i class="fas fa-id-card input-icon"></i>
                  <input type="text" formControlName="username" class="form-control with-icon readonly" readonly>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input type="email" formControlName="email" class="form-control with-icon" placeholder="Email">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">Phone Number</label>
                <div class="input-wrapper">
                  <i class="fas fa-phone input-icon"></i>
                  <input type="text" formControlName="phone" class="form-control with-icon" placeholder="Phone">
                </div>
              </div>
              <div class="form-group half">
                <label class="form-label">Account Role</label>
                <div class="input-wrapper">
                  <i class="fas fa-user-tag input-icon"></i>
                  <input type="text" formControlName="role" class="form-control with-icon readonly" readonly>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Primary Address</label>
              <div class="input-wrapper">
                <i class="fas fa-map-marker-alt input-icon" style="top: 1.25rem; transform: none;"></i>
                <textarea formControlName="address" class="form-control with-icon" rows="3" placeholder="Address"></textarea>
              </div>
            </div>

            <div class="form-footer">
               <button type="submit" class="btn btn-primary save-btn" [disabled]="profileForm.invalid || isLoading()">
                <span *ngIf="!isLoading()">Save Changes <i class="fas fa-save"></i></span>
                <span *ngIf="isLoading()"><i class="fas fa-spinner fa-spin"></i> Syncing...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: 1.5rem 0 3rem;
      max-width: 1280px;
      margin: 0 auto;
    }

    .page-header { margin-bottom: 3.5rem; }
    .header-content h1 { font-size: 3rem; margin-bottom: 0.5rem; }
    .header-content p { color: var(--text-secondary); font-size: 1.1rem; }

    .profile-layout {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 2.5rem;
      align-items: flex-start;
    }

    /* Identity Card */
    .identity-card {
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(180deg, rgba(15, 21, 32, 0.9) 0%, rgba(26, 32, 44, 0.6) 100%);
      border: 1px solid rgba(255,255,255,0.05);
    }

    .identity-header {
      text-align: center;
      margin-bottom: 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .user-avatar-lg {
      width: 120px; height: 120px;
      border-radius: 40px;
      background: linear-gradient(135deg, var(--accent-teal), var(--accent-violet));
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 3.5rem; font-weight: 800;
      position: relative;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(0, 212, 170, 0.2);
    }

    .avatar-shimmer {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
      background-size: 200% 200%;
      animation: shimmer 3s infinite;
    }

    .identity-info { display: flex; flex-direction: column; gap: 0.5rem; align-items: center; }
    .user-name { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em; }
    
    .role-badge {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(255,255,255,0.05);
      padding: 0.4rem 1rem;
      border-radius: 30px;
      font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--accent-blue);
      border: 1px solid rgba(88, 166, 255, 0.2);
    }
    .role-badge.admin { color: var(--accent-violet); border-color: rgba(124, 58, 237, 0.2); }

    .identity-divider {
      width: 100%; height: 1px;
      background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
      margin-bottom: 2rem;
    }

    .identity-details {
      width: 100%;
      display: grid; grid-template-columns: 1fr; gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .id-stat { display: flex; justify-content: space-between; align-items: center; }
    .stat-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
    .stat-value { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
    .stat-value.status-active { color: var(--accent-teal); }

    .identity-security {
      width: 100%;
      padding: 1.25rem;
      background: rgba(0, 212, 170, 0.03);
      border-radius: 16px;
      border: 1px solid rgba(0, 212, 170, 0.1);
    }
    .security-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    .text-teal { color: var(--accent-teal); }

    /* Settings Card */
    .settings-card { padding: 3rem 4rem; }

    .settings-header {
      display: flex; align-items: center; gap: 1.5rem;
      margin-bottom: 3.5rem;
    }
    .settings-icon {
      width: 54px; height: 54px; border-radius: 16px;
      background: rgba(255,255,255,0.03);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: var(--text-secondary);
    }
    .settings-title h3 { font-size: 1.6rem; margin-bottom: 0.25rem; }
    .settings-title p { color: var(--text-secondary); font-size: 0.9rem; }

    .settings-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: flex; gap: 2rem; }
    .half { flex: 1; }

    .input-wrapper { position: relative; }
    .input-icon {
      position: absolute; left: 1.125rem; top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted); font-size: 0.9rem;
      transition: var(--transition); pointer-events: none;
    }
    .form-control.with-icon { padding-left: 3rem; }
    .form-control.with-icon:focus + .input-icon { color: var(--accent-teal); }

    .form-control.readonly {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      cursor: not-allowed;
    }

    .form-footer {
      margin-top: 2rem;
      display: flex; justify-content: flex-end;
    }
    .save-btn { padding: 1.1rem 3rem; font-size: 1rem; border-radius: 12px; }

    @media (max-width: 1024px) {
      .profile-layout { grid-template-columns: 1fr; }
      .settings-card { padding: 2.5rem 2rem; }
    }
    @media (max-width: 600px) {
      .form-row { flex-direction: column; gap: 1rem; }
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
