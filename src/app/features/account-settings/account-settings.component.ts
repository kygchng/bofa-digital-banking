import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SsoService } from '../../core/auth/sso.service';

@Component({
  selector: 'bofa-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
})
export class AccountSettingsComponent implements OnInit {
  profileForm!: FormGroup;
  notificationsForm!: FormGroup;
  securityForm!: FormGroup;
  isSaving = false;
  activeTab = 0;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private ssoService: SsoService,
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-().]{10,15}$/)]],
    });

    this.notificationsForm = this.fb.group({
      emailAlerts: [true],
      smsAlerts: [true],
      pushNotifications: [false],
      fraudAlerts: [true],
      balanceAlerts: [false],
      balanceThreshold: [{ value: 100, disabled: true }],
      notificationEmail: ['', Validators.email],
      notificationPhone: [''],
    });

    this.securityForm = this.fb.group({
      mfaMethod: ['sms'],
      sessionTimeout: [30],
      trustedDevices: [true],
    });

    this.loadSettings();
  }

  loadSettings(): void {
    this.http
      .get<{ profile: any; notifications: any; security: any }>('/api/user/settings', {
        headers: this.ssoService.getAuthHeaders(),
      })
      .subscribe({
        next: settings => {
          this.profileForm.patchValue(settings.profile);
          this.notificationsForm.patchValue(settings.notifications);
          this.securityForm.patchValue(settings.security);
        },
      });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSaving = true;
    this.http
      .put('/api/user/profile', this.profileForm.value, {
        headers: this.ssoService.getAuthHeaders(),
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully.', 'Dismiss', { duration: 3000 });
          this.isSaving = false;
        },
        error: () => {
          this.snackBar.open('Failed to save profile. Please try again.', 'Dismiss', {
            duration: 5000,
          });
          this.isSaving = false;
        },
      });
  }

  saveNotifications(): void {
    this.http
      .put('/api/user/notifications', this.notificationsForm.value, {
        headers: this.ssoService.getAuthHeaders(),
      })
      .subscribe({
        next: () =>
          this.snackBar.open('Notification preferences saved.', 'Dismiss', { duration: 3000 }),
      });
  }
}
