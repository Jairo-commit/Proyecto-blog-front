import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, Input, input, OnInit, signal } from '@angular/core';
import { LikePaginationResponse } from '@models/like.model';

import { LikesAuthor, Post } from '@models/post.model';
import { AuthService } from '@services/auth/auth.service';
import { LikeService } from '@services/like/like.service';
import { PostsService } from '@services/posts/posts.service';
import { LikesComponent } from '../likes/likes.component';


@Component({
  selector: 'app-post',
  imports: [DatePipe,  CommonModule, LikesComponent],
  templateUrl: './post.component.html',
})
export class PostComponent{

  private likeService = inject(LikeService);
  private authService = inject(AuthService);
  private postsService = inject(PostsService);
  
  @Input() post!: Post;
    
  _hasLiked = signal<boolean>(false);
  showLikes = signal(false);  // Controlamos la visibilidad del popover de likes
  currentPage = signal(1);

  likesPost = signal<LikePaginationResponse | null>(null);

  get profile() {
    return this.authService.currentUserSignal();
  }
  
  constructor() {
//     Nunca uses @Input() en el constructor.

// Usa ? (optional chaining) o validaciones para evitar acceder a .id si la variable no existe aún.

// Inicializa tus objetos si es posible (aunque sea con valores dummy) para prevenir errores en el template.
  effect(() => {
    const isLoggedIn = this.authService.isLoggedInSignal();
    const postPage = this.postsService.pagination()?.current_page;
    this.currentPage.set(1);
    this.showLikes.set(false);
    this._hasLiked.set(this.findLike())
  });

  effect(() => {
    const isLoggedIn = this.authService.isLoggedInSignal();
    const page = this.currentPage();
    const postPage = this.postsService.pagination()?.current_page;

    if (isLoggedIn) {
      this.likeService.getLikesToken(this.post.id , page).subscribe((response)=>{
        this.likesPost.set(response);
      });
    } else {
      this.likeService.getLikes(this.post.id, page).subscribe((response)=>{
        this.likesPost.set(response);
      });
    }
  });
  }

  // Función para avanzar a la siguiente página
  nextPage() {
    const next = this.likesPost()?.next;
    if (next) this.currentPage.update(p => p + 1);
  }

  // Función para retroceder a la página anterior
  previousPage() {
    const prev = this.likesPost()?.previous;
    if (prev) this.currentPage.update(p => p - 1);
  }

  findLike() : boolean {
    const n = this.post.likes_author.length;
    const authorUsername = this.profile?.username;

    for (let i: number = 0; i < n; i++){

      if(authorUsername === this.post.likes_author[i].user){
        return true;
      }
    }
    return false;
  }

  toggleLikesPopover() {
    this.showLikes.update(state => !state);
  }

  likePost() {
    const user = this.profile;
    const post = this.post;
    if (!user || !post) return;
  
    this.likeService.addLike(post.id).subscribe({
      next: () => {
        const currentLikes = this.likesPost();
        if (!currentLikes) return;
  
        const updatedResults = [...currentLikes.results];
        const hasLiked = this._hasLiked();
  
        let newResults: LikesAuthor[];
  
        if (hasLiked) {
          newResults = updatedResults.filter(like => like.user !== user.username);
        } else {
          newResults = [
            ...updatedResults,
            {
              id: Date.now(),
              post: '',
              post_id: post.id,
              user: user.username
            }
          ];
        }
  
        const updatedLikes: LikePaginationResponse = {
          ...currentLikes,
          total_count: newResults.length,
          results: newResults
        };
  
        this.likesPost.set(updatedLikes);
        this._hasLiked.set(!hasLiked);
        this.showLikes.set(false);
      }
    });
  }
}