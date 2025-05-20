import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { StorageService } from '@services/storage/storage.service';
import { Token } from '@models/token.model';
import { User } from '@models/user.model';
import { enviroment } from '@enviroments/enviroment';
import { response } from 'express';

describe('AuthService', () => {

  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockStorageService: jasmine.SpyObj<StorageService>;

  const mockToken: Token = {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token'
  };

  const mockUser: User = {
    id: 1,
    username: 'testuser@example.com',
    password: '123'
  };

  beforeEach(() => {
    mockStorageService = jasmine.createSpyObj('StorageService', 
      ['saveToken', 'isValidToken', 'getItem']);
    mockStorageService.isValidToken.and.returnValue(false);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),              // ✅ requerido con `provideHttpClientTesting`
        provideHttpClientTesting(),       // ✅ la forma moderna correcta
        { provide: StorageService, useValue: mockStorageService },
        AuthService
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Asegura que no quedaron requests pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be logged successfully', fakeAsync(() => {
    let resultUser: User | undefined;
  
    // Ejecuta login y captura el resultado
    service.login(mockUser.username, mockUser.password).subscribe(user => {
      resultUser = user;
    });
  
    // Simula respuesta del POST /api/token/
    const loginReq = httpMock.expectOne('http://127.0.0.1:8000/api/token/');
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush(mockToken);
  
    // Simula respuesta del GET /api/me/
    const profileReq = httpMock.expectOne('http://127.0.0.1:8000/api/me/');
    expect(profileReq.request.method).toBe('GET');
    profileReq.flush(mockUser);
  
    // Procesa todos los observables asincrónicos
    flushMicrotasks();
  
    // ✅ Verificaciones
    expect(resultUser).toEqual(mockUser);
    expect(mockStorageService.saveToken).toHaveBeenCalledWith('access', mockToken.access);
    expect(mockStorageService.saveToken).toHaveBeenCalledWith('refresh', mockToken.refresh);
    expect(service.isLoggedInSignal()).toBeTrue();
    expect(service.currentUserSignal()).toEqual(mockUser);
  }));
  
  it('should fail login with invalid credentials', fakeAsync(() => {
    let errorResponse: any;
  
    service.login('invalid', 'wrong').subscribe({
      next: () => {},
      error: err => {
        errorResponse = err;
      }
    });
  
    const req = httpMock.expectOne('http://127.0.0.1:8000/api/token/');
    req.flush({ detail: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
  
    flushMicrotasks();
  
    expect(mockStorageService.saveToken).not.toHaveBeenCalled();
    expect(service.isLoggedInSignal()).toBeFalse();
    expect(service.currentUserSignal()).toBeNull();
    expect(errorResponse.status).toBe(401);
  }));
  
  it('should retrieve profile successfully', () => {
    let receivedUser: User | undefined;
  
    service.profile().subscribe(user => {
      receivedUser = user;
    });
  
    const req = httpMock.expectOne('http://127.0.0.1:8000/api/me/');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  
    expect(receivedUser).toEqual(mockUser);
  });

  it('should not fetch profile if token is invalid on init', fakeAsync(() => {
    // Simulamos que hay un token almacenado, pero inválido
    mockStorageService.getItem.and.callFake((key: string) => {
      if (key === 'access') return 'fake-access-token';
      return null;
    });
    mockStorageService.isValidToken.and.returnValue(false); // token inválido
  
    // Inicializamos el servicio (esto debería disparar la comprobación del token)
    const service = TestBed.inject(AuthService);
  
    // No debe hacer la petición al perfil
    httpMock.expectNone('http://127.0.0.1:8000/api/me/');
  
    flushMicrotasks();
  
    // Verificaciones del estado del servicio
    expect(service.isLoggedInSignal()).toBeFalse();
    expect(service.currentUserSignal()).toBeNull();
  }));
});
