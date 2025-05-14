import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export class CustomValidators {
  static MatchValidator(sourceKey: string, confirmKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const formGroup = group as FormGroup;
      const sourceControl = formGroup.controls[sourceKey];
      const confirmControl = formGroup.controls[confirmKey];

      if (sourceControl.value !== confirmControl.value) {
        confirmControl.setErrors({ mustMatch: true });
      } else {
        confirmControl.setErrors(null);
      }

      return null;
    };
  }
}
