import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { enviroment } from '@enviroments/enviroment';
import { User } from '../../../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private apiUrl = enviroment.API_URL;

  private registerUrl =  `${this.apiUrl}api/register/`;

  constructor(
    private http: HttpClient
  ) {}

  create(username: string, password: string): Observable<User>{
    return this.http.post<User>(this.registerUrl, { username, password});
  }
}
