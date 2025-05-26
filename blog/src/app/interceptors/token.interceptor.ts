import {
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';

import { StorageService } from '../services/storage/storage.service';
import { AuthService } from '@services/auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);

  let newReq = req;

  if (req.url.includes('token/refresh/')) {
    const refresh = storageService.getItem('refresh');
    if (refresh) {
      newReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${refresh}`,
        },
      });
    } else {
      authService.clearSession();
    }
  } else {
    const accessToken = storageService.getItem('access');
    if (accessToken) {
      newReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  }

  return next(newReq).pipe(
    catchError((err) => {
      if (err.status === 401) {
        if (req.url.includes('token/refresh/')) {
          authService.clearSession();
        } else {
          return authService.refresh().pipe(
            switchMap((newAccessToken: { access: string }) => {
              if (newAccessToken) {
                console.log(newAccessToken);
                const newReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newAccessToken.access}`,
                  },
                });
                console.log(newReq);
                return next(newReq);
              } else {
                authService.clearSession();
                return next(req);
              }
            }),
            catchError((err) => {
              authService.clearSession();
              return next(req);
            })
          );
        }
      }
      throw throwError(() => err);
    })
  );
};
