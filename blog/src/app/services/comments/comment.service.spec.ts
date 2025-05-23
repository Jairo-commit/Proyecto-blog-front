import { TestBed } from '@angular/core/testing';

import { CommentService } from './comment.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Comments_author, PaginatedComments } from '@models/comment.model';
import { enviroment } from '@enviroments/enviroment';

describe('CommentService', () => {
    let service: CommentService;
    let httpMock: HttpTestingController;
  
    const mockComments: Comments_author[] = [
      {
        id: 1,
        user: 'User 1',
        post: 'post-slug-1',
        post_id: 101,
        content: 'Comentario 1',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        user: 'User 2',
        post: 'post-slug-2',
        post_id: 102,
        content: 'Comentario 2',
        created_at: new Date().toISOString()
      }
    ];

    const paginatedResponseWithNextPrev: PaginatedComments = {
      current_page: 2,
      total_pages: 3,
      total_count: 6,
      next: `${enviroment.API_URL}api/post/123/comments/?page=3`,
      previous: `${enviroment.API_URL}api/post/123/comments/?page=1`,
      results: mockComments
    };
    
  
    const mockPaginatedResponse: PaginatedComments = {
      current_page: 1,
      total_pages: 1,
      total_count: 2,
      next: null,
      previous: null,
      results: mockComments
    };
    
  
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          CommentService
        ]
      });
  
      service = TestBed.inject(CommentService);
      httpMock = TestBed.inject(HttpTestingController);
    });
  
    afterEach(() => {
      httpMock.verify(); // Verifica que no haya llamadas pendientes
    });
  
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

      it('should fetch comments and update signals', () => {
    const postId = '123';

    service.getComments(postId).subscribe(response => {
      expect(response).toEqual(mockPaginatedResponse);
    });

    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/${postId}/comments/?page=1`);
    expect(req.request.method).toBe('GET');

    // Simula la respuesta
    req.flush(mockPaginatedResponse);

    // Verifica actualización de señales
    expect(service.comments()).toEqual(mockComments);
    expect(service.pagination()).toEqual({
      current_page: 1,
      total_pages: 1,
      total_count: 2,
      next: null,
      previous: null
    });
    
  });

    it('should post a new comment', () => {
    const comment = { content: 'Nuevo comentario' };
    const postId = '456';
    const mockResponse: Comments_author = {
      id: 3,
      user: 'User nuevo',
      post: 'post-slug-nuevo',
      post_id: 103,
      content: 'Comentario 3',
      created_at: new Date().toISOString()
    };

    service.add(comment, postId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/${postId}/add-comment/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(comment);

    req.flush(mockResponse);
  });

  it('should handle paginated response with next and previous', () => {
    const postId = '123';
  
    service.getComments(postId, 2).subscribe(response => {
      expect(response).toEqual(paginatedResponseWithNextPrev);
    });
  
    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/${postId}/comments/?page=2`);
    expect(req.request.method).toBe('GET');
  
    req.flush(paginatedResponseWithNextPrev);
  
    // Verifica que las señales estén actualizadas correctamente
    expect(service.comments()).toEqual(mockComments);
    expect(service.pagination()).toEqual({
      current_page: 2,
      total_pages: 3,
      total_count: 6,
      next: `${enviroment.API_URL}api/post/123/comments/?page=3`,
      previous: `${enviroment.API_URL}api/post/123/comments/?page=1`
    });
  });
  
  
});
