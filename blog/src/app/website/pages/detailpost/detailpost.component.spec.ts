import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailpostComponent } from './detailpost.component';
import { ActivatedRoute } from '@angular/router';
import { Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PostsService } from '@services/posts/posts.service';
import { AuthService } from '@services/auth/auth.service';

import { Post } from '@models/post.model';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('DetailpostComponent', () => {
  let component: DetailpostComponent;
  let fixture: ComponentFixture<DetailpostComponent>;
  let mockPostSignal: WritableSignal<Post | null>;
  let getPostByIdSpy: jasmine.Spy;

  @Component({
    selector: 'app-nav',
    template: '',
  })
  class MockNavComponent {}
  
  @Component({
    selector: 'app-comment',
    template: '',
  })
  class MockCommentComponent {}

  const mockPost: Post = {
    id: 123,
    title: 'Mock Post Title',
    content: 'This is the full content of the mock post.',
    excerpt: 'This is a short excerpt.',
    author: 'mockuser',
    created_at: '2024-05-01T12:00:00Z',
    updated_at: '2024-05-02T15:30:00Z',
    author_groups: ['admin'],
    public_access: 'read',
    authenticated_access: 'read',
    group_access: 'write',
    author_access: 'write',
    likes_author: [
      { id: 1, post: 'Mock Post Title', post_id: 123, user: 'user1' },
      { id: 2, post: 'Mock Post Title', post_id: 123, user: 'user2' },
    ],
    Comments_author: [
      {
        id: 1,
        user: 'commenter1',
        post: 'Mock Post Title',
        post_id: 123,
        content: 'Great post!',
        created_at: '2024-05-03T10:00:00Z',
      },
      {
        id: 2,
        user: 'commenter2',
        post: 'Mock Post Title',
        post_id: 123,
        content: 'Thanks for sharing.',
        created_at: '2024-05-03T11:00:00Z',
      },
    ],
    permission_level: 3,
  };

  beforeEach(async () => {
    mockPostSignal = signal<Post | null>(mockPost);

    await TestBed.configureTestingModule({
      imports: [CommonModule, MockNavComponent, MockCommentComponent, DetailpostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
        {
          provide: PostsService,
          useValue: {
            post: mockPostSignal,
            getPostById: getPostByIdSpy = jasmine.createSpy().and.returnValue(of(mockPost)),
          },
        },
        {
          provide: AuthService,
          useValue: {
            profile: () => (of({ id: 0,
              username: 'mockuser',
              password: 'contraseña' })), 
            isLoggedInSignal: () => signal(true),
            isLoggingOut: () => false, 
            currentUserSignal: () => signal({ id: 0, username: 'mockuser', team: 'mockteam' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailpostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should extract the postId from the route and call getPostById', () => {
    expect(component.postId()).toBe('123');
    expect(getPostByIdSpy).toHaveBeenCalledOnceWith('123');
  });

  it('should reset the post before calling getPostById', () => {
    expect(mockPostSignal()).toBeNull();
  });

  it('should update the post signal after getPostById returns', () => {
    // simulamos manualmente la actualización (porque el effect ya llamó .subscribe)
    mockPostSignal.set(mockPost);
    expect(component.post()).toEqual(mockPost);
  });
  
  it('should display post data when post is available', () => {
    // actualiza la señal manualmente
    component.post.set(mockPost);
    fixture.detectChanges();
  
    const titleEl = fixture.nativeElement.querySelector('div.text-xl');
    const authorEl = fixture.nativeElement.querySelector('#author');
    const groupEl = fixture.nativeElement.querySelector('#grupos');
    const likesEl = fixture.nativeElement.querySelector('#quantity_likes');
  
    expect(titleEl.textContent).toContain(mockPost.title);
    expect(authorEl.textContent).toContain(mockPost.author);
    expect(groupEl.textContent).toContain(mockPost.author_groups[0]);
    expect(likesEl.textContent).toContain(`${mockPost.likes_author.length}`);
  });

  it('should show "post not found" when post is null', () => {
    component.post.set(null);
    fixture.detectChanges();
  
    const notFoundEl = fixture.nativeElement.querySelector('strong');
    expect(notFoundEl.textContent).toContain('post not found');
  });
  
  it('should display the formatted created_at date', () => {
    component.post.set(mockPost);
    fixture.detectChanges();
  
    const dateEl = fixture.nativeElement.querySelector('.text-neutral-500');
    const expectedDate = new Date(mockPost.created_at).toLocaleDateString(); // formato local por defecto
    expect(dateEl.textContent).toContain('May 1, 2024');
  });
  
  
});