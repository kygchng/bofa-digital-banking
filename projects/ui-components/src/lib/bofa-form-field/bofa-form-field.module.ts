import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BofaFormFieldComponent } from './bofa-form-field.component';

@NgModule({
  declarations: [BofaFormFieldComponent],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  exports: [BofaFormFieldComponent],
})
export class BofaFormFieldModule {}
