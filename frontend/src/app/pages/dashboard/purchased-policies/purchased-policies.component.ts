import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyService } from '../../../core/services/policy.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { PolicyResponse } from '../../../models/policy.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-purchased-policies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="my-policies-page animate-fade">
      <header class="page-header">
        <div class="header-content">
          <h1>My <span class="gradient-text">Protections</span></h1>
          <p>Managed view of your active insurance certificates and protection plans.</p>
        </div>
      </header>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="policy-grid skeleton-grid">
        <div *ngFor="let i of [1,2,3]" class="skeleton-card"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && policies().length === 0" class="state-container empty-state glass-card">
        <div class="state-icon"><i class="fas fa-folder-open"></i></div>
        <h3>No Policies Found</h3>
        <p>You haven't purchased any insurance plans yet. Browse our premium policies to get started.</p>
        <button class="btn btn-primary" routerLink="/dashboard/policies">Browse Policies</button>
      </div>

      <!-- Policy Grid -->
      <div class="policy-grid" *ngIf="!isLoading() && policies().length > 0">
        <div *ngFor="let policy of policies(); let i = index" 
             class="glass-card policy-card active-plan"
             [class]="'theme-' + policy.type.toLowerCase()"
             [style.animation-delay]="i * 100 + 'ms'">
             
          <div class="card-glow"></div>
          
          <div class="policy-header">
            <div class="policy-id-chip">#{{ policy.id }}</div>
            <div class="status-badge"><i class="fas fa-check-circle"></i> Active</div>
          </div>
          
          <div class="policy-body">
            <h3>{{ policy.name }}</h3>
            <p class="description">{{ policy.description || 'Comprehensive coverage for your needs.' }}</p>
            
            <div class="plan-details">
              <div class="detail-item">
                <span class="label">Policy Type</span>
                <span class="value">{{ policy.type }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Premium Basis</span>
                <span class="value">₹{{ policy.basePremium }}</span>
              </div>
            </div>
          </div>
          
          <div class="policy-footer">
            <button class="btn btn-secondary btn-sm" [routerLink]="['/dashboard/claims/new']" [queryParams]="{policyId: policy.id}">
              <i class="fas fa-file-medical"></i> File Claim
            </button>
            <button class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-policies-page {
      padding: 1.5rem 0 3rem;
      max-width: 1300px;
      margin: 0 auto;
    }

    .page-header { margin-bottom: 3rem; }
    .header-content h1 { font-size: 3rem; margin-bottom: 0.75rem; }
    .header-content p { color: var(--text-secondary); font-size: 1.1rem; }

    .policy-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2rem;
    }

    .policy-card {
      padding: 2.5rem;
      border: 1px solid rgba(255,255,255,0.05);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card-glow {
      position: absolute;
      top: 0; left: 0; right: 0; height: 4px;
      opacity: 0.8;
    }

    .theme-health .card-glow { background: var(--accent-green); }
    .theme-life .card-glow { background: var(--accent-red); }
    .theme-vehicle .card-glow { background: var(--accent-blue); }
    .theme-home .card-glow { background: var(--accent-violet); }

    .policy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--accent-green);
      background: rgba(34, 197, 94, 0.1);
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .policy-id-chip {
      font-family: monospace; font-weight: 800; font-size: 0.85rem; color: var(--accent-teal);
      background: rgba(0, 212, 170, 0.1); padding: 0.35rem 0.75rem; border-radius: 8px;
    }

    .policy-body { flex: 1; }
    .policy-body h3 { font-size: 1.6rem; margin-bottom: 0.75rem; }
    .description { color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 2rem; line-height: 1.6; }

    .plan-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: rgba(255,255,255,0.03);
      padding: 1.25rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-item .label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
    .detail-item .value { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }

    .policy-footer {
      display: flex;
      gap: 1rem;
      margin-top: auto;
    }

    .btn-sm { flex: 1; height: 2.8rem; font-size: 0.85rem; }

    .state-container {
      text-align: center;
      padding: 5rem 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .state-icon { font-size: 4rem; opacity: 0.1; margin-bottom: 1.5rem; }

    .skeleton-card {
      height: 400px;
      background: rgba(255,255,255,0.02);
      border-radius: 20px;
      animation: shimmer 1.5s infinite;
    }
  `]
})
export class PurchasedPoliciesComponent implements OnInit {
  policies = signal<PolicyResponse[]>([]);
  isLoading = signal<boolean>(true);

  constructor(
    private policyService: PolicyService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadMyPolicies();
  }

  loadMyPolicies() {
    const user = this.authService.currentUser();
    if (user && user.username) {
      this.isLoading.set(true);
      this.policyService.getPurchasedPolicies(user.username).subscribe({
        next: (data) => {
          this.policies.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load your policies:', err);
          this.isLoading.set(false);
          this.toastService.show('Failed to load your policies.', 'error');
        }
      });
    }
  }
}
