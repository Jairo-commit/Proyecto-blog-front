import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostsComponent } from './posts.component';
import { PostsService } from '@services/posts/posts.service';
import { AuthService } from '@services/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Post } from '@models/post.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PostsComponent', () => {
  let component: PostsComponent;
  let fixture: ComponentFixture<PostsComponent>;

  @Component({
    selector: 'app-nav',
    standalone: true,
    template: '<nav>Mock nav</nav>',
  })
  class MockNavComponent {}

  interface Pagination {
    current_page: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
  }

  const mockPostsService = {
    posts: signal([]),
    pagination: signal<Pagination>({
      current_page: 1,
      total_pages: 2,
      next: '2',
      previous: null,
    }),
    currentPage: signal(1),
    refreshTrigger: signal(0),
    getPosts: jasmine.createSpy().and.returnValue(of([])),
  };

  const mockPosts: Post[] = [{
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
  },
  {
    id: 2,
    title: 'Título de prueba2',
    content: 'Contenido del post',
    excerpt: 'Resumen del post',
    author: 'jairo',
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
  }];

  const mockAuthService = {
    currentUserSignal: jasmine.createSpy().and.returnValue({
      id: 0,
      username: 'testuser',
      password: 'contraseña',
    }),
    profile: jasmine.createSpy().and.returnValue(of({
      id: 0,
      username: 'testuser',
      password: 'contraseña',
    })),
    isLoggedInSignal: signal(true),
    currentUser: signal({ id: 0, username: 'testuser', password: 'contraseña' }),
    isLoggingOut: signal(false), 
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsComponent, MockNavComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PostsService, useValue: mockPostsService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: { params: of({}), queryParams: of({}) } 
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostsComponent);
    component = fixture.componentInstance;
    component.posts = signal<Post[]>(mockPosts);
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar getPosts() al inicializar', () => {
    expect(mockPostsService.getPosts).toHaveBeenCalledWith(1);
  });

  it('debería actualizar currentPage con nextPage()', () => {
    component.nextPage();
    expect(mockPostsService.currentPage()).toBe(2);
  });

  it('debería actualizar currentPage con previousPage()', () => {
    mockPostsService.pagination.set(({
    current_page: 1,
    total_pages: 2,
    next: '3',
    previous: '1',
  }),);
    mockPostsService.currentPage.set(2);
    component.previousPage();
    expect(mockPostsService.currentPage()).toBe(1);
  });

  it('debería retornar el usuario actual desde profile', () => {
    const profile = component.profile;
    expect(profile).toEqual({ id:0, username: 'testuser', password: 'contraseña' });
  });

  it('debería reflejar el estado de isLoggedIn', () => {
    expect(component.isLoggedIn()).toBeTrue();
  });

  it('debería renderizar un <app-post> por cada item en posts()', () => {
    fixture.detectChanges();
  
    const postElements = fixture.debugElement.queryAll(By.css('app-post'));
    expect(postElements.length).toBe(2);
  });

  it('debería mostrar el número de página actual y total', () => {
    mockPostsService.pagination.set({ current_page: 2, total_pages: 5, next: 'link', previous: 'link' });
    fixture.detectChanges();
  
    const span = fixture.debugElement.query(By.css('#paginas')).nativeElement;
    expect(span.textContent).toContain('Página 2 de 5');
  });

  it('debería mostrar el botón de crear post si está logueado', () => {
    mockAuthService.isLoggedInSignal = signal(false);
    fixture.detectChanges();
  
    const createBtn = fixture.debugElement.query(By.css('app-create-post-button'));
    expect(createBtn).toBeTruthy();
  });
  
});
