import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '@services/auth/auth.service';
import { StorageService } from '@services/storage/storage.service';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterLink],
  templateUrl: './nav.component.html',
})
export class NavComponent {

  // profile: User | null = null;
  storageService = inject(StorageService);
  authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedInSignal;

  // getProfile(){
  //   this.authService.profile()
  //   .subscribe(profile =>{
  //     this.profile = profile
  // });
  // }

  get profile() {
    return this.authService.currentUserSignal();
  }

  // ngOnInit(): void {
  //   if (this.isLoggedIn()){
  //     this.getProfile();
  //   }
  // }

  logout(): void {
    this.authService.logout();
  }
}