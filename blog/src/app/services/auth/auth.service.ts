import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { enviroment } from '@enviroments/enviroment';
import { Token } from '@models/token.model';
import { User } from '@models/user.model';
import { StorageService } from '@services/storage/storage.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = enviroment.API_URL;
  private loginUrl = `${this.apiUrl}api/token/`;
  private profileUrl = `${this.apiUrl}api/me/`;
  private refreshUrl = `${this.apiUrl}api/token/refresh/`;

  currentUser = signal<User | null>(null);
  readonly currentUserSignal = this.currentUser;

  private http = inject(HttpClient);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // ✅ Signal reactivo de login
  private isLoggedIn = signal(this.storageService.isValidToken());
  readonly isLoggedInSignal = this.isLoggedIn;

  isLoggingOut = signal<boolean>(false);

  login(username: string, password: string): Observable<User> {
    return this.http.post<Token>(this.loginUrl, { username, password }).pipe(
      tap((response) => {
        this.storageService.saveToken('access', response.access);
        this.storageService.saveToken('refresh', response.refresh);
        this.isLoggedIn.set(true);
      }),
      switchMap(() => this.profile()),
      tap((user) => {
        this.currentUser.set(user);
      })
    );
  }

  profile() {
    return this.http.get<User>(`${this.profileUrl}`);
  }

  logout() {
    const refresh = this.storageService.getItem('refresh');
    this.isLoggingOut.set(true);

    if (refresh) {
      this.http
        .post('http://localhost:8000/api/logout/', { refresh })
        .subscribe({
          complete: () => {
            this.clearSession();
            this.router.navigate(['/posts']);
            this.isLoggingOut.set(false); // 🔁 Reactiva el botón SIEMPRE
          },
        });
    } else {
      this.clearSession();
      this.isLoggingOut.set(false);
    }
  }

  clearSession() {
    this.storageService.removeItem('access');
    this.storageService.removeItem('refresh');
    this.isLoggedIn.set(false);
    this.snackBar.open('Sesión cerrada correctamente.', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  refresh(): Observable<{ access: string }> {
    return this.http
      .post<{ access: string }>(this.refreshUrl, {
        refresh: this.storageService.getItem('refresh'),
      })
      .pipe(
        tap((response) => {
          this.storageService.saveToken('access', response.access);
          this.isLoggedIn.set(true);
          this.profile().subscribe();
        }),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        })
      );
  }
}
