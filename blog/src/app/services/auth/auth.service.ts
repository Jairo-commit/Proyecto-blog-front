import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';

import { enviroment } from '@enviroments/enviroment';
import { Token } from '@models/token.model';
import { User } from '@models/user.model';
import { StorageService } from '@services/storage/storage.service';
import { checkToken } from '@interceptors/token.interceptor';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private apiUrl = enviroment.API_URL;
  private loginUrl = `${this.apiUrl}api/token/`;
  private profileUrl = `${this.apiUrl}api/me/`;

  private currentUser = signal<User | null>(null);
  readonly currentUserSignal = this.currentUser;

  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  // ✅ Signal reactivo de login
  private isLoggedIn = signal(this.storageService.isValidToken());
  readonly isLoggedInSignal = this.isLoggedIn;

  constructor() {
    if (this.storageService.isValidToken()) {
      this.profile().subscribe({
        next: (user) => this.currentUser.set(user),
        error: () => this.logout()
      });
    }
  } 

  login(username: string, password: string): Observable<User>{

    return this.http.post<Token>(this.loginUrl, { username, password })
    .pipe(
      tap( response => {
        this.storageService.saveToken('access' , response.access)
        this.storageService.saveToken('refresh' , response.refresh)
        this.isLoggedIn.set(true);
      }),
      switchMap(() => this.profile()),
      tap(user => {
        this.currentUser.set(user);
      })
    )
  };

  profile(){
    return this.http.get<User>(`${this.profileUrl}`, {context: checkToken()})
  }

  logout(){
    this.storageService.removeItem("access");
    this.storageService.removeItem("refresh");
    this.isLoggedIn.set(false); 
  }

}
