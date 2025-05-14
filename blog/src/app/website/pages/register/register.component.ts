import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { RegisterService } from '../../../services/register/register.service';
import { CustomValidators } from '@validators/custom-validators';
import { RequestStatus } from '@models/request-status.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {

  registerForm: FormGroup;
  status: RequestStatus = 'init';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService
  ){
    this.registerForm = this.fb.group({
      username: ['',],
      password: ['',],
      confirmPassword : ['',]
    },
    {
      validators: [CustomValidators.MatchValidator('password', 'confirmPassword')]
    }
  );
  }

  createUser(){
    if (this.registerForm.valid) {
      this.status = 'loading';
      console.log('Valores del formulario:', this.registerForm.value);
      const { username , password } = this.registerForm.getRawValue();

      this.registerService.create(username, password)
      .subscribe({
        next: () => {
          this.status = 'success';
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.status = 'failed';
          console.log(error);
        }
      });
      
    }
  }

  }

  
