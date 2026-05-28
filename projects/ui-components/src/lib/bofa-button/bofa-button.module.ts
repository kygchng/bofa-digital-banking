import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { BofaButtonComponent } from './bofa-button.component';

@NgModule({
  declarations: [BofaButtonComponent],
  imports: [CommonModule, MatButtonModule],
  exports: [BofaButtonComponent],
})
export class BofaButtonModule {}
