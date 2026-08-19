import { Directive, Input, HostBinding } from '@angular/core';

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
