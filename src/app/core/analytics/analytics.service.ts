import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

// BofA Analytics SDK v3.2 — Proprietary internal analytics pipeline.
// Documentation: https://analytics-sdk.bankofamerica.internal/docs/web/v3
// Tracks page views, user interactions, and transaction events for
// reporting to BofA's internal data platform (BDP).
declare const BoAAnalytics: {
  track: (event: string, properties: Record<string, unknown>) => void;
  page: (name: string, properties: Record<string, unknown>) => void;
  identify: (userId: string, traits: Record<string, unknown>) => void;
};

export type AnalyticsCategory = 'navigation' | 'transaction' | 'account' | 'auth' | 'error';

export interface AnalyticsEvent {
  name: string;
  category: AnalyticsCategory;
  properties?: Record<string, unknown>;
}

/**
 * Integrates with BofA Analytics SDK v3.2 for behavioral tracking.
 *
 * ComponentFactoryResolver is used here to dynamically instantiate
 * feature-flag-driven overlay components at runtime. This is required
 * by the BofA Feature Flags SDK v2.1 (BoA-Flags), which injects
 * A/B test variant components via ViewContainerRef without static imports.
 *
 * NOTE: ComponentFactoryResolver is deprecated in Angular 13 and
 * removed in Angular 15. Migration to ViewContainerRef.createComponent()
 * direct API is required as part of the Angular 15 upgrade.
 * See: https://angular.io/guide/deprecations#componentfactoryresolver
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private userId: string | null = null;
  private sessionStart = Date.now();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private router: Router,
  ) {
    this.initPageTracking();
  }

  identify(userId: string, accountType: string, segment: string): void {
    this.userId = userId;
    this.safeTrack(() => {
      BoAAnalytics.identify(userId, {
        accountType,
        segment,
        platform: 'web',
        appVersion: '14.3.4',
      });
    });
  }

  track(event: AnalyticsEvent): void {
    this.safeTrack(() => {
      BoAAnalytics.track(event.name, {
        ...event.properties,
        category: event.category,
        userId: this.userId,
        sessionDuration: Date.now() - this.sessionStart,
        timestamp: new Date().toISOString(),
        platform: 'web',
      });
    });
  }

  trackTransactionView(transactionId: string, amount: number, type: string): void {
    this.track({
      name: 'transaction_viewed',
      category: 'transaction',
      properties: { transactionId, amount, type },
    });
  }

  trackAuthEvent(event: 'login_success' | 'login_failure' | 'mfa_triggered' | 'logout'): void {
    this.track({ name: event, category: 'auth' });
  }

  /**
   * Dynamically renders a feature-flag-driven component into a host container.
   * Used by the BofA Feature Flags SDK (BoA-Flags v2.1) to inject A/B test
   * variant components without static module imports.
   *
   * MIGRATION NOTE (Angular 15): Replace with:
   *   const ref = container.createComponent(component);
   * and remove ComponentFactoryResolver from the constructor.
   */
  renderFeatureComponent<T>(
    container: ViewContainerRef,
    component: Type<T>,
    inputs: Partial<T> = {},
  ): ComponentRef<T> {
    const factory = this.componentFactoryResolver.resolveComponentFactory(component);
    const ref = container.createComponent(factory);
    Object.assign(ref.instance as object, inputs);
    ref.changeDetectorRef.detectChanges();
    return ref;
  }

  private initPageTracking(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.safeTrack(() => {
          BoAAnalytics.page(event.urlAfterRedirects, {
            userId: this.userId,
            timestamp: new Date().toISOString(),
          });
        });
      });
  }

  private safeTrack(fn: () => void): void {
    try {
      fn();
    } catch {
      // Analytics SDK unavailable in local/dev environments — fail silently.
      // Analytics failures must never interrupt user flows per UX-0042.
    }
  }
}
