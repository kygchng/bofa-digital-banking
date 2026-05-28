import { Component, Input } from '@angular/core';

export type BofaButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type BofaButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bofa-button',
  templateUrl: './bofa-button.component.html',
})
export class BofaButtonComponent {
  @Input() variant: BofaButtonVariant = 'primary';
  @Input() size: BofaButtonSize = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;

  get matColor(): 'primary' | 'accent' | 'warn' | undefined {
    if (this.variant === 'primary') return 'primary';
    if (this.variant === 'danger') return 'warn';
    return undefined;
  }


}
