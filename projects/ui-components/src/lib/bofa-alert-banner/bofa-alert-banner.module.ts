import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BofaAlertBannerComponent } from './bofa-alert-banner.component';

@NgModule({
  declarations: [BofaAlertBannerComponent],
  imports: [CommonModule, MatIconModule, MatButtonModule],
  exports: [BofaAlertBannerComponent],
})
export class BofaAlertBannerModule {}
