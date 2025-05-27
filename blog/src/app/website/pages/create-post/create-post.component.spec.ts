import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CreatePostComponent } from './create-post.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { Component, signal } from '@angular/core';

import { PostsService } from '@services/posts/posts.service';
import { EditModeService } from '@services/edit-mode/edit-mode.service';
import { Post, PostDTO } from '@models/post.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { QuillModule } from 'ngx-quill';

describe('CreatePostComponent', () => {
  let component: CreatePostComponent;
  let fixture: ComponentFixture<CreatePostComponent>;

  let postsService: jasmine.SpyObj<PostsService>;
  let editModeService: EditModeService;
  let router: Router;


  @Component({
    selector: 'app-nav',
    standalone: true,
    template: ''
  })
  class MockNavComponent {}

    @Component({
    selector: 'dummy-component',
    standalone: true,
    template: ''
  })
  class DummyComponent {}

  const mockPostDTO: PostDTO = {
    title: 'Sample Post',
    content: '<p>This is a sample post content</p>',
    public_access: 'Read',
    authenticated_access: 'Read',
    group_access: 'Read and Edit',
    author_access: 'Read and Edit',
  };

  const mockPost: Post = {
      id: 1,
      title: 'Título de prueba',
      content: 'Contenido del post',
      excerpt: 'Resumen del post',
      author: 'jose',
      created_at: '2025-05-26T12:00:00Z',
      updated_at: '2025-05-26T12:00:00Z',
      author_groups: ['team1'],
      public_access: '1',
      authenticated_access: '1',
      group_access: '2',
      author_access: '2',
      likes_author: [],
      Comments_author: [],
      permission_level: 3
    }

  beforeEach(async () => {
  postsService = jasmine.createSpyObj('PostsService', ['create', 'update', 'getPostById'], {
    post: signal(null),
  });

  postsService.getPostById.and.returnValue(of(mockPost));

  await TestBed.configureTestingModule({
    imports: [
      RouterModule.forRoot([
    { path: 'posts', component: DummyComponent } 
  ]),

      ReactiveFormsModule,
      CreatePostComponent,
      MockNavComponent,
      DummyComponent,
      QuillModule.forRoot(),
    ],
    providers: [
      Location,
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: EditModeService,
        useClass: EditModeService
      },
      FormBuilder,
      { provide: PostsService, useValue: postsService },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: {
              get: () => '123',
            },
          },
        },
      },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(CreatePostComponent);
  component = fixture.componentInstance;
  router = TestBed.inject(Router);
  spyOn(router, 'navigate');
  editModeService = TestBed.inject(EditModeService);
  editModeService.setEditMode(true); 
  fixture.detectChanges(); 
});

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call create() and navigate when form is valid and not in edit mode', fakeAsync(() => {
    editModeService.setEditMode(false);
    postsService.create.and.returnValue(of(mockPostDTO));

    component.postForm.setValue({
      title: 'New Post',
      content: 'New content',
      public_access: 'Read',
      authenticated_access: 'Read',
      group_access: 'Read and Edit',
      author_access: 'Read and Edit',
    });

    component.onSubmit();
    tick()

    expect(postsService.create).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'New Post',
      content: 'New content',
      public_access: 'Read',
      authenticated_access: 'Read',
      group_access: 'Read and Edit',
      author_access: 'Read and Edit',
    }));
    expect(router.navigate).toHaveBeenCalledWith(['/posts']);
  }));

  it('should call update() and navigate when form is valid and in edit mode', () => {
    editModeService.setEditMode(true);
    postsService.update.and.returnValue(of({mockPostDTO}));
    component.postId.set('123');

    component.postForm.setValue({
      title: 'Updated Post',
      content: 'Updated content',
      public_access: 'Read',
      authenticated_access: 'Read',
      group_access: 'Read and Edit',
      author_access: 'Read and Edit',
    });

    component.onSubmit();

    expect(postsService.update).toHaveBeenCalledWith('123', jasmine.objectContaining({
      title: 'Updated Post',
      content: 'Updated content',
    }));
    expect(router.navigate).toHaveBeenCalledWith(['/posts', '123']);
  });

  it('should mark form as touched when invalid and onSubmit is called', () => {
    spyOn(component.postForm, 'markAllAsTouched');

    component.postForm.get('title')?.setValue('');
    component.postForm.get('content')?.setValue('');

    component.onSubmit();

    expect(component.postForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('should alert and log error if create fails', () => {
    editModeService.setEditMode(false);
    spyOn(window, 'alert');
    spyOn(console, 'error');
    postsService.create.and.returnValue(throwError(() => new Error('Create failed')));

    component.postForm.setValue({
      title: 'Test title',
      content: 'Test content',
      public_access: 'Read',
      authenticated_access: 'Read',
      group_access: 'Read and Edit',
      author_access: 'Read and Edit',
    });

    component.onSubmit();

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('❌ Hubo un error al crear el post');
  });

  it('should adjust currentTeamLevel and call adjustAccessFromGroup when group_access changes', () => {
  const adjustAccessSpy = spyOn(component as any, 'adjustAccessFromGroup');
  const control = component.postForm.get('group_access');

  control?.setValue('Read');

  expect(component.currentTeamLevel).toBe(component.ACCESS_LEVELS['Read']);
  expect(adjustAccessSpy).toHaveBeenCalled();
});

  it('should display a <textarea> for content when not in edit mode', () => {
  editModeService.setEditMode(false);
  fixture.detectChanges();

  const textarea = fixture.nativeElement.querySelector('textarea[formControlName="content"]');
  const quill = fixture.nativeElement.querySelector('quill-editor');

  expect(textarea).toBeTruthy();
  expect(quill).toBeFalsy();
  });

  it('should display a <quill-editor> for content when in edit mode', () => {
    editModeService.setEditMode(true);
    fixture.detectChanges();

    const quill = fixture.nativeElement.querySelector('quill-editor');
    const textarea = fixture.nativeElement.querySelector('textarea[formControlName="content"]');

    expect(quill).toBeTruthy();
    expect(textarea).toBeFalsy();
  });

  it('should show error message when title is invalid and touched', () => {
    const titleControl = component.postForm.get('title');
    titleControl?.markAsTouched();
    titleControl?.setValue('');
    fixture.detectChanges();

    const errorMsg = fixture.nativeElement.querySelector('div.text-red-400');
    expect(errorMsg?.textContent).toContain('Title is required');
  });

  it('should call onCancel when Cancel button is clicked', () => {
  const cancelSpy = spyOn(component, 'onCancel');
  fixture.detectChanges();

  const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
  cancelButton.click();

  expect(cancelSpy).toHaveBeenCalled();
});

});
