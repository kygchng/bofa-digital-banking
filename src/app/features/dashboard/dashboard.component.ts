import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SsoService } from '../../core/auth/sso.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';

export interface AccountSummary {
  accountId: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  nickname: string;
  balance: number;
  availableBalance: number;
  pendingTransactions: number;
  lastUpdated: string;
}

@Component({
  selector: 'bofa-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  accounts: AccountSummary[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private ssoService: SsoService,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.analyticsService.track({ name: 'dashboard_viewed', category: 'navigation' });
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.http
      .get<AccountSummary[]>('/api/accounts/summary', {
        headers: this.ssoService.getAuthHeaders(),
      })
      .subscribe({
        next: accounts => {
          this.accounts = accounts;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage =
            'Unable to load account information. Please refresh the page or contact support.';
          this.isLoading = false;
        },
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  getAccountIcon(type: AccountSummary['accountType']): string {
    const icons: Record<AccountSummary['accountType'], string> = {
      checking: 'account_balance',
      savings: 'savings',
      credit: 'credit_card',
      investment: 'trending_up',
    };
    return icons[type];
  }
}
