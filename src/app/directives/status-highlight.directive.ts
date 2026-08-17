import { Directive, Input, HostBinding } from '@angular/core';

// Highlights an element (a table row, a card, a badge) based on the
// enrollment status passed in. Used on the enrollment list/detail pages
// so the current status is visible at a glance, without any extra CSS
// classes written by hand in every template.
//
// Usage: <tr [appStatusHighlight]="enrollment.status">
@Directive({
  selector: '[appStatusHighlight]',
  standalone: true
})
export class StatusHighlightDirective {

  @Input('appStatusHighlight') status = '';

  private readonly statusClasses: Record<string, string> = {
    ENROLLED: 'table-secondary',
    APPROVED: 'table-success',
    REJECTED: 'table-danger',
    WITHDRAWN: 'table-warning',
    COMPLETED: 'table-primary'
  };

  @HostBinding('class')
  get hostClass(): string {
    return this.statusClasses[this.status] ?? '';
  }
}
