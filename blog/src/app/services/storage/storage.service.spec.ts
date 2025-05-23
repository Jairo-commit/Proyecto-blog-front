import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { PLATFORM_ID } from '@angular/core';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(StorageService);
    localStorage.clear(); // Limpieza por si acaso
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveToken', () => {
    it('should save a token in localStorage if on browser', () => {
      service.saveToken('access', 'test-token');
      expect(localStorage.getItem('access')).toBe('test-token');
    });
  });

  describe('getItem', () => {
    it('should return value from localStorage if key exists', () => {
      localStorage.setItem('access', 'stored-token');
      expect(service.getItem('access')).toBe('stored-token');
    });

    it('should return null if key does not exist', () => {
      expect(service.getItem('nonexistent')).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove an item from localStorage', () => {
      localStorage.setItem('access', 'value');
      service.removeItem('access');
      expect(localStorage.getItem('access')).toBeNull();
    });
  });

  describe('isValidToken', () => {
    it('should return true for valid (non-expired) token', () => {
      const expTime = Math.floor(Date.now() / 1000) + 60; // 1 min future
      const validToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' +
                         btoa(JSON.stringify({ exp: expTime })) + '.' +
                         btoa('signature');

      service.saveToken('access', validToken);
      expect(service.isValidToken()).toBeTrue();
    });

    it('should return false if no token is found', () => {
      expect(service.isValidToken()).toBeFalse();
    });

    it('should return false for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 60;
      const expiredToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' +
                           btoa(JSON.stringify({ exp: pastTime })) + '.' +
                           btoa('signature');

      service.saveToken('access', expiredToken);
      expect(service.isValidToken()).toBeFalse();
    });

    it('should return false for token without exp field', () => {
      const noExpToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' +
                         btoa(JSON.stringify({})) + '.' +
                         btoa('signature');

      service.saveToken('access', noExpToken);
      expect(service.isValidToken()).toBeFalse();
    });
  });
});
