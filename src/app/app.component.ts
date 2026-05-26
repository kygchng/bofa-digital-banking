import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SsoService } from './core/auth/sso.service';

@Component({
  selector: 'bofa-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Transactions', path: '/transactions', icon: 'receipt_long' },
    { label: 'Settings', path: '/account-settings', icon: 'settings' },
  ];

  constructor(
    public ssoService: SsoService,
    private router: Router,
  ) {}

  logout(): void {
    this.ssoService.logout();
    this.router.navigate(['/login']);
  }
}
