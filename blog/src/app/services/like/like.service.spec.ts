import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LikeService } from './like.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { enviroment } from '@enviroments/enviroment';
import { LikePaginationResponse } from '@models/like.model';

describe('LikeService', () => {
  let service: LikeService;
  let httpMock: HttpTestingController;

  const mockLikeResponse: LikePaginationResponse = {
    current_page: 1,
    total_pages: 1,
    total_count: 2,
    next: null,
    previous: null,
    results: [
      {
        id: 1,
        post: 'titulo del post',
        post_id: 123,
        user: 'test'
      },
      {
        id: 2,
        post: 'fake post',
        post_id: 123,
        user: 'test'
      }
    ]
  };
  
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LikeService
      ]
    });

    service = TestBed.inject(LikeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch likes without token', () => {
    service.getLikes(123, 1).subscribe(response => {
      expect(response).toEqual(mockLikeResponse);
    });

    const req = httpMock.expectOne(`http://127.0.0.1:8000/api/likes/?post_id=123&page=1`);
    expect(req.request.method).toBe('GET');

    req.flush(mockLikeResponse);
  });

  it('should fetch likes with token context', () => {
    service.getLikes(123, 2).subscribe(response => {
      expect(response).toEqual(mockLikeResponse);
    });

    const req = httpMock.expectOne(`http://127.0.0.1:8000/api/likes/?post_id=123&page=2`);
    expect(req.request.method).toBe('GET');
    expect(req.request.context).toBeTruthy(); // verifica que haya context (checkToken)

    req.flush(mockLikeResponse);
  });

  it('should send a like request', () => {
    const postId = 123;

    service.addLike(postId).subscribe(response => {
      expect(response).toBeTruthy(); // podrías mejorar según la respuesta real del backend
    });

    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/${postId}/giving_like/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    expect(req.request.context).toBeTruthy();

    req.flush({ success: true });
  });

  it('should handle error when fetching likes without token', () => {
    service.getLikes(123).subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });
  
    const req = httpMock.expectOne(`http://127.0.0.1:8000/api/likes/?post_id=123&page=1`);
    req.flush({ detail: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
  });
  
  it('should handle unauthorized error when fetching likes with token', () => {
    service.getLikes(123).subscribe({
      next: () => fail('Expected a 401 error'),
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });
  
    const req = httpMock.expectOne(`http://127.0.0.1:8000/api/likes/?post_id=123&page=1`);
    req.flush({ detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
  
  it('should handle forbidden error when adding like', () => {
    const postId = 123;
  
    service.addLike(postId).subscribe({
      next: () => fail('Expected a 403 error'),
      error: (error) => {
        expect(error.status).toBe(403);
      }
    });
  
    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/${postId}/giving_like/`);
    req.flush({ detail: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
  });
  
});
