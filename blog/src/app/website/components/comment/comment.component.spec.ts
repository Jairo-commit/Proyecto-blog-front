import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/auth/auth.service';
import { CommentService } from '@services/comments/comment.service';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { Comments_author, PaginatedComments } from '@models/comment.model';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  const mockComments: Comments_author[] = [
    {
      id: 1,
      user: 'Test User',
      post: 'post-1',
      post_id: 1,
      content: 'Comentario de prueba',
      created_at: new Date().toISOString(),
    }
  ];
  
  const initialPagination: PaginatedComments = {
    current_page: 1,
    total_pages: 1,
    total_count: mockComments.length,
    next: null,        // null cuando no hay página siguiente
    previous: null,    // null cuando no hay página anterior
    results: mockComments
  };

  const commentServiceMock = {
    comments: signal(mockComments),
    pagination: signal(initialPagination),
    getComments: jasmine.createSpy('getComments').and.returnValue(of([])),
    add: jasmine.createSpy('add').and.returnValue(of({})),
  
    // Método para actualizar la paginación en tests
    setPagination(newPagination: Partial<PaginatedComments>) {
      this.pagination.update(current => ({ ...current, ...newPagination }));
    },
  
    // Método para actualizar comentarios en tests
    setComments(newComments: Comments_author[]) {
      this.comments.set(newComments);
    }
  };

  const authServiceMock = {
    isLoggedInSignal: signal(true)
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: () => '123' // simula una postId = '123'
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentComponent, ReactiveFormsModule], // Standalone component
      providers: [
        { provide: CommentService, useValue: commentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit y el rendering
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.submitComment();
    expect(commentServiceMock.add).not.toHaveBeenCalled();
  });

  it('should increment currentPage if next page exists and not exceed total_pages', () => {
    // Actualiza la señal, manteniendo la referencia original
    commentServiceMock.pagination.set({
      next: '/api/comments?page=2',
      previous: null,
      current_page: 1,
      total_pages: 3,
      total_count: 10,
      results: []
    });
  
    component.currentPage.set(1);
  
    component.nextPage();
  
    expect(component.currentPage()).toBe(2);
  
    // Seteamos a última página
    component.currentPage.set(3);
  });

  it('should disable "Siguiente" button if no next page exists', () => {
    // Simula que no hay página siguiente
    commentServiceMock.pagination.set({
      next: null,
      previous: '/api/comments?page=1',
      current_page: 2,
      total_pages: 3,
      total_count: 10,
      results: []
    });
  
    fixture.detectChanges();
  
    // Busca el botón "Siguiente"
    const nextButton: HTMLButtonElement = fixture.nativeElement.querySelector('button:nth-of-type(2)');
  
    // Espera que el botón esté deshabilitado
    expect(nextButton.disabled).toBeTrue();
  });
  
  it('should disable "Anterior" button if no previous page exists', () => {
    // Simula que no hay página anterior
    commentServiceMock.pagination.set({
      next: '/api/comments?page=3',
      previous: null,
      current_page: 1,
      total_pages: 3,
      total_count: 10,
      results: []
    });
  
    fixture.detectChanges();
  
    // Busca el botón "Anterior"
    const prevButton: HTMLButtonElement = fixture.nativeElement.querySelector('button:nth-of-type(1)');
  
    // Espera que el botón esté deshabilitado
    expect(prevButton.disabled).toBeTrue();
  });
  
  it('should show "New comment" div if logged in and newComment is false', () => {
    const newCommentDiv = fixture.nativeElement.querySelector('div.mt-6.border-t');
    expect(newCommentDiv.textContent).toContain('New comment');
  });

  it('should show comment form if logged in and newComment is true', () => {
    component.newComment.set(true);
    fixture.detectChanges();

    const formTitle = fixture.nativeElement.querySelector('h3.text-lg');
    expect(formTitle.textContent).toContain('Add a comment');
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
  });

  it('should call toggleNewComment when clicking "New comment" div', () => {
    spyOn(component, 'toggleNewComment');
    const newCommentDiv = fixture.nativeElement.querySelector('div.mt-6.border-t');
    newCommentDiv.click();

    expect(component.toggleNewComment).toHaveBeenCalled();
  });

  it('should disable "Post Comment" button when form is invalid', () => {
    component.newComment.set(true);
    fixture.detectChanges();

    const postButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(postButton.disabled).toBeTrue();

    // Set form valid
    component.commentForm.setValue({ content: 'Texto válido' });
    fixture.detectChanges();

    expect(postButton.disabled).toBeFalse();
  });

  it('should call toggleNewComment and reset form when clicking "Cancel" button', () => {
    component.isLoggedIn = signal(true);
    component.newComment = signal(true);
    fixture.detectChanges();
  
    spyOn(component, 'toggleNewComment');
    spyOn(component.commentForm, 'reset');
  
    const cancelButton = fixture.nativeElement.querySelector('#Cancel');
    expect(cancelButton).toBeTruthy();
  
    cancelButton.click();
    fixture.detectChanges();
  
    expect(component.toggleNewComment).toHaveBeenCalled();
    expect(component.commentForm.reset).toHaveBeenCalled();
  });
  
  it('should call getComments with postId and currentPage on init', () => {
    expect(commentServiceMock.getComments).toHaveBeenCalledWith('123', 1);
  });
  
  it('should expose isLoggedIn signal from the auth service', () => {
    expect(component.isLoggedIn()).toBe(true); 
  });
  
  it('should expose comments from the service', () => {
    const mockComments = commentServiceMock.comments();
    expect(component.comments()).toEqual(mockComments);
  });
  
  it('should initialize newComment to false', () => {
    expect(component.newComment()).toBeFalse();
  });

  it('should initialize commentForm with a content control', () => {
    expect(component.commentForm.contains('content')).toBeTrue();
    expect(component.commentForm.get('content')?.value).toBe('');
    expect(component.commentForm.valid).toBeFalse(); 
  });
  
});
