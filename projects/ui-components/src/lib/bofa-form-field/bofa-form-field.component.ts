import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type BofaFormFieldType = 'text' | 'password' | 'email' | 'number' | 'tel';

/**
 * BofA Design System — Form Field Component
 *
 * Wraps Angular Material mat-form-field with BofA Design System v1.4 defaults.
 * Uses appearance="outline" per BofA UI Standards v2.0.
 * Migrated from appearance="legacy" as part of the Angular Material 15 MDC migration.
 * Reference: https://material.angular.io/guide/mdc-migration#form-field
 */
@Component({
  selector: 'bofa-form-field',
  templateUrl: './bofa-form-field.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BofaFormFieldComponent),
      multi: true,
    },
  ],
})
export class BofaFormFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() placeholder = '';
  @Input() type: BofaFormFieldType = 'text';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() floatLabel: 'auto' | 'always' = 'auto';

  value = '';
  isDisabled = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }
}
