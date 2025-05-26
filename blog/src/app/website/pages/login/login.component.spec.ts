import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: Router;

  const mockQueryParams = new BehaviorSubject({ registered: 'true' });

  const mockActivatedRoute = {
    queryParams: mockQueryParams.asObservable()
  };
  

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, CommonModule, RouterModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    spyOn(mockRouter, 'navigate');
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar mensaje si viene query param registered=true', () => {
    expect(component.successMessage).toContain('Cuenta creada con éxito');
  });

  it('debería marcar como inválido el formulario vacío', () => {
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('no debería llamar al login si el formulario es inválido', () => {
    component.onSubmit();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('debería llamar a login y navegar al home si el formulario es válido', fakeAsync(() => {
    component.loginForm.setValue({
      username: 'test@email.com',
      password: '123456'
    });

    mockAuthService.login.and.returnValue(of({id: 0, username: 'test@email.com', password: '123456'}));

    component.onSubmit();
    tick();

    expect(component.status).toBe('success');
    expect(mockAuthService.login).toHaveBeenCalledWith('test@email.com', '123456');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('debería poner status en "failed" si el login falla', fakeAsync(() => {
    component.loginForm.setValue({
      username: 'test@email.com',
      password: 'wrong'
    });

    mockAuthService.login.and.returnValue(throwError(() => new Error('Invalid')));

    component.onSubmit();
    tick();

    expect(component.status).toBe('failed');
  }));

  it('debería limpiar el mensaje de éxito después de 3 segundos', fakeAsync(() => {
    component.showSuccessMessage('¡Hola!');
    expect(component.successMessage).toBe('¡Hola!');
    tick(3000);
    expect(component.successMessage).toBe('');
  }));

  it('debería mostrar el título "Sign in to your account"', () => {
    const titleEl = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(titleEl.textContent.trim()).toBe('Sign in to your account');
  });

  it('debería tener los campos username y password', () => {
    const usernameInput = fixture.debugElement.query(By.css('input#username'));
    const passwordInput = fixture.debugElement.query(By.css('input#password'));
  
    expect(usernameInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });
  
  it('debería tener el botón de Login deshabilitado si el formulario es inválido', () => {
    const button = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(button.disabled).toBeTrue();
  });

  it('debería mostrar error "El correo es obligatorio" si el email está vacío y tocado', () => {
    const usernameCtrl = component.loginForm.get('username');
    usernameCtrl?.markAsTouched();
    usernameCtrl?.setValue('');
    fixture.detectChanges();
  
    const error = fixture.debugElement.query(By.css('div.text-red-400')).nativeElement;
    expect(error.textContent).toContain('El correo es obligatorio');
  });

  it('debería mostrar error de contraseña requerida si se toca y está vacía', () => {
    const passCtrl = component.loginForm.get('password');
    passCtrl?.markAsTouched();
    passCtrl?.setValue('');
    fixture.detectChanges();
  
    const error = fixture.debugElement.query(By.css('div.text-red-400')).nativeElement;
    expect(error.textContent).toContain('La contraseña es obligatoria');
  });

  it('debería mostrar mensaje "Credentials are invalid" si status es failed', () => {
    component.status = 'failed';
    fixture.detectChanges();
  
    const error = fixture.debugElement.query(By.css('p.text-red-400'))?.nativeElement;
    expect(error?.textContent).toContain('Credentials are invalid');
  });

  it('debería renderizar el mensaje de éxito si successMessage tiene texto', () => {
    component.successMessage = '¡Bienvenido!';
    fixture.detectChanges();
  
    const successEl = fixture.debugElement.query(By.css('.bg-emerald-700')).nativeElement;
    expect(successEl.textContent).toContain('¡Bienvenido!');
  });
  
  it('debería tener el link para registrarse', () => {
    const link = fixture.debugElement.queryAll(By.css('a'))
      .map(de => de.nativeElement)
      .find(el => el.textContent.includes('Sign up'));
    expect(link).toBeTruthy();
  });
  
});
