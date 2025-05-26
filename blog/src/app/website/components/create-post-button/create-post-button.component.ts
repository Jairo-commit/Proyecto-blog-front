import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EditModeService } from '@services/edit-mode/edit-mode.service';

@Component({
  selector: 'app-create-post-button',
  imports: [RouterLink],
  templateUrl: './create-post-button.component.html',
})
export class CreatePostButtonComponent {

  editModeService = inject(EditModeService);

  goToPostCreation(): void {
    this.editModeService.setEditMode(false);
  }
}
