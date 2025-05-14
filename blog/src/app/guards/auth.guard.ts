import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  const token = storageService.getItem('access');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};