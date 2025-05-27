import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { EditModeService } from '@services/edit-mode/edit-mode.service';

import { PostsService } from '@services/posts/posts.service';
import { CommentComponent } from '@website/components/comment/comment.component';
import { NavComponent } from '@website/components/nav/nav.component';

@Component({
  selector: 'app-detailpost',
  imports: [CommonModule, NavComponent, CommentComponent],
  templateUrl: './detailpost.component.html',
})
export class DetailpostComponent {

  private route = inject(ActivatedRoute);
  private postsService =  inject(PostsService);
  private authService = inject(AuthService);
  editModeService = inject(EditModeService);
  router = inject(Router);

  postId = signal<string | null>(''); 
  post = this.postsService.post;

  constructor() {
    effect(() => {
      // const isLoggedIn = this.authService.isLoggedInSignal();
      this.postId.set(this.route.snapshot.paramMap.get('id'));
      const id = this.postId();
      this.post.set(null)

      if (id) {
        this.postsService.getPostById(id).subscribe();
      }
    });
  }

  goToEditPost(): void {
    this.editModeService.setEditMode(true);
    this.router.navigate(['/posts', Number(this.postId()), 'edit-post']);
  }
}
