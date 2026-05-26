import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SsoService } from '../../core/auth/sso.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  merchantName?: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'posted' | 'pending' | 'declined';
  category: string;
  accountId: string;
}

type TransactionFilter = 'all' | 'debit' | 'credit' | 'pending';

@Component({
  selector: 'bofa-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['date', 'description', 'category', 'amount', 'status'];
  dataSource = new MatTableDataSource<Transaction>([]);
  searchControl = new FormControl('');
  isLoading = true;
  errorMessage: string | null = null;
  activeFilter: TransactionFilter = 'all';

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private ssoService: SsoService,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.setupSearch();
    this.analyticsService.track({ name: 'transactions_viewed', category: 'navigation' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.http
      .get<Transaction[]>('/api/transactions', {
        headers: this.ssoService.getAuthHeaders(),
      })
      .subscribe({
        next: transactions => {
          this.dataSource.data = transactions;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Unable to load transactions. Please try again.';
          this.isLoading = false;
        },
      });
  }

  applyFilter(filter: TransactionFilter): void {
    this.activeFilter = filter;
    this.dataSource.filterPredicate = (row: Transaction, _: string) => {
      if (filter === 'all') return true;
      if (filter === 'pending') return row.status === 'pending';
      return row.type === filter;
    };
    // Trigger filterPredicate re-evaluation
    this.dataSource.filter = filter === 'all' ? '' : filter;
  }

  formatAmount(amount: number, type: Transaction['type']): string {
    const value = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
    return type === 'debit' ? `-${value}` : `+${value}`;
  }

  getStatusClass(status: Transaction['status']): string {
    return {
      posted: 'status-posted',
      pending: 'status-pending',
      declined: 'status-declined',
    }[status];
  }

  private setupSearch(): void {
    this.dataSource.filterPredicate = (row: Transaction, filter: string) => {
      const term = filter.toLowerCase();
      return (
        row.description.toLowerCase().includes(term) ||
        (row.merchantName?.toLowerCase().includes(term) ?? false) ||
        row.category.toLowerCase().includes(term)
      );
    };

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => {
        this.dataSource.filter = (value ?? '').trim().toLowerCase();
      });
  }
}
