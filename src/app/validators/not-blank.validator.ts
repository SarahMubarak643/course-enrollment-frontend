import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;

    if (value && value.trim().length === 0) {
      return { blank: true };
    }

    return null;
  };
}
