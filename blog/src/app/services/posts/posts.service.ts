import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { enviroment } from '@enviroments/enviroment';
import { Post, PaginatedPosts } from '@models/post.model';
import { checkToken } from '@interceptors/token.interceptor';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = enviroment.API_URL;
  private postsUrl = `${this.apiUrl}api/post/`;

  constructor(private http: HttpClient) {}

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

  updatePost(updatedPost: Post) {
    const current = this._posts();
    const index = current.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      const updatedList = [...current];
      updatedList[index] = updatedPost;
      this._posts.set(updatedList);
    }
  }
}

// @Injectable({
//   providedIn: 'root'
// })
// export class PostsService {

//   private apiUrl = enviroment.API_URL;

//   private postsUrl = `${this.apiUrl}api/post/`;

//   constructor(
//     private http: HttpClient,
//   ) {}

//   // 🧠 Signal reactiva que guarda todos los posts
//   private _posts = signal<Post[]>([]);
//   readonly posts = computed(() => this._posts());

//   setPosts(posts: Post[]) {
//     this._posts.set(posts);
//   }

//   getPostsToken():Observable<{ results: Post[]}>{
//     return this.http.get<{ results: Post[]}>(this.postsUrl, {context: checkToken()}); 
//   }
//   getPosts():Observable<{ results: Post[]}>{
//     return this.http.get<{ results: Post[]}>(this.postsUrl); 
//   }
//   // ✅ Actualiza un post dentro del array
//   updatePost(updatedPost: Post) {
//     const current = this._posts();
//     const index = current.findIndex(p => p.id === updatedPost.id);
//     if (index !== -1) {
//       const updatedList = [...current];
//       updatedList[index] = updatedPost;
//       this._posts.set(updatedList);
//     }
//   }
// }
