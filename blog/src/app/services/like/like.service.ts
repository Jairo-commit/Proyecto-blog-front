import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { enviroment } from '@enviroments/enviroment';
import { checkToken } from '@interceptors/token.interceptor';
import { LikePaginationResponse } from '@models/like.model';
import { Observable } from 'rxjs';
import { AuthService } from '@services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  private apiUrl = enviroment.API_URL;

  private givingLikeUrl = `${this.apiUrl}api/post/`;

  private http = inject(HttpClient);  

  // private likes = signal<LikePaginationResponse | null>(null);  // Signal para almacenar likes y paginación
  // readonly likesData = this.likes;  // Computed para obtener los likes

  getLikes(post_id?: number, page: number = 1): Observable<LikePaginationResponse> {
  const url = new URL(`http://127.0.0.1:8000/api/likes/`)
  if(post_id !== undefined){
    url.searchParams.append('post_id', post_id.toString());
  }
  if(page !== undefined){
    url.searchParams.append('page', page.toString());
  }
  return this.http.get<LikePaginationResponse>(url.toString())
  }

  getLikesToken(post_id?: number, page: number = 1): Observable<LikePaginationResponse> {
    const url = new URL(`http://127.0.0.1:8000/api/likes/`)
    if(post_id !== undefined){
      url.searchParams.append('post_id', post_id.toString());
    }
    if(page !== undefined){
      url.searchParams.append('page', page.toString());
    }
    return this.http.get<LikePaginationResponse>(url.toString(), { context: checkToken()})
    }

  addLike(postId:number){
    return this.http.post(`${this.givingLikeUrl}${postId}/giving_like/`, {} ,{context: checkToken()})
  }
}


