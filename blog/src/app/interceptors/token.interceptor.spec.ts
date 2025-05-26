import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { tokenInterceptor } from './token.interceptor';
import { StorageService } from '../services/storage/storage.service';
import { of, throwError } from 'rxjs';
import { AuthService } from '@services/auth/auth.service';

describe('tokenInterceptor Integration Test', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  const storageServiceMock = {
    getItem: jasmine.createSpy('getItem').and.callFake((key: string) => {
      if (key === 'access') return 'access-token';
      if (key === 'refresh') return 'refresh-token';
      return null;
    })
  };

  const authServiceMock = {
    refresh: jasmine.createSpy('refresh').and.returnValue(of({ access: 'newAccessToken' })),
    clearSession: jasmine.createSpy('clearSession')
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useValue: storageServiceMock },
        { provide: AuthService, useValue: authServiceMock },
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

  it('should add access token to headers for normal requests', () => {
    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-token');
    req.flush({});
  });

  it('should add refresh token to headers for refresh requests', () => {
    http.post('/api/token/refresh/', {}).subscribe();

    const req = httpMock.expectOne('/api/token/refresh/');
    expect(req.request.headers.get('Authorization')).toBe('Bearer refresh-token');
    req.flush({});
  });

  it('should retry request with new access token after 401 and refresh', () => {
    http.get('/api/data').subscribe({
      next: (res) => {
        expect(res).toEqual({ ok: true });
      },
      error: () => fail('should have retried and succeeded')
    });
  
    // Primera request con token viejo
    const req1 = httpMock.expectOne('/api/data');
    expect(req1.request.headers.get('Authorization')).toBe('Bearer access-token');
  
    // Simula que falló con 401
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });
  
    // Segunda request con token nuevo (tras refresh)
    const req2 = httpMock.expectOne('/api/data');
    expect(req2.request.headers.get('Authorization')).toBe('Bearer newAccessToken');
  
    // Simula respuesta exitosa del backend
    req2.flush({ ok: true });
  
    expect(authServiceMock.refresh).toHaveBeenCalled();
  }); 
  
});
