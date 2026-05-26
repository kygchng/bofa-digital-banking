# BofA Digital Banking — Frontend Monorepo

Customer-facing Digital Banking web application and shared UI component library
serving millions of retail banking customers across checking, savings, and credit accounts.

## Compliance Status

| Item | Status |
|------|--------|
| Angular Version | **14.3.x ⚠️ END OF LIFE (Nov 18, 2023)** |
| Angular Material | **14.x ⚠️ EOL** |
| Security policy compliance | **NON-COMPLIANT** |
| Downstream teams consuming `@bofa/ui-components` | **4 teams** |
| Migration target | Angular 18 |
| Compliance deadline | Q2 2025 (**OVERDUE**) |

> Running Angular 14 in production violates BofA Internal Security Policy ISP-1042
> (Unsupported Framework Prohibition). Security patches for Angular 14 are no longer
> issued. Known CVEs will not be patched by the Angular team.

## Workspace Structure

```
bofa-digital-banking/
├── src/                          # Digital Banking App (main customer-facing app)
│   └── app/
│       ├── core/
│       │   ├── auth/             # SSO/MFA integration (BofA Enterprise SSO Gateway)
│       │   └── analytics/        # BofA Analytics SDK integration
│       └── features/
│           ├── dashboard/        # Account summary and balance overview
│           ├── transactions/     # Transaction history and search
│           └── account-settings/ # User profile and notification preferences
└── projects/
    └── ui-components/            # @bofa/ui-components — shared component library
        └── src/lib/
            ├── bofa-button/
            ├── bofa-form-field/  # ⚠️ Uses deprecated Angular Material legacy API
            ├── bofa-data-table/
            └── bofa-alert-banner/
```

## Downstream Consumers of `@bofa/ui-components`

| Team | Application | Impact if broken |
|------|------------|-----------------|
| Retail Web | digital-banking-app (this repo) | P0 — customer-facing |
| Business Banking | business-portal | P0 — 2M+ SMB customers |
| Wealth Management | merrill-edge-web | P1 — HNW customer portal |
| Internal Tools | employee-banking-portal | P2 — internal only |

**The component library must build cleanly on the target Angular version before
any consuming application can be upgraded. All four teams' CI must remain green.**

## Known Breaking Changes for Angular 14 → 18 Migration

### Angular 14 → 15
- `mat-form-field appearance="legacy"` **removed**. All usages in `@bofa/ui-components`
  and consuming apps must migrate to `appearance="outline"` or `appearance="fill"`.
- `ComponentFactoryResolver` deprecated (removed in v15). `AnalyticsService` uses this
  pattern for dynamic component rendering.
- Angular Material MDC components replace all legacy component implementations.

### Angular 15 → 16
- `ngcc` compiler removed. All libraries must be Ivy-compatible.
- `DatePipe` strict mode changes.
- Router `RouterModule` optional in standalone components.

### Angular 16 → 17
- `@angular/http` fully removed (was deprecated).
- New `@if`, `@for`, `@switch` template control flow syntax available.
- `ngFor`, `ngIf` remain supported but deprecated.

### Angular 17 → 18
- Zoneless change detection available (opt-in).
- Application builder (`@angular-devkit/build-angular:application`) replaces
  `browser` builder.
- View transitions API support.

## Migration Order

```
1. Upgrade @bofa/ui-components (library) — FIRST
2. Verify all 4 downstream teams' CI still passes against upgraded library
3. Upgrade digital-banking-app (consuming app) — SECOND
4. Validate SSO/MFA integration on each hop
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Angular 14 (target: 18) |
| UI components | Angular Material 14 + BofA Design System |
| State | RxJS / BehaviorSubjects |
| Auth | BofA Enterprise SSO Gateway (SAML 2.0 / OIDC) |
| Analytics | BofA Analytics SDK v3.2 (proprietary) |
| Build | Angular CLI 14 / ng-packagr |
| Language | TypeScript 4.7 |
