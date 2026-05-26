import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BofaButtonComponent } from './bofa-button.component';

@NgModule({
  declarations: [BofaButtonComponent],
  imports: [MatButtonModule],
  exports: [BofaButtonComponent],
})
export class BofaButtonModule {}
