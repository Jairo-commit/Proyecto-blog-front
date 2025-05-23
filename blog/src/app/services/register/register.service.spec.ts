import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { RegisterService } from './register.service';
import { enviroment } from '@enviroments/enviroment';
import { User } from '@models/user.model';

describe('RegisterService', () => {
  let service: RegisterService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'securePassword123'
  };  

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RegisterService
      ]
    });

    service = TestBed.inject(RegisterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should register a new user', () => {
    const username = 'testuser';
    const password = 'securepass';

    service.create(username, password).subscribe((response) => {
      expect(response).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${enviroment.API_URL}api/register/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username, password });

    req.flush(mockUser);
  });

  it('should handle 400 Bad Request on registration', () => {
    const username = '';
    const password = '123'; 

    service.create(username, password).subscribe({
      next: () => fail('Expected a 400 error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.error).toEqual({ detail: 'Invalid input' }); 
      }
    });

    const req = httpMock.expectOne(`${enviroment.API_URL}api/register/`);
    req.flush({ detail: 'Invalid input' }, { status: 400, statusText: 'Bad Request' });
  });
});
