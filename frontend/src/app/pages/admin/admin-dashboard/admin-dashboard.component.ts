import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ClaimResponse } from '../../../models/claim.model';
import { PolicyRequest, PolicyResponse } from '../../../models/policy.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container animate-fade">
      <header class="admin-header">
        <h1>Admin <span class="gradient-text">Control Center</span></h1>
        <p>Live system overview and management.</p>
      </header>

      <!-- Dynamic Stats Row -->
      <div class="stats-grid">
        <div class="glass-card stat-card">
          <span class="stat-label">Total Claims</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
        <div class="glass-card stat-card highlight">
          <span class="stat-label">Pending Reviews</span>
          <span class="stat-value">{{ stats.pending }}</span>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-label">Active Policies</span>
          <span class="stat-value">{{ policies.length }}</span>
        </div>
      </div>

      <div class="admin-grid">
        <!-- Recent Claims Section -->
        <div class="glass-card section">
          <h3>Recent Claims for Review</h3>
          <div *ngIf="claims.length > 0; else noClaims" class="table-scroll">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let claim of claims">
                  <td>#{{ claim.id }}</td>
                  <td><span class="badge" [class]="claim.status.toLowerCase()">{{ claim.status }}</span></td>
                  <td>{{ claim.description }}</td>
                  <td>
                    <button class="btn-text" (click)="approve(claim.id)">Quick Approve</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #noClaims>
            <p class="empty-msg">No pending claims found.</p>
          </ng-template>
        </div>

        <!-- Policy Management Section -->
        <div class="glass-card section">
          <h3>Policy Management</h3>
          
          <div *ngIf="!showForm" class="policy-actions">
            <button class="btn btn-primary w-full" (click)="showForm = true">Add New Policy</button>
          </div>

          <div *ngIf="showForm" class="create-form animate-slide-up">
            <input [(ngModel)]="newPolicy.name" placeholder="Policy Name" class="form-input">
            <select [(ngModel)]="newPolicy.type" class="form-input">
              <option value="HEALTH">Health</option>
              <option value="LIFE">Life</option>
              <option value="VEHICLE">Vehicle</option>
              <option value="HOME">Home</option>
            </select>
            <input type="number" [(ngModel)]="newPolicy.basePremium" placeholder="Base Premium" class="form-input">
            <textarea [(ngModel)]="newPolicy.description" placeholder="Description..." class="form-input"></textarea>
            
            <div class="form-actions">
              <button class="btn btn-primary" (click)="submitPolicy()">Save</button>
              <button class="btn btn-text" (click)="showForm = false">Cancel</button>
            </div>
          </div>

          <div class="policy-list-mini" *ngIf="policies.length > 0">
            <h4>Existing Policies</h4>
            <div *ngFor="let p of policies" class="mini-policy-item">
              <span class="p-name">{{ p.name }}</span>
              <span class="p-type">{{ p.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .admin-header { margin-bottom: 3rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .stat-card { padding: 1.5rem; }
    .stat-card.highlight { border-color: var(--accent-violet); }
    .stat-value { display: block; font-size: 2.5rem; font-weight: 800; color: var(--accent-teal); margin-top: 0.5rem; }
    .admin-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
    .section { padding: 2rem; }
    .admin-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .admin-table th { text-align: left; padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .admin-table td { padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .badge { padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .badge.pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .btn-text { background: none; border: none; color: var(--accent-teal); cursor: pointer; font-weight: 600; }
    .create-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; margin-bottom: 2rem; }
    .form-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.75rem; border-radius: 0.5rem; width: 100%; }
    .form-actions { display: flex; gap: 1rem; align-items: center; }
    .w-full { width: 100%; }
    .empty-msg { color: var(--text-secondary); font-style: italic; }
    
    .policy-list-mini { margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; }
    .policy-list-mini h4 { margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; }
    .mini-policy-item { display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .p-type { color: var(--accent-teal); font-size: 0.75rem; font-weight: 700; }

    @media (max-width: 992px) { .admin-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any = { total: 0, pending: 0 };
  claims: ClaimResponse[] = [];
  policies: PolicyResponse[] = [];
  showForm = false;
  newPolicy: PolicyRequest = {
    name: '',
    description: '',
    basePremium: 0,
    type: 'HEALTH'
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getClaimsStats().subscribe(data => this.stats = data);
    this.adminService.getClaims().subscribe(data => this.claims = data);
    this.adminService.getPolicies().subscribe(data => this.policies = data);
  }

  approve(id: number) {
    this.adminService.reviewClaim(id, { status: 'APPROVED', comments: 'Quick approved by Admin' })
      .subscribe(() => {
        alert('Claim approved!');
        this.loadData();
      });
  }

  submitPolicy() {
    this.adminService.createPolicy(this.newPolicy).subscribe(() => {
      alert('Policy created successfully!');
      this.showForm = false;
      this.newPolicy = { name: '', description: '', basePremium: 0, type: 'HEALTH' };
      this.loadData();
    });
  }
}
