import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { RegisterService } from '../../../services/register/register.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockRegisterService: jasmine.SpyObj<RegisterService>;
  let mockRouter: any;

  beforeEach(async () => {
    mockRegisterService = jasmine.createSpyObj(
      'RegisterService', ['create']
    )

    mockRouter = {
      navigate: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, CommonModule],
      providers: [
        FormBuilder,
        provideRouter([{ path: 'login', component: LoginComponent }]),
        { provide: RegisterService, useValue: mockRegisterService },
      ]
    }).compileComponents();

    mockRouter = TestBed.inject(Router);
    spyOn(mockRouter, 'navigate');  // ✅ Hacemos spy al método real
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería marcar el formulario como inválido si está vacío', () => {
    expect(component.registerForm.invalid).toBeTrue();
  });

  it('debería no llamar al servicio si el formulario es inválido', () => {
    component.createUser();
    expect(mockRegisterService.create).not.toHaveBeenCalled();
  });

  it('debería llamar al servicio y navegar al login si el formulario es válido', fakeAsync(() => {
    component.registerForm.setValue({
      username: 'test@email.com',
      password: '123456',
      confirmPassword: '123456'
    });

    mockRegisterService.create.and.returnValue(of({id: 0, username: 'test@email.com', password: '123456'}));

    component.createUser();
    tick();

    expect(mockRegisterService.create).toHaveBeenCalledWith('test@email.com', '123456');
    expect(component.status).toBe('success');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { registered: 'true' } });
  }));

  it('debería manejar errores del servidor y mostrar mensaje si el status es 400', fakeAsync(() => {
    const serverError = {
      status: 400,
      error: { username: 'Este correo ya está en uso' }
    };

    component.registerForm.setValue({
      username: 'test@email.com',
      password: '123456',
      confirmPassword: '123456'
    });

    mockRegisterService.create.and.returnValue(throwError(() => serverError));

    component.createUser();
    tick();

    expect(component.status).toBe('failed');
    expect(component.serverErrors).toEqual(serverError.error);
  }));

  it('debería marcar `tried` como true al intentar crear usuario', () => {
    component.createUser();
    expect(component.tried).toBeTrue();
  });

  it('debería mostrar el título "Create an account"', () => {
    const titleEl = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(titleEl.textContent.trim()).toBe('Create an account');
  });

  it('debería tener campos de email, password y confirmPassword', () => {
    const emailInput = fixture.debugElement.query(By.css('input#username'));
    const passInput = fixture.debugElement.query(By.css('input#password'));
    const confirmInput = fixture.debugElement.query(By.css('input#confirmPassword'));
  
    expect(emailInput).toBeTruthy();
    expect(passInput).toBeTruthy();
    expect(confirmInput).toBeTruthy();
  });
  
  it('debería mostrar error "El email es requerido" cuando se toca y deja vacío', () => {
    const usernameCtrl = component.registerForm.get('username');
    usernameCtrl?.markAsTouched();
    usernameCtrl?.setValue('');
    fixture.detectChanges();
  
    const error = fixture.debugElement.query(By.css('p')).nativeElement;
    expect(error.textContent).toContain('El email es requerido');
  });

  it('debería mostrar error si las contraseñas no coinciden', () => {
    component.registerForm.setValue({
      username: 'user@email.com',
      password: '123456',
      confirmPassword: '123'
    });
    component.registerForm.get('confirmPassword')?.markAsTouched();
    fixture.detectChanges();
  
    const errorText = fixture.debugElement.query(By.css('div p.text-red-400'))?.nativeElement.textContent;
    expect(errorText).toContain('Las contraseñas no coinciden');
  });

  it('debería tener botón "Create an account"', () => {
    const button = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(button.textContent).toContain('Create an account');
  });

  it('debería tener enlace a login con texto "Login here"', () => {
    const loginLink = fixture.debugElement.query(By.css('a[href="/login"], a[routerLink="/login"]'))?.nativeElement;
    expect(loginLink?.textContent).toContain('Login here');
  });
  
});
