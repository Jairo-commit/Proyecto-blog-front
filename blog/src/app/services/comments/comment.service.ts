import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { enviroment } from '@enviroments/enviroment';
import { Comments_author, PaginatedComments } from '@models/comment.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private apiUrl = enviroment.API_URL;
  private postsUrl = `${this.apiUrl}api/post/`;
  private http = inject(HttpClient)
  
  private _comments = signal<Comments_author[]>([]);
  readonly comments = computed(() => this._comments());

  // Nueva señal para paginación
  private _pagination = signal<Omit<PaginatedComments, 'results'> | null>(null);
  readonly pagination = computed(() => this._pagination());

  constructor() { }

  getComments(postId:string, page: number = 1): Observable<PaginatedComments>{
    return this.http.get<PaginatedComments>(`${this.postsUrl}${postId}/comments/?page=${page}`).pipe(
      tap(response => {
        this._comments.set(response.results);
        const { results, ...pagination } = response;
        this._pagination.set(pagination);
      })
    );
  }

  add(comment: { content: string }, id:string){
    return this.http.post<Comments_author>(`${this.postsUrl}${id}/add-comment/`, comment );
  }
}