import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth/auth.service';
import { RequestStatus } from '@models/request-status.model'
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,  CommonModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  error: string | null = null;
  status: RequestStatus = 'init';
  showPassword: boolean = false;
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });   
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.showSuccessMessage('Cuenta creada con éxito. Ya puedes iniciar sesión.');
      }
    });
  }

  showSuccessMessage(msg: string) {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000); 
  }

  onSubmit(){
    if (this.loginForm.invalid) {
      console.log('Formulario inválido');
      return; 
    }

    this.status = 'loading';

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
}