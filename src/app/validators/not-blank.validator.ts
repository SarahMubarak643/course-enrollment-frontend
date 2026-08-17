import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// The one custom validator required by the assignment. Validators.required
// alone accepts a string of only spaces; this rejects that case too.
// Used on text fields across the Course form.
export function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;

    if (value && value.trim().length === 0) {
      return { blank: true };
    }

    return null;
  };
}
