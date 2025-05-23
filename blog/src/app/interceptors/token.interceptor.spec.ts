import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { tokenInterceptor, checkToken } from './token.interceptor';
import { StorageService } from '../services/storage/storage.service';

describe('tokenInterceptor Integration Test', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['getItem']);

    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useValue: storageServiceSpy },
        provideHttpClient(
          withInterceptors([tokenInterceptor])
        ),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should attach Authorization header when CHECK_TOKEN is set and token exists', () => {
    storageServiceSpy.getItem.and.returnValue('mock-token');

    http.get('/api/test', {
      context: checkToken()
    }).subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush({});
  });

  it('should NOT attach Authorization header when CHECK_TOKEN is not set', () => {
    storageServiceSpy.getItem.and.returnValue('mock-token');

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should NOT attach Authorization header if token is missing', () => {
    storageServiceSpy.getItem.and.returnValue(null);

    http.get('/api/test', {
      context: checkToken()
    }).subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
