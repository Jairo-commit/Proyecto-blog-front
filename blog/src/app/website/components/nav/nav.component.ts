import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './nav.component.html',
})
export class NavComponent {
  authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedInSignal;
  logingOut = signal<boolean>(false);
  isLoggingOut = this.authService.isLoggingOut;

  constructor() {
    if(this.isLoggedIn()){
      this.authService.profile().subscribe({
        next: (user) => this.authService.currentUser.set(user),
        error: () => this.authService.logout(),
      });
    }
  }

  get profile() {
    return this.authService.currentUserSignal();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleLogout() {
    this.logingOut.set(!this.logingOut());
  }
}
