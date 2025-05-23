import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavComponent } from './nav.component';
import { AuthService } from '@services/auth/auth.service';
import { signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { User } from '@models/user.model';
import { By } from '@angular/platform-browser';
import { RegisterComponent } from '@website/pages/register/register.component';
import { LoginComponent } from '@website/pages/login/login.component';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  
  let router: Router;

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: (key: string) => null
      }
    }
  };
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'hashedPassword123'
  };
  
  const authServiceMock: Partial<AuthService> = {
    isLoggedInSignal: signal(true) as WritableSignal<boolean>,
    isLoggingOut: signal(false) as WritableSignal<boolean>,
    currentUserSignal: signal(mockUser) as WritableSignal<User | null>,
    logout: jasmine.createSpy('logout'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavComponent, RouterModule.forRoot(
        [{path: 'register', component: RegisterComponent}, {path: 'login', component: LoginComponent}]
      )], 
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    spyOn(router, 'navigate')
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize signals', () => {
    expect(component).toBeTruthy();
    expect(component.isLoggedIn).toBe(authServiceMock.isLoggedInSignal);
    expect(component.isLoggingOut).toBe(authServiceMock.isLoggingOut);
    expect(component.isLoggedIn()).toBeTrue();
    expect(component.isLoggingOut()).toBeFalse();
    expect(component.profile).toEqual(mockUser);
    expect(component.profile?.username).toBe('testuser');
    
    expect(typeof component.logingOut).toBe('function'); // signal is a function to get value
  });

  it('should call authService.logout when logout() is invoked', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
  });
  it('should toggle logingOut signal value when toggleLogout() is called', () => {
  
    component.toggleLogout();
    expect(component.logingOut()).toBeTrue();
  
    component.toggleLogout();
    expect(component.logingOut()).toBeFalse();
  });

  it('should show username and logout button when user IS logged in', () => {
    // Setear usuario y estado de login
    (authServiceMock.currentUserSignal as WritableSignal<User | null>).set(mockUser);
    (authServiceMock.isLoggedInSignal as WritableSignal<boolean>).set(true);
  
    fixture.detectChanges(); // actualizar HTML
  
    const usernameEl = fixture.debugElement.query(By.css('a[aria-current="page"]'));
    const logoutButton = fixture.debugElement.query(By.css('#logout-button'));
  
    expect(usernameEl.nativeElement.textContent).toContain('testuser');
    expect(logoutButton.nativeElement.textContent).toContain('Logout');
  });

  it('should toggle logout confirmation overlay when logout button is clicked', () => {
    (authServiceMock.currentUserSignal as WritableSignal<User | null>).set(mockUser);
    (authServiceMock.isLoggedInSignal as WritableSignal<boolean>).set(true);
  
    fixture.detectChanges();
  
    const logoutButton = fixture.debugElement.query(By.css('#logout-button'));
    expect(component.logingOut()).toBeFalse();
  
    logoutButton.nativeElement.click();
    fixture.detectChanges();
  
    expect(component.logingOut()).toBeTrue();
  
    // Verifica que el overlay/modal esté visible
    // El div con [hidden] será removido cuando visible (hidden = false)
    const overlayDiv = fixture.debugElement.query(By.css('div[hidden]'));
    if (overlayDiv) {
      // Si el overlay tiene atributo hidden, entonces está oculto, falla el test
      expect(overlayDiv.nativeElement.hidden).toBeFalse();
    } else {
      // El overlay no tiene hidden (está visible), busca modal contenido
      const modalDiv = fixture.debugElement.query(By.css('div.bg-white'));
      expect(modalDiv).toBeTruthy();
    }
  });

  it('should display logout confirmation modal and handle buttons correctly', () => {
    // Simula que el usuario está en el estado de confirmación de logout
    spyOn(component, 'logingOut').and.returnValue(true);
    spyOn(component, 'isLoggingOut').and.returnValue(false);
    spyOn(component, 'logout');
    spyOn(component, 'toggleLogout');
  
    fixture.detectChanges();
  
    // Verifica que el modal esté visible
    const modal = fixture.debugElement.query(By.css('div.bg-white'));
    expect(modal).toBeTruthy();
  
    // Verifica texto del encabezado
    const header = modal.query(By.css('h2'));
    expect(header.nativeElement.textContent).toContain('¿Estás seguro de querer salir de la aplicación?');
  
    // Botón "Cerrar sesión"
    const logoutButton = modal.query(By.css('button[mat-raised-button]'));
    expect(logoutButton.nativeElement.textContent).toContain('Cerrar sesión');
    expect(logoutButton.properties['disabled']).toBeFalse();
  
    // Simula click en "Cerrar sesión"
    logoutButton.nativeElement.click();
    expect(component.logout).toHaveBeenCalled();
  
    // Botón "Cancelar"
    const cancelButton = modal.queryAll(By.css('button')).find(btn => btn.nativeElement.textContent.includes('Cancelar'));
    expect(cancelButton).toBeTruthy();
  
    // Simula click en "Cancelar"
    cancelButton!.nativeElement.click();
    expect(component.toggleLogout).toHaveBeenCalled();
  });
  
  it('should disable logout button and show spinner when logging out', () => {
    spyOn(component, 'logingOut').and.returnValue(true);
    spyOn(component, 'isLoggingOut').and.returnValue(true);
  
    fixture.detectChanges();
  
    const logoutButton = fixture.debugElement.query(By.css('button[mat-raised-button]'));
    expect(logoutButton.properties['disabled']).toBeTrue();
  
    // Verifica que spinner se muestre y texto "Cerrar sesión" no se muestre
    const spinner = logoutButton.query(By.css('mat-spinner'));
    expect(spinner).toBeTruthy();
  
    const logoutText = logoutButton.query(By.css('span'));
    expect(logoutText).toBeNull();
  });
  
});
