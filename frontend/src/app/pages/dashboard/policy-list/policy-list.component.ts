import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyService } from '../../../core/services/policy.service';
import { ToastService } from '../../../core/services/toast.service';
import { PolicyResponse } from '../../../models/policy.model';

declare var Razorpay: any;

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="policy-page animate-fade">
      <header class="page-header">
        <div class="header-content">
          <h1>Premium <span class="gradient-text">Protection</span></h1>
          <p>Discover our range of comprehensive insurance plans tailored for your peace of mind.</p>
        </div>
      </header>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="policy-grid skeleton-grid">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="skeleton-card">
          <div class="skel-top"></div>
          <div class="skel-body"></div>
          <div class="skel-bottom"></div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="hasError() && !isLoading()" class="state-container error-state glass-card">
        <div class="state-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <h3>Connection Error</h3>
        <p>We couldn't load the available policies at this time. Please check your connection and try again.</p>
        <button class="btn btn-secondary" (click)="loadPolicies()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && !hasError() && policies().length === 0" class="state-container empty-state glass-card">
        <div class="state-icon"><i class="fas fa-shield-alt"></i></div>
        <h3>No Policies Built Yet</h3>
        <p>Our team is currently preparing premium insurance options. Please check back soon.</p>
      </div>

      <!-- Policy Grid -->
      <div class="policy-grid" *ngIf="!isLoading() && !hasError()">
        <div *ngFor="let policy of policies(); let i = index" 
             class="glass-card policy-card"
             [class]="'theme-' + policy.type.toLowerCase()"
             [style.animation-delay]="i * 100 + 'ms'">
             
          <div class="card-glow"></div>
          
          <div class="policy-header">
            <div class="policy-id-chip">#{{ policy.id }}</div>
            <div class="policy-type-badge">{{ policy.type }}</div>
          </div>
          
          <div class="policy-body">
            <h3>{{ policy.name }}</h3>
            <p class="description">{{ policy.description || 'Comprehensive coverage for your needs.' }}</p>
          </div>
          
          <div class="policy-footer">
            <div class="price-block">
              <span class="price-label">Starting at</span>
              <span class="price-value">₹{{ policy.basePremium }}<span class="price-period">/yr</span></span>
            </div>
            
            <button (click)="openPaymentModal(policy)" 
                    class="btn btn-primary purchase-btn" 
                    [disabled]="isPurchasing === policy.id">
              <span *ngIf="isPurchasing !== policy.id">Get Covered <i class="fas fa-shield-check"></i></span>
              <span *ngIf="isPurchasing === policy.id"><i class="fas fa-spinner fa-spin"></i> Processing...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Razorpay-style QR Modal -->
      <div class="modal-overlay" *ngIf="showPaymentModal()" (click)="closeModal()">
        <div class="razorpay-modal animate-scale" (click)="$event.stopPropagation()">
          <div class="modal-left">
            <div class="brand">
              <div class="logo">S</div>
              <h3>SmartSecure <span class="badge">SECURE</span></h3>
            </div>
            
            <div class="order-details">
              <div class="detail-row">
                <span class="label">Policy</span>
                <span class="value">{{ selectedPolicy()?.name }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Amount</span>
                <span class="value amount">₹{{ selectedPolicy()?.basePremium }}</span>
              </div>
            </div>

            <div class="modal-footer">
              <p><i class="fas fa-shield-alt"></i> Payments are 100% Secure & Encrypted</p>
            </div>
          </div>

          <div class="modal-right">
            <div class="step-content qr-step" *ngIf="paymentStep() === 1">
              <h4>Scan QR to Pay</h4>
              <p>Use any UPI App like GPay, PhonePe or Paytm</p>
              
              <div class="qr-box">
                <img src="assets/images/qr-code.png" alt="Payment QR">
                <div class="qr-overlay" *ngIf="isVerifying()">
                   <div class="spinner-small"></div>
                   <span>Verifying...</span>
                </div>
              </div>

              <div class="upi-icons">
                 <i class="fab fa-google-pay"></i>
                 <i class="fas fa-university"></i>
                 <i class="fas fa-mobile-alt"></i>
              </div>

              <button class="btn btn-pay" (click)="simulatePayment()" [disabled]="isVerifying()">
                <span *ngIf="!isVerifying()">I Have Paid <i class="fas fa-arrow-right"></i></span>
                <span *ngIf="isVerifying()"><i class="fas fa-spinner fa-spin"></i> Checking Bank...</span>
              </button>
            </div>

            <div class="step-content success-step animate-fade" *ngIf="paymentStep() === 2">
               <div class="success-icon">
                 <i class="fas fa-check-circle"></i>
               </div>
               <h3>Payment Successful!</h3>
               <p>Your policy is being activated. Redirecting you to your dashboard...</p>
               <div class="confetti"></div>
            </div>
          </div>
          
          <button class="close-modal" (click)="closeModal()">&times;</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .policy-page {
      padding: 1.5rem 0 3rem;
      max-width: 1300px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 3rem;
      text-align: center;
    }

    .header-content h1 {
      font-size: 3rem;
      margin-bottom: 0.75rem;
    }

    .header-content p {
      color: var(--text-secondary);
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Grid Layout */
    .policy-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 2rem;
    }

    /* Policy Card */
    .policy-card {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 2rem;
      border: 1px solid rgba(255,255,255,0.05);
      background: linear-gradient(180deg, rgba(26, 32, 44, 0.4) 0%, rgba(15, 21, 32, 0.8) 100%);
      overflow: hidden;
      animation: slideUp 0.6s ease-out both;
      transform-style: preserve-3d;
      transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease;
    }

    .policy-card:hover {
      transform: translateY(-8px) scale(1.02);
      border-color: rgba(255,255,255,0.1);
      z-index: 10;
    }

    /* Card Glow Effects based on Type */
    .card-glow {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      opacity: 0.8;
      transition: height 0.3s ease;
    }



    .theme-health .card-glow { background: var(--accent-green); }
    .theme-life .card-glow { background: var(--accent-red); }
    .theme-vehicle .card-glow { background: var(--accent-blue); }
    .theme-home .card-glow { background: var(--accent-violet); }

    .theme-health:hover { box-shadow: 0 20px 40px rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); }
    .theme-life:hover { box-shadow: 0 20px 40px rgba(255,68,68,0.15); border-color: rgba(255,68,68,0.3); }
    .theme-vehicle:hover { box-shadow: 0 20px 40px rgba(88,166,255,0.15); border-color: rgba(88,166,255,0.3); }
    .theme-home:hover { box-shadow: 0 20px 40px rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.3); }

    /* Card Content */
    .policy-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .policy-icon {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.05);
    }
    .theme-health .policy-icon { color: var(--accent-green); background: var(--accent-green-dim); }
    .theme-life .policy-icon { color: var(--accent-red); background: rgba(255,68,68,0.1); }
    .theme-vehicle .policy-icon { color: var(--accent-blue); background: var(--accent-blue-dim); }
    .theme-home .policy-icon { color: var(--accent-violet); background: var(--accent-violet-dim); }

    .policy-type-badge {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      background: rgba(255,255,255,0.05);
      color: var(--text-secondary);
    }

    .policy-body { flex: 1; margin-bottom: 2rem; }
    .policy-body h3 { font-size: 1.4rem; margin-bottom: 0.75rem; line-height: 1.3; }
    .description { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; }

    .policy-footer {
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .price-block { display: flex; flex-direction: column; gap: 0.2rem; }
    .price-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
    .price-value { font-size: 2rem; font-weight: 800; color: var(--text-primary); line-height: 1; font-family: var(--header-font); }
    .price-period { font-size: 1rem; color: var(--text-secondary); font-weight: 500; margin-left: 0.1rem; }

    .policy-id-chip {
      font-family: monospace; font-weight: 800; font-size: 0.85rem; color: var(--accent-teal);
      background: rgba(0, 212, 170, 0.1); padding: 0.35rem 0.75rem; border-radius: 8px;
    }

    .purchase-btn {
      width: 100%;
      height: 3.2rem;
      font-size: 1rem;
      position: relative;
      overflow: hidden;
    }
    
    .theme-health .purchase-btn { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 4px 15px rgba(34,197,94,0.3); }
    .theme-health .purchase-btn:hover { box-shadow: 0 8px 25px rgba(34,197,94,0.4); }
    
    .theme-life .purchase-btn { background: linear-gradient(135deg, #ff4444, #dc2626); box-shadow: 0 4px 15px rgba(255,68,68,0.3); }
    .theme-life .purchase-btn:hover { box-shadow: 0 8px 25px rgba(255,68,68,0.4); }
    
    .theme-vehicle .purchase-btn { background: linear-gradient(135deg, #58a6ff, #2563eb); box-shadow: 0 4px 15px rgba(88,166,255,0.3); }
    .theme-vehicle .purchase-btn:hover { box-shadow: 0 8px 25px rgba(88,166,255,0.4); }
    
    .theme-home .purchase-btn { background: linear-gradient(135deg, #7c3aed, #6d28d9); box-shadow: 0 4px 15px rgba(124,58,237,0.3); }
    .theme-home .purchase-btn:hover { box-shadow: 0 8px 25px rgba(124,58,237,0.4); }

    /* States */
    .state-container {
      text-align: center;
      padding: 5rem 2rem;
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }

    .state-icon { font-size: 3.5rem; margin-bottom: 0.5rem; opacity: 0.5; }
    .error-state .state-icon { color: var(--accent-red); }
    .empty-state .state-icon { color: var(--accent-teal); }
    .state-container p { color: var(--text-secondary); line-height: 1.6; }

    /* Skeletons */
    .skeleton-card {
      padding: 2rem;
      background: rgba(255,255,255,0.02);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.05);
      height: 380px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .skel-top { height: 60px; width: 60px; border-radius: 14px; }
    .skel-body { flex: 1; height: 100px; border-radius: 8px; }
    .skel-bottom { height: 50px; border-radius: 12px; margin-top: auto; }
    
    .skel-top, .skel-body, .skel-bottom {
      background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
      background-size: 200% 100%;
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
      padding: 1rem;
    }

    .razorpay-modal {
      width: 100%; max-width: 750px; background: white; border-radius: 20px;
      display: grid; grid-template-columns: 300px 1fr; overflow: hidden;
      box-shadow: 0 30px 60px rgba(0,0,0,0.5); position: relative;
    }

    .modal-left { background: #0c1c3c; color: white; padding: 2.5rem; display: flex; flex-direction: column; }
    .brand { display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem; }
    .logo { 
      width: 40px; height: 40px; background: #3399cc; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.5rem;
    }
    .brand h3 { font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem; }
    .badge { font-size: 0.6rem; background: #22c55e; padding: 0.2rem 0.4rem; border-radius: 4px; }

    .order-details { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
    .detail-row { display: flex; flex-direction: column; gap: 0.25rem; }
    .detail-row .label { font-size: 0.8rem; opacity: 0.6; text-transform: uppercase; font-weight: 700; }
    .detail-row .value { font-size: 1.1rem; font-weight: 600; }
    .detail-row .amount { font-size: 1.8rem; color: #3399cc; }

    .modal-footer { margin-top: auto; font-size: 0.75rem; opacity: 0.5; display: flex; align-items: center; gap: 0.5rem; }

    .modal-right { background: #f9fafb; padding: 3rem; color: #1f2937; position: relative; }
    .step-content { text-align: center; }
    .step-content h4 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #0c1c3c; }
    .step-content p { color: #6b7280; font-size: 0.9rem; margin-bottom: 2rem; }

    .qr-box { 
      background: white; padding: 1.5rem; border-radius: 16px; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 2rem;
      position: relative; border: 1px solid #e5e7eb;
      display: inline-block;
    }
    .qr-box img { width: 180px; height: 180px; display: block; }
    
    .qr-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.9); display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 1rem; border-radius: 16px;
    }

    .upi-icons { display: flex; justify-content: center; gap: 1.5rem; font-size: 1.5rem; color: #9ca3af; margin-bottom: 2rem; }

    .btn-pay {
      background: #3399cc; color: white; width: 100%; padding: 1rem;
      border-radius: 10px; font-weight: 700; transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(51,153,204,0.3);
    }
    .btn-pay:hover { background: #2b84b0; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(51,153,204,0.4); }

    .success-icon { font-size: 5rem; color: #22c55e; margin-bottom: 1.5rem; }
    .success-step h3 { font-size: 1.8rem; margin-bottom: 1rem; }

    .close-modal {
      position: absolute; top: 1rem; right: 1.5rem; background: none; border: none;
      font-size: 2rem; color: #9ca3af; cursor: pointer; z-index: 10;
    }
    .close-modal:hover { color: #1f2937; }

    .spinner-small {
      width: 30px; height: 30px; border: 3px solid rgba(51,153,204,0.1);
      border-top-color: #3399cc; border-radius: 50%; animation: spin 1s linear infinite;
    }

    @media (max-width: 768px) {
      .razorpay-modal { grid-template-columns: 1fr; }
      .modal-left { display: none; }
    }
  `]
})
export class PolicyListComponent implements OnInit {
  policies = signal<PolicyResponse[]>([]);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  isPurchasing: number | null = null;

  showPaymentModal = signal<boolean>(false);
  selectedPolicy = signal<PolicyResponse | null>(null);
  paymentStep = signal<number>(1);
  isVerifying = signal<boolean>(false);

  constructor(
    private policyService: PolicyService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadPolicies();
  }

  getTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'health': return 'fas fa-heartbeat';
      case 'life': return 'fas fa-user-shield';
      case 'vehicle': return 'fas fa-car';
      case 'home': return 'fas fa-home';
      case 'travel': return 'fas fa-plane';
      default: return 'fas fa-shield-alt';
    }
  }

  loadPolicies() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.policyService.getPolicies().subscribe({
      next: (data) => {
        this.policies.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load policies:', err);
        this.isLoading.set(false);
        this.hasError.set(true);
        this.toastService.show('Failed to load policies. Please try again.', 'error');
      }
    });
  }

  purchasePolicy(policy: PolicyResponse) {
    this.isPurchasing = policy.id;
    this.policyService.purchasePolicy(policy.id).subscribe({
      next: () => {
        this.paymentStep.set(2);
        this.isVerifying.set(false);
        this.isPurchasing = null;
        
        // Auto close and notify after success animation
        setTimeout(() => {
          this.closeModal();
          this.toastService.show(`Successfully purchased ${policy.name}!`, 'success');
        }, 3000);
      },
      error: (err) => {
        console.error('Purchase error:', err);
        this.toastService.show('Purchase failed. Please check your balance or try again later.', 'error');
        this.isPurchasing = null;
        this.isVerifying.set(false);
      }
    });
  }

  openPaymentModal(policy: PolicyResponse) {
    this.selectedPolicy.set(policy);
    this.paymentStep.set(1);
    this.isVerifying.set(false);
    this.showPaymentModal.set(true);
  }

  closeModal() {
    this.showPaymentModal.set(false);
    this.selectedPolicy.set(null);
  }

  simulatePayment() {
    this.payWithRazorpay();
  }

  payWithRazorpay() {
    this.isVerifying.set(true);
    const policy = this.selectedPolicy();
    if (!policy) return;

    // Fetch the real Key ID from our backend securely
    this.policyService.getPaymentConfig().subscribe({
      next: (config: any) => {
        const options = {
          key: config.keyId, // Using the real key fetched from .env via backend
          amount: policy.basePremium * 100, // Amount in paisa
          currency: "INR",
          name: "SmartSecure Insurance",
          description: `Purchase for ${policy.name}`,
          image: "assets/images/logo.png",
          handler: (response: any) => {
            console.log("Razorpay Success:", response);
            this.purchasePolicy(policy);
          },
          prefill: {
            name: "Valued Customer",
            email: "customer@example.com",
            contact: "9999999999"
          },
          theme: {
            color: "#0c1c3c"
          }
        };

        try {
          const rzp = new Razorpay(options);
          rzp.open();
          this.closeModal();
          this.isVerifying.set(false);
        } catch (err) {
          console.error("Razorpay Error:", err);
          this.toastService.show("Razorpay is not loaded.", "error");
          this.isVerifying.set(false);
        }
      },
      error: () => {
        this.toastService.show("Could not load payment configuration.", "error");
        this.isVerifying.set(false);
      }
    });
  }
}
