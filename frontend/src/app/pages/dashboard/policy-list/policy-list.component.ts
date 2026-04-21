import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyService } from '../../../core/services/policy.service';
import { PolicyResponse } from '../../../models/policy.model';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="policy-container animate-fade">
      <header class="section-header">
        <h2>Available <span class="gradient-text">Policies</span></h2>
        <p>Choose the best protection for your needs.</p>
      </header>

      <div *ngIf="isLoading" class="loader">Loading policies...</div>

      <div class="policy-grid" *ngIf="!isLoading">
        <div *ngFor="let policy of policies()" class="glass-card policy-card">
          <div class="policy-type">{{ policy.type }}</div>
          <h3>{{ policy.name }}</h3>
          <p class="description">{{ policy.description }}</p>
          <div class="price-row">
            <span class="label">Starting from</span>
            <span class="price">\${{ policy.basePremium }}</span>
          </div>
          <button (click)="purchasePolicy(policy)" class="btn btn-primary w-full" [disabled]="isPurchasing === policy.id">
            {{ isPurchasing === policy.id ? 'Processing...' : 'Purchase Policy' }}
          </button>
        </div>
      </div>

      <div *ngIf="!isLoading && policies().length === 0" class="empty-state">
        No policies available at the moment.
      </div>
    </div>
  `,
  styles: [`
    .policy-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .section-header {
      margin-bottom: 3rem;
    }

    .policy-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .policy-card {
      display: flex;
      flex-direction: column;
      padding: 2rem;
    }

    .policy-type {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--accent-violet);
      margin-bottom: 0.5rem;
    }

    .policy-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .description {
      color: var(--text-secondary);
      flex-grow: 1;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--glass-border);
    }

    .price {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--accent-teal);
    }

    .w-full { width: 100%; }

    .empty-state, .loader {
      text-align: center;
      padding: 4rem;
      color: var(--text-secondary);
    }
  `]
})
export class PolicyListComponent implements OnInit {
  policies = signal<PolicyResponse[]>([]);
  isLoading = true;
  isPurchasing: number | null = null;

  constructor(private policyService: PolicyService) {}

  ngOnInit() {
    this.loadPolicies();
  }

  loadPolicies() {
    this.policyService.getPolicies().subscribe({
      next: (data) => {
        this.policies.set(data);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  purchasePolicy(policy: PolicyResponse) {
    this.isPurchasing = policy.id;
    this.policyService.purchasePolicy(policy.id).subscribe({
      next: (res) => {
        alert('Policy purchased successfully!');
        this.isPurchasing = null;
      },
      error: (err) => {
        alert('Purchase failed. Please try again.');
        this.isPurchasing = null;
      }
    });
  }
}
