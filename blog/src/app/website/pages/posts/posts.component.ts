import { Component, inject, signal, effect } from '@angular/core';

import { NavComponent } from '@website/components/nav/nav.component';
import { PostComponent } from '@website/components/post/post.component';
import { CommonModule } from '@angular/common';

import { PostsService } from '@services/posts/posts.service';
import { AuthService } from '@services/auth/auth.service';
import { LikeService } from '@services/like/like.service';

@Component({
  selector: 'app-posts',
  imports: [NavComponent, PostComponent, CommonModule],
  templateUrl: './posts.component.html',
})
export class PostsComponent {
  private authService = inject(AuthService);
  private postService = inject(PostsService);

  posts = this.postService.posts;
  pagination = this.postService.pagination;

  currentPage = signal(1); // para poder navegar entre páginas

  constructor() {
    effect(() => {
      const isLoggedIn = this.authService.isLoggedInSignal();
      const page = this.currentPage();

      if (isLoggedIn) {
        this.postService.getPostsToken(page).subscribe();
      } else {
        this.postService.getPosts(page).subscribe();
      }
    });
  }

  nextPage() {
    const next = this.pagination()?.next;
    if (next) this.currentPage.update(p => p + 1);
  }

  previousPage() {
    const prev = this.pagination()?.previous;
    if (prev) this.currentPage.update(p => p - 1);
  }
}
