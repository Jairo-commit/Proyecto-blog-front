import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LikesAuthor } from '@models/post.model';

@Component({
  selector: 'app-likes',
  imports: [CommonModule],
  templateUrl: './likes.component.html',
})
export class LikesComponent {
  @Input() likes!: LikesAuthor;   //likes del post

}
