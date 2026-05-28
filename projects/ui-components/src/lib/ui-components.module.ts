import { NgModule } from '@angular/core';
import { BofaButtonModule } from './bofa-button/bofa-button.module';
import { BofaFormFieldModule } from './bofa-form-field/bofa-form-field.module';
import { BofaDataTableModule } from './bofa-data-table/bofa-data-table.module';
import { BofaAlertBannerModule } from './bofa-alert-banner/bofa-alert-banner.module';

/**
 * Root module for @bofa/ui-components.
 * Import this into any Angular application consuming the BofA Design System.
 *
 * Downstream consumers:
 *   - digital-banking-app  (this workspace)
 *   - business-portal
 *   - merrill-edge-web
 *   - employee-banking-portal
 */
@NgModule({
  exports: [
    BofaButtonModule,
    BofaFormFieldModule,
    BofaDataTableModule,
    BofaAlertBannerModule,
  ],
})
export class UiComponentsModule {}
