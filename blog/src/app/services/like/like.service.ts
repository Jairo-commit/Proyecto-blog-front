import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { enviroment } from '@enviroments/enviroment';
import { LikePaginationResponse } from '@models/like.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  private apiUrl = enviroment.API_URL;

  private givingLikeUrl = `${this.apiUrl}api/post/`;

  private http = inject(HttpClient);  

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
  addLike(postId:number){
    return this.http.post(`${this.givingLikeUrl}${postId}/giving_like/`, {})
  }
}