import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { enviroment } from '@enviroments/enviroment';
import { Post, PaginatedPosts, PostDTO } from '@models/post.model';
import { checkToken } from '@interceptors/token.interceptor';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = enviroment.API_URL;
  private postsUrl = `${this.apiUrl}api/post/`;

  constructor(private http: HttpClient) {}

  public post = signal<Post | null>(null);
  currentPage = signal(1);
  refreshTrigger = signal(0);

  private _posts = signal<Post[]>([]);
  readonly posts = computed(() => this._posts());

  // Nueva señal para paginación
  private _pagination = signal<Omit<PaginatedPosts, 'results'> | null>(null);
  readonly pagination = computed(() => this._pagination());

  setPosts(posts: Post[]) {
    this._posts.set(posts);
  }

  setPagination(pagination: Omit<PaginatedPosts, 'results'>) {
    this._pagination.set(pagination);
  }

  getPostsToken(page: number = 1): Observable<PaginatedPosts> {
    return this.http.get<PaginatedPosts>(`${this.postsUrl}?page=${page}`, {
      context: checkToken()
    }).pipe(
      tap(response => {
        this._posts.set(response.results);
        const { results, ...pagination } = response;
        this._pagination.set(pagination);
      })
    );
  }

  getPosts(page: number = 1): Observable<PaginatedPosts> {
    return this.http.get<PaginatedPosts>(`${this.postsUrl}?page=${page}`).pipe(
      tap(response => {
        this._posts.set(response.results);
        const { results, ...pagination } = response;
        this._pagination.set(pagination);
      })
    );
  }

  triggerRefresh() {
    this.refreshTrigger.update(v => v + 1);
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.postsUrl}${id}`, {
      context: checkToken()}).pipe(
        tap(response => {
          this.post.set(response);
        })
    );
  }

  eliminate(id : number){
    return this.http.delete(`${this.postsUrl}${id}/`, { context: checkToken()})
  }

  create(postData: PostDTO): Observable<PostDTO>{
    return this.http.post<PostDTO>(this.postsUrl, postData, {context: checkToken()});
  }

  update(id:string, postData: PostDTO){
    return this.http.put(`${this.postsUrl}${id}/`, postData, { context:checkToken()});
  }
}