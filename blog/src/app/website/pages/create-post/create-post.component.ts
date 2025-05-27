import { CommonModule, Location } from '@angular/common';
import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { PostDTO } from '@models/post.model';
import { EditModeService } from '@services/edit-mode/edit-mode.service';
import { PostsService } from '@services/posts/posts.service';

import { CustomValidators } from '@validators/custom-validators';
import { NavComponent } from '@website/components/nav/nav.component';

@Component({
  selector: 'app-create-post',
  imports: [NavComponent, CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './create-post.component.html',
})
export class CreatePostComponent{

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, false] }],
      ['link', 'code-block']
    ]
  };
  

  ACCESS_LEVELS: Record<string, number> = {
    'None': 0,
    'Read': 1,
    'Read and Edit': 2
  };
  public currentTeamLevel = this.ACCESS_LEVELS['Read and Edit'];
  public currentAuthLevel = this.ACCESS_LEVELS['Read'];

  private postsService = inject(PostsService);
  private router = inject(Router);
  private location= inject(Location);
  private editModeService = inject(EditModeService);
  private route = inject(ActivatedRoute)
  postForm: FormGroup;
  isEditMode = this.editModeService.isEditMode;

  postId = signal<string | null>(null);
  post = this.postsService.post; 
  public readonly authorOptions = [{value: 'Read and Edit', label : 'Read and Write'}];
  public readonly publicOptions = [
    {value: 'None', label : 'None'},
    {value: 'Read', label : 'Read only'} 
  ];  
  public readonly permissionOptions = [
    {value: 'None', label : 'None'},
    {value: 'Read', label : 'Read only'},
    {value: 'Read and Edit', label : 'Read and Write'},
  ];

  constructor(private fb: FormBuilder) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      public_access: ['Read', Validators.required],
      authenticated_access: ['Read', Validators.required],
      group_access: ['Read and Edit', Validators.required],
      author_access: ['Read and Edit', Validators.required]
    },
    {
      validators: [CustomValidators.permissionHierarchyValidator()]
    }
  );
  this.postForm.get('group_access')?.valueChanges.subscribe(groupValue => {
    this.currentTeamLevel = this.ACCESS_LEVELS[groupValue] ?? 0;
    this.adjustAccessFromGroup();
  });

  this.postForm.get('authenticated_access')?.valueChanges.subscribe(authValue => {
    this.currentAuthLevel = this.ACCESS_LEVELS[authValue] ?? 0;
    this.adjustAccessFromAuth();
  });

  effect(() => {
    const isEditing = this.isEditMode();
    const id = this.route.snapshot.paramMap.get('id');
    this.postId.set(id);
  
    if (isEditing && id) {
      this.postsService.getPostById(id).subscribe({
        next: (post) => {
          this.postForm.patchValue({
            title: post.title,
            content: post.content,
            public_access: post.public_access,
            authenticated_access: post.authenticated_access,
            group_access: post.group_access,
            author_access: post.author_access
          });
        },
        error: (err) => {
          console.error('❌ Error al cargar el post:', err);
          alert('❌ No se pudo cargar el post');
          this.router.navigate(['/posts']);
        }
      });
    }
  });
  }
  
  adjustAccessFromGroup(): void {
    const authCtrl = this.postForm.get('authenticated_access');
    const pubCtrl = this.postForm.get('public_access');

    const authLevel = this.ACCESS_LEVELS[authCtrl?.value] ?? 0;
  
    // Si auth actual > group, bájalo
    if (authLevel > this.currentTeamLevel) {
      authCtrl?.setValue(this.getAccessLabel(this.currentTeamLevel));
    }
  
    // Si public actual > group, bájalo
    const pubLevel = this.ACCESS_LEVELS[pubCtrl?.value] ?? 0;
    if (pubLevel > this.currentTeamLevel) {
      pubCtrl?.setValue(this.getAccessLabel(this.currentTeamLevel));
    }
  }
  
  adjustAccessFromAuth(): void {
    const pubCtrl = this.postForm.get('public_access');
    const pubLevel = this.ACCESS_LEVELS[pubCtrl?.value] ?? 0;
  
    if (pubLevel > this.currentAuthLevel) {
      pubCtrl?.setValue(this.getAccessLabel(this.currentAuthLevel));
    }
  }
  
  getAccessLabel(level: number): string {
    return Object.entries(this.ACCESS_LEVELS).find(([_, v]) => v === level)?.[0] ?? 'None';
  }  
  

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }
  
    const postData: PostDTO = this.postForm.value;
  
    if (this.isEditMode() && this.postId()) {
      // 🛠 Modo edición
      this.postsService.update(this.postId()!, postData).subscribe({
        next: () => {
          alert('✅ Post actualizado exitosamente');
          this.router.navigate(['/posts', this.postId()]);
        },
        error: (err) => {
          console.error('❌ Error al actualizar el post:', err);
          alert('❌ Hubo un error al actualizar el post');
        }
      });
  
    } else {
      // 🆕 Modo creación
      this.postsService.create(postData).subscribe({
        next: () => {
          alert('✅ Post creado exitosamente');
          this.router.navigate(['/posts']);
        },
        error: (err) => {
          console.error('❌ Error al crear el post:', err);
          alert('❌ Hubo un error al crear el post');
        }
      });
    }
  }

  onCancel(): void {
    this.location.back();
  }
}