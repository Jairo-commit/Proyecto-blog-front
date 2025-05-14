import { HttpInterceptorFn, HttpContextToken, HttpContext } from '@angular/common/http';
import { inject } from '@angular/core';

import { StorageService } from '../services/storage/storage.service';

const CHECK_TOKEN = new HttpContextToken<boolean>(() => false);

export function checkToken(): HttpContext {
  return new HttpContext().set(CHECK_TOKEN, true);
}

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);

  if(req.context.get(CHECK_TOKEN)){
    const accessToken = storageService.getItem('access');
    if (accessToken) {
      const request = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
      });
  
      return next(request);
    }
  }
  

  return next(req);
};