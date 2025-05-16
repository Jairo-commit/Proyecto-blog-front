import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RegisterService } from '../../../services/register/register.service';
import { CustomValidators } from '@validators/custom-validators';
import { RequestStatus } from '@models/request-status.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {

  registerForm: FormGroup;
  status: RequestStatus = 'init';
  tried: boolean = false;
  serverErrors: any = {};


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService
  ){
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword : ['',[Validators.required]]
    },
    {
      validators: [CustomValidators.MatchValidator('password', 'confirmPassword')]
    }
  );
  }

  createUser() {
    this.tried = true;
    this.serverErrors = {};
  
    if (this.registerForm.invalid) {
      return;
    }
  
    this.status = 'loading';
  
    const { username, password } = this.registerForm.getRawValue();
  
    this.registerService.create(username, password).subscribe({
      next: () => {
        this.status = 'success';
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' }
        });
      },
      error: (error) => {
        this.status = 'failed';
  
        if (error.status === 400 && error.error) {
          this.serverErrors = error.error;
        }
  
        console.error('Error al registrar:', error);
      }
    });
  }
  }

  
