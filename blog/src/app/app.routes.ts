import { Routes } from '@angular/router';

import { LoginComponent } from '@website/pages/login/login.component';
import { NotFoundComponent } from '@not-found/not-found.component';
import { RegisterComponent } from '@website/pages/register/register.component';
import { PostsComponent } from '@website/pages/posts/posts.component';
import { authGuard } from '@guards/auth.guard';
import { redirectGuard } from '@guards/redirect.guard';

export const routes: Routes = [
    {
        path: '',   
        // canActivate: [authGuard], // Should be logged
        component: PostsComponent
    },
    {
        path: 'login',
        // canActivate: [redirectGuard], //Shouldn't be logged
        component: LoginComponent
    },
    {
        path: 'register',
        // canActivate: [redirectGuard],
        component: RegisterComponent
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];
