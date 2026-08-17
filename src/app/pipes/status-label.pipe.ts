import { Pipe, PipeTransform } from '@angular/core';

// Converts a backend status like "ENROLLED" or "WITHDRAWN" into a
// friendlier label: "Enrolled", "Withdrawn". Used in the enrollment
// list/detail/workflow pages.
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
