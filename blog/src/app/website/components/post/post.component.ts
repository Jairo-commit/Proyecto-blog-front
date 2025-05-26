import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, inject, Input, signal } from '@angular/core';
import { LikePaginationResponse } from '@models/like.model';

import { Post } from '@models/post.model';
import { AuthService } from '@services/auth/auth.service';
import { LikeService } from '@services/like/like.service';
import { PostsService } from '@services/posts/posts.service';
import { LikesComponent } from '../likes/likes.component';
import { Router } from '@angular/router';
import { EditModeService } from '@services/edit-mode/edit-mode.service';


@Component({
  selector: 'app-post',
  imports: [DatePipe,  CommonModule, LikesComponent],
  templateUrl: './post.component.html',
})
export class PostComponent{

  private likeService = inject(LikeService);
  private authService = inject(AuthService);
  private postsService = inject(PostsService);
  private editModeService = inject(EditModeService);
  
  @Input() post!: Post;

  get postId(): number{
    return this.post.id;
  }

  get permissionLevel(): number {
    return this.post.permission_level;
  }
    
  _hasLiked = signal<boolean>(false);
  showLikes = signal(false);  // Controlamos la visibilidad del popover de likes
  currentPage = signal(1);
  deleting = signal<boolean>(false);

  likesPost = signal<LikePaginationResponse | null>(null);

  get profile() {
    return this.authService.currentUserSignal();
  }
  
  constructor(private router: Router) {
//     Nunca uses @Input() en el constructor.

// Usa ? (optional chaining) o validaciones para evitar acceder a .id si la variable no existe aún.

// Inicializa tus objetos si es posible (aunque sea con valores dummy) para prevenir errores en el template.
  effect(() => {
    // const isLoggedIn = this.authService.isLoggedInSignal();
    const postPage = this.postsService.pagination()?.current_page;
    this.currentPage.set(1);
    this.showLikes.set(false);
    this._hasLiked.set(this.findLike())
  });

  effect(() => {
    const isLoggedIn = this.authService.isLoggedInSignal();
    const page = this.currentPage();
    const postPage = this.postsService.pagination()?.current_page;

      this.likeService.getLikes(this.post.id, page).subscribe((response)=>{
        this.likesPost.set(response);
      });
  });
  }

  goToPostDetail(postId: string | number) {
    this.router.navigate(['/posts', postId]);
  }

  goToEditPost(): void {
    this.editModeService.setEditMode(true);
    this.router.navigate(['/posts', this.postId, 'edit-post']);
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
  
        const hasLiked = this._hasLiked();
  
        let like: 1|-1;
  
        if (hasLiked) {
          like = -1

        } else {
          like = 1
        }

        this.likeService.getLikes(this.post.id, 1).subscribe((response)=>{
          this.likesPost.set(response);
        });
        this._hasLiked.set(!hasLiked);
        this.showLikes.set(false);
      }
    });
  }

  deletePost(){
    this.postsService.eliminate(this.postId).subscribe(
      {
        next: () => {
          this.toggleDeleting();
          this.postsService.triggerRefresh();
        },
        error: (error) =>{
          console.log(error)
        }
      }
    );
  }

  toggleDeleting(){
    this.deleting.set(!this.deleting());
  }
}