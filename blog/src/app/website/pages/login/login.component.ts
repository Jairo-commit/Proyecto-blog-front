import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth/auth.service';
import { RequestStatus } from '@models/request-status.model'
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,  CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {

  loginForm: FormGroup;
  error: string | null = null;
  status: RequestStatus = 'init';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });   
  }

  onSubmit(){
    if (this.loginForm.invalid) {
      console.log('Formulario inválido');
      return;  // Detén la ejecución si el formulario no es válido
    }

    this.status = 'loading';

    console.log('Valores del formulario:', this.loginForm.value);

    const { username , password } = this.loginForm.value;

    this.authService.login(username, password).subscribe(
      {
        next: () => {
          this.status = 'success';
          this.router.navigate(['/']);
        },
        error: () => {
          this.status = 'failed';
        }
      }
    )

  }

  getProfile(){
    this.authService.profile()
    .subscribe(profile =>{
      console.log('Este es el perfil registado en el local storage',profile);
    })
  }
}