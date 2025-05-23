import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { CommentService } from '@services/comments/comment.service';

@Component({
  selector: 'app-comment',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comment.component.html',
})
export class CommentComponent {

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private commentService = inject(CommentService)
  private fb = inject(FormBuilder);

  postId = signal<string | null>(''); 
  comments = this.commentService.comments; 
  pagination = this.commentService.pagination;
  isLoggedIn = this.authService.isLoggedInSignal;

  currentPage = signal(1);
  newComment = signal<boolean>(false);

  commentForm!: FormGroup;

  constructor() {
    effect(() => {
      const isLoggedIn = this.authService.isLoggedInSignal;
      this.postId.set(this.route.snapshot.paramMap.get('id'));
      const id = this.postId();
      const page = this.currentPage();

      if (id) {
        this.commentService.getComments(id, page).subscribe();
      } 
    });
    this.commentForm = this.fb.group({
      content: ['', [Validators.required]]
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

  submitComment() {
    if (this.commentForm.invalid || !this.postId()) return;
    
    const id = this.postId()!;
    const commentData = {
      content: this.commentForm.value.content,
    };
  
    this.commentService.add(commentData, id).subscribe({
      next: (res) => {
        this.commentService.getComments(id, 1).subscribe();
        this.commentForm.reset();
      },
      error: (err) => {
        console.error('Error al enviar comentario:', err);
      }
    });
  }

  toggleNewComment(){
    this.newComment.set(!this.newComment());
  }
  
}
