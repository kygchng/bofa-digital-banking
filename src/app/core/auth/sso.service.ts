import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SsoToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface MfaChallenge {
  challengeId: string;
  method: 'sms' | 'authenticator' | 'email';
  maskedDestination: string;
  expiresAt: string;
}

/**
 * Integrates with the BofA Enterprise SSO Gateway (SAML 2.0 / OIDC).
 * Internal service endpoint: https://sso.bankofamerica.internal/oauth2/v1
 *
 * Authentication flow:
 *   1. initiateLogin()     → triggers primary credential validation + MFA challenge
 *   2. completeMfa()       → verifies OTP, returns session token
 *   3. refreshToken()      → called automatically before token expiry
 *
 * MFA methods supported: SMS (default), TOTP authenticator app, email OTP.
 * Session tokens are stored in sessionStorage (not localStorage) per ISP-0821.
 */
@Injectable({ providedIn: 'root' })
export class SsoService {
  private readonly SESSION_KEY = 'bofa_session';
  private currentToken$ = new BehaviorSubject<SsoToken | null>(null);
  private sessionExpiry: Date | null = null;

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  isAuthenticated(): boolean {
    const token = this.currentToken$.getValue();
    return !!token && !!this.sessionExpiry && new Date() < this.sessionExpiry;
  }

  initiateLogin(employeeId: string, password: string): Observable<MfaChallenge> {
    return this.http
      .post<MfaChallenge>(`${environment.ssoGatewayUrl}/initiate`, {
        employeeId,
        password,
        clientId: 'digital-banking-web',
        clientVersion: '15.0.0',
      })
      .pipe(
        catchError(err =>
          throwError(() => new Error(`SSO initiation failed: ${err.message}`)),
        ),
      );
  }

  completeMfa(challengeId: string, otp: string): Observable<SsoToken> {
    return this.http
      .post<SsoToken>(`${environment.ssoGatewayUrl}/mfa/verify`, { challengeId, otp })
      .pipe(
        tap(token => this.persistSession(token)),
        catchError(err =>
          throwError(() => new Error(`MFA verification failed: ${err.message}`)),
        ),
      );
  }

  refreshToken(): Observable<SsoToken> {
    const current = this.currentToken$.getValue();
    if (!current) {
      return throwError(() => new Error('No active session to refresh'));
    }
    return this.http
      .post<SsoToken>(`${environment.ssoGatewayUrl}/refresh`, {
        refreshToken: current.refreshToken,
      })
      .pipe(tap(token => this.persistSession(token)));
  }

  logout(): void {
    const token = this.currentToken$.getValue();
    if (token) {
      this.http
        .post(`${environment.ssoGatewayUrl}/logout`, { accessToken: token.accessToken })
        .subscribe();
    }
    this.currentToken$.next(null);
    this.sessionExpiry = null;
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.currentToken$.getValue();
    return new HttpHeaders({
      Authorization: `Bearer ${token?.accessToken ?? ''}`,
      'X-BofA-Client': 'digital-banking-web/15.0.0',
      'X-BofA-Request-Id': crypto.randomUUID(),
    });
  }

  private persistSession(token: SsoToken): void {
    const expiry = new Date(Date.now() + token.expiresIn * 1000);
    this.currentToken$.next(token);
    this.sessionExpiry = expiry;
    sessionStorage.setItem(
      this.SESSION_KEY,
      JSON.stringify({ token, expiry: expiry.toISOString() }),
    );
  }

  private restoreSession(): void {
    const stored = sessionStorage.getItem(this.SESSION_KEY);
    if (!stored) return;
    try {
      const { token, expiry } = JSON.parse(stored) as { token: SsoToken; expiry: string };
      const expiryDate = new Date(expiry);
      if (new Date() < expiryDate) {
        this.currentToken$.next(token);
        this.sessionExpiry = expiryDate;
      } else {
        sessionStorage.removeItem(this.SESSION_KEY);
      }
    } catch {
      sessionStorage.removeItem(this.SESSION_KEY);
    }
  }
}
