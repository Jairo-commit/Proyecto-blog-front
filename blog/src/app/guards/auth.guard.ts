import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { AuthService } from '@services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = storageService.isValidToken();

  if (!token) {
    router.navigate(['/login']);
    authService.logout();
    return false;
  }
  return true;
};