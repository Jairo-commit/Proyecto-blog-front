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

  static permissionHierarchyValidator(): ValidatorFn {
    const ACCESS_LEVELS: Record<string, number> = {
      'None': 0,
      'Read': 1,
      'Read and Edit': 2
    };
    return (group: AbstractControl): ValidationErrors | null => {
      const publicAccess = group.get('public_access')?.value;
      const authenticatedAccess = group.get('authenticated_access')?.value;
      const groupAccess = group.get('group_access')?.value;
  
      const publicLevel = ACCESS_LEVELS[publicAccess] ?? 0;
      const authLevel = ACCESS_LEVELS[authenticatedAccess] ?? 0;
      const teamLevel = ACCESS_LEVELS[groupAccess] ?? 0;
  
      const hasViolation =
        publicLevel > teamLevel ||
        authLevel > teamLevel;
  
      return hasViolation ? { permissionHierarchy: true } : null;
    };
  }
}
