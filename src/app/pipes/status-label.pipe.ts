import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
