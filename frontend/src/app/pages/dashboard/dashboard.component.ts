import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClaimsService } from '../../core/services/claims.service';
import { PolicyService } from '../../core/services/policy.service';
import { ClaimResponse } from '../../models/claim.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container animate-fade">
      <header class="dashboard-header">
        <h1>Dashboard <span class="gradient-text">Overview</span></h1>
        <p>Manage your protection and track your claims efficiently.</p>
      </header>

      <div class="stats-grid">
        <div class="glass-card stat-card">
          <div class="stat-icon info"><i class="fas fa-shield-alt"></i></div>
          <div class="stat-details">
            <span class="stat-label">Active Policies</span>
            <span class="stat-value">{{ activePoliciesCount() }}</span>
          </div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-icon warn"><i class="fas fa-file-invoice"></i></div>
          <div class="stat-details">
            <span class="stat-label">My Claims</span>
            <span class="stat-value">{{ myClaimsCount() }}</span>
          </div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-icon success"><i class="fas fa-user-check"></i></div>
          <div class="stat-details">
            <span class="stat-label">Account Status</span>
            <span class="stat-value text-success">Verified</span>
          </div>
        </div>
      </div>
      
      <div class="dashboard-main-grid">
        <div class="glass-card main-section">
          <div class="section-header">
            <h3>Recent Claims</h3>
            <a routerLink="/dashboard/claims" class="view-all">View All</a>
          </div>
          
          <div class="claims-list" *ngIf="recentClaims().length > 0; else noClaims">
            <div *ngFor="let claim of recentClaims()" class="claim-item">
              <div class="claim-info">
                <span class="claim-id">#{{ claim.id }}</span>
                <span class="claim-desc">{{ claim.description }}</span>
              </div>
              <div class="claim-status" [class]="claim.status.toLowerCase()">{{ claim.status }}</div>
            </div>
          </div>
          
          <ng-template #noClaims>
            <div class="empty-state">
              <i class="fas fa-folder-open"></i>
              <p>No claims found. Looking to file a new one?</p>
              <button routerLink="/dashboard/claims/new" class="btn btn-secondary btn-sm">File Claim</button>
            </div>
          </ng-template>
        </div>

        <div class="glass-card quick-links">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button routerLink="/dashboard/policies" class="action-btn">
              <i class="fas fa-search"></i>
              <span>Browse Policies</span>
            </button>
            <button routerLink="/dashboard/claims/new" class="action-btn">
              <i class="fas fa-plus-circle"></i>
              <span>Initiate Claim</span>
            </button>
            <button routerLink="/dashboard/profile" class="action-btn">
              <i class="fas fa-user-edit"></i>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 1rem 0; }
    .dashboard-header { margin-bottom: 2.5rem; }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .stat-card {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .stat-icon.info { background: rgba(88, 166, 255, 0.1); color: var(--accent-blue); }
    .stat-icon.warn { background: rgba(124, 58, 237, 0.1); color: var(--accent-violet); }
    .stat-icon.success { background: rgba(0, 212, 170, 0.1); color: var(--accent-teal); }

    .stat-details { display: flex; flex-direction: column; }
    .stat-label { color: var(--text-secondary); font-size: 0.85rem; font-weight: 500; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
    .text-success { color: var(--accent-teal); }

    .dashboard-main-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .main-section { padding: 2rem; min-height: 400px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .view-all { color: var(--accent-teal); text-decoration: none; font-size: 0.85rem; font-weight: 600; }

    .claims-list { display: flex; flex-direction: column; gap: 1rem; }
    .claim-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      border: 1px solid var(--glass-border);
    }

    .claim-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .claim-id { font-size: 0.75rem; color: var(--accent-teal); font-weight: 700; }
    .claim-desc { font-size: 0.95rem; color: var(--text-primary); }

    .claim-status {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      text-transform: uppercase;
    }
    .claim-status.pending { background: rgba(255, 171, 0, 0.1); color: #ffab00; border: 1px solid rgba(255,171,0,0.2); }
    .claim-status.approved { background: rgba(0, 212, 170, 0.1); color: var(--accent-teal); border: 1px solid rgba(0,212,170,0.2); }
    .claim-status.rejected { background: rgba(255, 68, 68, 0.1); color: #ff4444; border: 1px solid rgba(255,68,68,0.2); }

    .quick-links { padding: 2rem; }
    .action-buttons { display: flex; flex-direction: column; gap: 1rem; }
    .action-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--bg-secondary);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      cursor: pointer;
      color: var(--text-primary);
      transition: var(--transition);
      text-align: left;
    }
    .action-btn:hover { border-color: var(--accent-teal); background: rgba(0,212,170,0.05); transform: translateX(5px); }
    .action-btn i { font-size: 1.1rem; color: var(--accent-teal); }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
      text-align: center;
    }
    .empty-state i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
    .empty-state p { margin-bottom: 1.5rem; }

    @media (max-width: 1024px) {
      .dashboard-main-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  activePoliciesCount = signal<number>(0);
  myClaimsCount = signal<number>(0);
  recentClaims = signal<ClaimResponse[]>([]);

  constructor(
    public authService: AuthService,
    private claimsService: ClaimsService,
    private policyService: PolicyService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.currentUser();
    if (user && user.username) {
      // Load user claims
      this.claimsService.getUserClaims(user.username).subscribe({
        next: (claims) => {
          this.recentClaims.set(claims.slice(0, 5));
          this.myClaimsCount.set(claims.length);
        }
      });
      
      // Load policy total (for now we use the general count as we don't have user-policy table)
      this.policyService.countPolicies().subscribe({
        next: (count) => this.activePoliciesCount.set(count)
      });
    }
  }
}
