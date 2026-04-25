import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ClaimResponse, PolicyUpdateRequest } from '../../../models/claim.model';
import { PolicyResponse } from '../../../models/policy.model';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page animate-fade">
      <header class="page-header">
        <div class="header-content">
          <h1>Admin <span class="gradient-text">Command Center</span></h1>
          <p>Global oversight of policies, claims, and ecosystem health.</p>
        </div>
        <div class="header-actions">
           <button class="btn btn-secondary refresh-btn" (click)="loadData()" [disabled]="isLoading()">
            <i class="fas" [class.fa-sync-alt]="!isLoading()" [class.fa-spinner]="isLoading()" [class.fa-spin]="isLoading()"></i>
            {{ isLoading() ? 'Syncing...' : 'Sync System' }}
          </button>
        </div>
      </header>

      <!-- Stats Row -->
      <div class="stats-row" *ngIf="!isLoading()">
        <div class="stat-glass-card teal">
          <div class="stat-content">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">Total Claims</span>
          </div>
          <div class="stat-icon-box"><i class="fas fa-file-invoice"></i></div>
          <div class="stat-progress"><div class="bar" style="width: 100%"></div></div>
        </div>

        <div class="stat-glass-card orange">
          <div class="stat-content">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">Pending Review</span>
          </div>
          <div class="stat-icon-box"><i class="fas fa-clock"></i></div>
          <div class="stat-progress"><div class="bar" [style.width]="(stats.total > 0 ? (stats.pending / stats.total * 100) : 0) + '%'"></div></div>
        </div>

        <div class="stat-glass-card green">
          <div class="stat-content">
            <span class="stat-value">{{ stats.approved }}</span>
            <span class="stat-label">Approved Pay</span>
          </div>
          <div class="stat-icon-box"><i class="fas fa-check-circle"></i></div>
          <div class="stat-progress"><div class="bar" [style.width]="(stats.total > 0 ? (stats.approved / stats.total * 100) : 0) + '%'"></div></div>
        </div>

        <div class="stat-glass-card violet">
          <div class="stat-content">
            <span class="stat-value">{{ policies().length }}</span>
            <span class="stat-label">Active Policies</span>
          </div>
          <div class="stat-icon-box"><i class="fas fa-layer-group"></i></div>
          <div class="stat-progress"><div class="bar" style="width: 100%"></div></div>
        </div>
      </div>

      <!-- Skeletons -->
      <div class="stats-row" *ngIf="isLoading()">
        <div class="stat-glass-card skeleton" *ngFor="let i of [1,2,3,4]"></div>
      </div>

      <div class="main-layout">
        <!-- Main Panel: Claims -->
        <section class="claims-panel glass-card">
          <div class="panel-header">
            <div class="panel-title">
              <h3><i class="fas fa-clipboard-list"></i> Managed Claims</h3>
              <p>Review and adjudicate incoming insurance requests.</p>
            </div>
            <div class="filter-wrap">
               <div class="filter-item">
                 <i class="fas fa-filter"></i>
                 <select [(ngModel)]="claimFilter" (change)="applyFilter()" class="modern-select">
                    <option value="all">Global View</option>
                    <option value="PENDING">Pending Only</option>
                    <option value="APPROVED">Finalized: Approved</option>
                    <option value="REJECTED">Finalized: Rejected</option>
                 </select>
               </div>
            </div>
          </div>

          <div class="table-container">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>UUID</th>
                  <th>Requester</th>
                  <th>Policy ID</th>
                  <th>Overview</th>
                  <th>Status</th>
                  <th class="text-right">Operations</th>
                </tr>
              </thead>
              <tbody *ngIf="!isLoading()">
                <tr *ngFor="let claim of filteredClaims()" class="table-row" [class.new-item]="claim.status === 'PENDING'">
                  <td class="cell-id">#{{ claim.id }}</td>
                  <td class="cell-user">
                     <div class="user-chip">
                        <div class="user-initial">{{ claim.username?.[0] || 'U' }}</div>
                        <span>{{ claim.username || 'Anonymous' }}</span>
                     </div>
                  </td>
                  <td><span class="policy-tag">POL-{{ claim.policyId }}</span></td>
                  <td class="cell-desc"><span [title]="claim.description">{{ claim.description }}</span></td>
                  <td>
                    <span class="status-chip" [class]="claim.status.toLowerCase()">
                       <i class="fas" [class.fa-clock]="claim.status === 'PENDING'" 
                                    [class.fa-check]="claim.status === 'APPROVED'" 
                                    [class.fa-times]="claim.status === 'REJECTED'"></i>
                       {{ claim.status }}
                    </span>
                  </td>
                  <td class="cell-actions">
                      <div class="action-group" *ngIf="claim.status === 'PENDING'">
                        <button class="circle-btn approve" (click)="reviewClaim(claim.id, 'APPROVED')" title="Approve Claim">
                           <i class="fas fa-check"></i>
                        </button>
                        <button class="circle-btn reject" (click)="reviewClaim(claim.id, 'REJECTED')" title="Reject Claim">
                           <i class="fas fa-times"></i>
                        </button>
                     </div>
                     <div class="action-group" *ngIf="claim.status !== 'PENDING'">
                        <span class="processed-tag">
                           <i class="fas fa-check-double"></i> Processed
                        </span>
                        <button class="circle-btn delete-mini" (click)="deleteClaim(claim.id)" title="Delete Record">
                           <i class="fas fa-trash-alt"></i>
                        </button>
                     </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty / No Data -->
            <div class="empty-results" *ngIf="!isLoading() && filteredClaims().length === 0">
               <div class="empty-icon"><i class="fas fa-folder-open"></i></div>
               <h4>No Data Matches Criteria</h4>
               <p>Adjust your filters or sync system data to refresh the view.</p>
            </div>

            <!-- Sync Loading -->
            <div class="sync-loader" *ngIf="isLoading()">
               <div class="spinner-premium"></div>
               <span>Synchronizing with Cloud...</span>
            </div>
          </div>
        </section>

        <!-- Side Panel: Policies -->
        <aside class="sidebar-panel">
          <!-- Create Policy -->
          <div class="glass-card form-card">
            <div class="form-header" (click)="toggleForm()">
              <div class="title-box">
                <h4><i class="fas" [class.fa-plus-circle]="!editingPolicyId" [class.fa-edit]="editingPolicyId"></i> 
                   {{ editingPolicyId ? 'Update Policy' : 'Create Policy' }}
                </h4>
              </div>
              <i class="fas" [class.fa-chevron-up]="showForm" [class.fa-chevron-down]="!showForm"></i>
            </div>

            <div class="expand-form" *ngIf="showForm">
              <div class="form-group">
                <label>Policy Name</label>
                <input [(ngModel)]="newPolicy.name" class="modern-input" placeholder="e.g. Executive Life">
              </div>
              <div class="form-row">
                <div class="form-group half">
                  <label>Type</label>
                  <select [(ngModel)]="newPolicy.type" class="modern-input">
                    <option value="HEALTH">Health</option>
                    <option value="LIFE">Life</option>
                    <option value="VEHICLE">Vehicle</option>
                    <option value="HOME">Home</option>
                  </select>
                </div>
                <div class="form-group half">
                  <label>Premium (₹)</label>
                  <input type="number" [(ngModel)]="newPolicy.basePremium" class="modern-input">
                </div>
              </div>
              <div class="form-group">
                <label>Extended Description</label>
                <textarea [(ngModel)]="newPolicy.description" class="modern-input" rows="3"></textarea>
              </div>
              <button class="btn btn-primary btn-full" (click)="submitPolicy()" [disabled]="isSubmitting">
                <span *ngIf="!isSubmitting">
                   {{ editingPolicyId ? 'Update & Save' : 'Publish Policy' }} 
                   <i class="fas" [class.fa-upload]="!editingPolicyId" [class.fa-save]="editingPolicyId"></i>
                </span>
                <span *ngIf="isSubmitting"><i class="fas fa-spinner fa-spin"></i> Saving...</span>
              </button>
              <button *ngIf="editingPolicyId" class="btn btn-secondary btn-full" (click)="cancelEdit()" style="margin-top: 0.5rem;">
                Cancel
              </button>
            </div>
          </div>

          <!-- Active Policies List -->
          <div class="glass-card side-list-card">
            <div class="list-header">
              <h4><i class="fas fa-layer-group"></i> Active Policies</h4>
              <span class="count-chip">{{ policies().length }}</span>
            </div>
            
            <div class="mini-list">
              <div *ngFor="let p of policies()" class="mini-policy-item" [class]="'border-' + p.type.toLowerCase()">
                <div class="m-icon">
                  <span class="m-id-tag">#{{ p.id }}</span>
                </div>
                <div class="m-info">
                  <span class="m-name">{{ p.name }}</span>
                  <span class="m-price">₹{{ p.basePremium }}/yr</span>
                </div>
                <div class="m-actions">
                   <button class="m-action-btn edit" (click)="editPolicy(p)" title="Edit"><i class="fas fa-edit"></i></button>
                   <button class="m-action-btn delete" (click)="deletePolicy(p.id)" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,

  styles: [`
    .admin-page {
      padding: 1.5rem 0 3rem;
      max-width: 1440px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2.5rem;
    }
    .header-content h1 { font-size: 2.8rem; margin-bottom: 0.5rem; }
    .header-content p { color: var(--text-secondary); font-size: 1rem; }
    .refresh-btn { padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; font-weight: 700; }

    /* Stats Cards */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .stat-glass-card {
      position: relative;
      padding: 1.75rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      transition: var(--transition-bounce);
    }
    .stat-glass-card:hover { transform: translateY(-8px); border-color: rgba(255, 255, 255, 0.1); }

    .stat-content { display: flex; flex-direction: column; gap: 0.25rem; z-index: 2; }
    .stat-value { font-size: 2.5rem; font-weight: 800; font-family: var(--header-font); line-height: 1; }
    .stat-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }

    .stat-icon-box {
      width: 54px; height: 54px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; z-index: 1;
    }
    
    .stat-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.05); }
    .stat-progress .bar { height: 100%; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }

    .teal .stat-value { color: var(--accent-teal); }
    .teal .stat-icon-box { background: rgba(0, 212, 170, 0.1); color: var(--accent-teal); }
    .teal .bar { background: var(--accent-teal); box-shadow: 0 0 10px var(--accent-teal); }

    .orange .stat-value { color: var(--accent-orange); }
    .orange .stat-icon-box { background: rgba(255, 171, 0, 0.1); color: var(--accent-orange); }
    .orange .bar { background: var(--accent-orange); box-shadow: 0 0 10px var(--accent-orange); }

    .green .stat-value { color: var(--accent-green); }
    .green .stat-icon-box { background: rgba(34, 197, 94, 0.1); color: var(--accent-green); }
    .green .bar { background: var(--accent-green); box-shadow: 0 0 10px var(--accent-green); }

    .violet .stat-value { color: var(--accent-violet); }
    .violet .stat-icon-box { background: rgba(124, 58, 237, 0.1); color: var(--accent-violet); }
    .violet .bar { background: var(--accent-violet); box-shadow: 0 0 10px var(--accent-violet); }

    /* Layout */
    .main-layout { display: grid; grid-template-columns: 1fr 360px; gap: 2rem; align-items: start; }

    .claims-panel { padding: 2rem; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .panel-title h3 { font-size: 1.4rem; margin-bottom: 0.25rem; }
    .panel-title p { color: var(--text-secondary); font-size: 0.9rem; }

    .modern-select {
      background: #1a202c; border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-primary); padding: 0.6rem 1rem; border-radius: 10px; cursor: pointer;
      font-size: 0.85rem; font-weight: 600; color-scheme: dark;
    }
    .modern-select option { background: #1a202c; color: var(--text-primary); }
    .filter-item { display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); font-size: 0.9rem; }

    /* Premium Table */
    .table-container { overflow-x: auto; width: 100%; position: relative; }
    .premium-table { width: 100%; border-collapse: collapse; text-align: left; }
    .premium-table th { padding: 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .premium-table td { padding: 1.25rem 1rem; vertical-align: middle; border-bottom: 1px solid rgba(255,255,255,0.03); }

    .table-row { transition: var(--transition); }
    .table-row:hover { background: rgba(255,255,255,0.025); }
    .new-item { background: rgba(0, 212, 170, 0.015); }

    .cell-id { font-family: monospace; font-weight: 700; color: var(--accent-teal); font-size: 0.9rem; }
    .cell-user { min-width: 150px; }
    .user-chip { display: flex; align-items: center; gap: 0.75rem; }
    .user-initial { 
      width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); 
      display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;
    }
    .policy-tag { font-size: 0.75rem; font-weight: 700; color: var(--accent-violet); background: rgba(124, 58, 237, 0.1); padding: 0.2rem 0.5rem; border-radius: 4px; }
    .cell-desc { max-width: 200px; color: var(--text-secondary); font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .status-chip { 
      padding: 0.4rem 0.8rem; border-radius: 30px; font-size: 0.7rem; font-weight: 800; 
      text-transform: uppercase; letter-spacing: 0.04em; display: inline-flex; align-items: center; gap: 0.4rem;
    }
    .status-chip.pending { background: var(--accent-orange-dim); color: var(--accent-orange); border: 1px solid rgba(255,171,0,0.2); }
    .status-chip.approved { background: var(--accent-green-dim); color: var(--accent-green); border: 1px solid rgba(34,197,94,0.2); }
    .status-chip.rejected { background: rgba(255,68,68,0.1); color: var(--accent-red); border: 1px solid rgba(255,68,68,0.2); }

    .action-group { display: flex; gap: 0.5rem; }
    .circle-btn {
      width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: var(--transition);
    }
    .circle-btn.approve { background: rgba(34, 197, 94, 0.1); color: var(--accent-green); }
    .circle-btn.approve:hover { background: var(--accent-green); color: white; transform: rotate(15deg); }
    .circle-btn.reject { background: rgba(255, 68, 68, 0.1); color: var(--accent-red); }
    .circle-btn.reject:hover { background: var(--accent-red); color: white; transform: rotate(-15deg); }
    .circle-btn.delete-mini { background: rgba(255, 68, 68, 0.05); color: var(--accent-red); margin-left: 0.5rem; }
    .circle-btn.delete-mini:hover { background: var(--accent-red); color: white; }
    
    .processed-tag { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
    .text-right { text-align: right; }

    /* Sidebar Panels */
    .sidebar-panel { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-card { padding: 1.5rem; }
    .form-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
    .form-header h4 { font-size: 1.1rem; }
    
    .expand-form { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
    .modern-input {
      width: 100%; background: #1a202c; border: 1px solid rgba(255,255,255,0.08);
      color: var(--text-primary); padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.9rem;
      color-scheme: dark;
    }
    .modern-input option { background: #1a202c; color: var(--text-primary); }
    .modern-input:focus { outline: none; border-color: var(--accent-teal); box-shadow: 0 0 0 3px rgba(0,212,170,0.1); }
    .form-row { display: flex; gap: 1rem; }
    .half { flex: 1; }
    .btn-full { width: 100%; padding: 1rem; font-weight: 700; margin-top: 0.5rem; }

    .side-list-card { padding: 1.5rem; }
    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .count-chip { background: rgba(255,255,255,0.05); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 800; }
    
    .mini-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 480px; overflow-y: auto; }
    .mini-policy-item {
      display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: rgba(255,255,255,0.03);
      border-radius: 12px; border-left: 3px solid transparent; transition: var(--transition);
    }
    .mini-policy-item:hover { background: rgba(255,255,255,0.06); transform: translateX(4px); }
    .border-health { border-left-color: var(--accent-green); }
    .border-life { border-left-color: var(--accent-red); }
    .border-vehicle { border-left-color: var(--accent-blue); }
    .border-home { border-left-color: var(--accent-violet); }

    .m-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: var(--accent-teal); }
    .m-id-tag { font-family: monospace; font-weight: 800; font-size: 0.7rem; opacity: 0.8; }
    .m-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
    .m-name { font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .m-price { font-size: 0.75rem; color: var(--accent-teal); font-weight: 600; }
    
    .m-actions { display: flex; gap: 0.25rem; }
    .m-action-btn { 
      width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(255,255,255,0.05);
      color: var(--text-muted); cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; font-size: 0.75rem;
    }
    .m-action-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }
    .m-action-btn.edit:hover { color: var(--accent-teal); }
    .m-action-btn.delete:hover { color: var(--accent-red); }

    /* States */
    .empty-results { text-align: center; padding: 4rem 2rem; }
    .empty-icon { font-size: 3rem; opacity: 0.1; margin-bottom: 1rem; }
    .sync-loader { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: var(--text-secondary); font-size: 0.9rem; }
    .spinner-premium { width: 40px; height: 40px; border: 3px solid rgba(0,212,170,0.1); border-top-color: var(--accent-teal); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1200px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .main-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .page-header { flex-direction: column; gap: 1.5rem; }
      .stats-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any = { total: 0, pending: 0, approved: 0, rejected: 0 };
  claims = signal<ClaimResponse[]>([]);
  filteredClaims = signal<ClaimResponse[]>([]);
  policies = signal<PolicyResponse[]>([]);
  isLoading = signal<boolean>(true);
  isSubmitting = false;
  showForm = false;
  claimFilter = 'all';
  editingPolicyId: number | null = null;
  toastMessage = '';
  toastType = 'success';

  newPolicy: PolicyUpdateRequest = {
    name: '',
    description: '',
    basePremium: 0,
    type: 'HEALTH'
  };

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    // Load claims and policies in parallel
    forkJoin({
      claims: this.adminService.getClaims(),
      policies: this.adminService.getPolicies(),
      stats: this.adminService.getClaimsStats()
    }).subscribe({
      next: ({ claims, policies, stats }) => {
        this.claims.set(claims);
        this.policies.set(policies);
        this.applyFilter();

        // Compute stats from claims directly to ensure they are accurate and non-zero
        const pendingCount = claims.filter(c => c.status === 'PENDING').length;
        const approvedCount = claims.filter(c => c.status === 'APPROVED').length;
        const rejectedCount = claims.filter(c => c.status === 'REJECTED').length;

        // Backend stats might be lagging or have different key format
        const normalize = (obj: any) => {
          const result: any = {};
          if (!obj) return result;
          Object.keys(obj).forEach(k => result[k.toLowerCase()] = obj[k]);
          return result;
        };
        const normalized = normalize(stats);

        this.stats = {
          total: claims.length,
          pending: normalized['pending'] ?? pendingCount,
          approved: normalized['approved'] ?? approvedCount,
          rejected: normalized['rejected'] ?? rejectedCount
        };

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load admin data:', err);
        // Try loading individually as fallback
        this.loadFallback();
      }
    });
  }

  private loadFallback() {
    this.adminService.getClaims().subscribe({
      next: (claims) => {
        this.claims.set(claims);
        this.applyFilter();
        this.stats = {
          total: claims.length,
          pending: claims.filter(c => c.status === 'PENDING').length,
          approved: claims.filter(c => c.status === 'APPROVED').length,
          rejected: claims.filter(c => c.status === 'REJECTED').length
        };
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    this.adminService.getPolicies().subscribe({
      next: (data) => this.policies.set(data),
      error: () => {}
    });
  }

  applyFilter() {
    if (this.claimFilter === 'all') {
      this.filteredClaims.set(this.claims());
    } else {
      this.filteredClaims.set(this.claims().filter(c => c.status === this.claimFilter));
    }
  }

  reviewClaim(id: number, status: 'APPROVED' | 'REJECTED') {
    this.adminService.reviewClaim(id, {
      status,
      comments: status === 'APPROVED' ? 'Approved by Admin' : 'Rejected by Admin'
    }).subscribe({
      next: () => {
        this.toastService.show(`Claim #${id} ${status.toLowerCase()} successfully!`, 'success');
        this.loadData();
      },
      error: (err) => {
        this.toastService.show('Action failed. Please try again.', 'error');
        console.error(err);
      }
    });
  }

  deleteClaim(id: number) {
    if (!confirm('Are you sure you want to delete this claim record?')) return;
    this.adminService.deleteClaim(id).subscribe({
      next: () => {
        this.toastService.show(`Claim #${id} removed.`, 'success');
        this.loadData();
      },
      error: () => this.toastService.show('Failed to delete claim.', 'error')
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm && this.editingPolicyId) {
      this.cancelEdit();
    }
  }

  editPolicy(policy: PolicyResponse) {
    this.editingPolicyId = policy.id;
    this.newPolicy = {
      name: policy.name,
      description: policy.description,
      basePremium: policy.basePremium,
      type: policy.type
    };
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingPolicyId = null;
    this.newPolicy = { name: '', description: '', basePremium: 0, type: 'HEALTH' };
    this.showForm = false;
  }

  deletePolicy(id: number) {
    if (!confirm('Are you sure you want to delete this policy? All associated user data might be affected.')) return;
    this.adminService.deletePolicy(id).subscribe({
      next: () => {
        this.toastService.show('Policy deleted successfully.', 'success');
        this.loadData();
      },
      error: () => this.toastService.show('Failed to delete policy. It might be in use.', 'error')
    });
  }

  submitPolicy() {
    if (!this.newPolicy.name?.trim() || this.newPolicy.basePremium <= 0) {
      this.toastService.show('Please provide valid policy details.', 'error');
      return;
    }

    this.isSubmitting = true;
    const request = this.editingPolicyId 
      ? this.adminService.updatePolicy(this.editingPolicyId, this.newPolicy)
      : this.adminService.createPolicy(this.newPolicy);

    request.subscribe({
      next: () => {
        this.toastService.show(
          this.editingPolicyId ? 'Policy updated successfully!' : 'New policy published!', 
          'success'
        );
        this.isSubmitting = false;
        this.cancelEdit();
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.show('Operation failed. Please check inputs.', 'error');
      }
    });
  }

  getTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'health': return 'fas fa-heartbeat';
      case 'life': return 'fas fa-heart';
      case 'vehicle': return 'fas fa-car';
      case 'home': return 'fas fa-home';
      default: return 'fas fa-shield-alt';
    }
  }
}
