import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { NavComponent } from '@website/components/nav/nav.component';

@Component({
  selector: 'app-create-post',
  imports: [NavComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent{

  postForm: FormGroup;

  public readonly authorOptions = [{value: 'Read and Edit', label : 'Read and Write'}];
  public readonly publicOptions = [
    {value: 'None', label : 'None'},
    {value: 'Read', label : 'Read only'} 
  ];  
  public readonly permissionOptions = [
    {value: 'None', label : 'None'},
    {value: 'Read', label : 'Read only'},
    {value: 'None', label : 'None'},
  ];

  constructor(private fb: FormBuilder) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      public_access: ['Read Only', Validators.required],
      authenticated_access: ['Read Only', Validators.required],
      group_access: ['Read and Write', Validators.required],
      author_access: ['Read and Write', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      console.log('Post creado:', this.postForm.value);
      // Aquí iría la llamada al servicio backend
    } else {
      this.postForm.markAllAsTouched();
    }
  }
}
