import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BofaDataTableComponent } from './bofa-data-table.component';

@NgModule({
  declarations: [BofaDataTableComponent],
  imports: [CommonModule, MatTableModule, MatProgressBarModule],
  exports: [BofaDataTableComponent],
})
export class BofaDataTableModule {}
