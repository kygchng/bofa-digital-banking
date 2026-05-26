import { Component, Input } from '@angular/core';

export type BofaAlertType = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'bofa-alert-banner',
  templateUrl: './bofa-alert-banner.component.html',
})
export class BofaAlertBannerComponent {
  @Input() type: BofaAlertType = 'info';
  @Input() message = '';
  @Input() dismissible = false;

  dismissed = false;

  get iconName(): string {
    const icons: Record<BofaAlertType, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
    };
    return icons[this.type];
  }

  dismiss(): void {
    this.dismissed = true;
  }
}
