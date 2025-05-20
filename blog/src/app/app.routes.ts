import { Routes } from '@angular/router';

import { LoginComponent } from '@website/pages/login/login.component';
import { NotFoundComponent } from '@not-found/not-found.component';
import { RegisterComponent } from '@website/pages/register/register.component';
import { PostsComponent } from '@website/pages/posts/posts.component';
import { authGuard } from '@guards/auth.guard';
import { redirectGuard } from '@guards/redirect.guard';
import { DetailpostComponent } from '@website/pages/detailpost/detailpost.component';
import { CreatePostComponent } from '@website/pages/create-post/create-post.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'posts',
        pathMatch: 'full'
    },
    {
        path: 'posts',   
        // canActivate: [authGuard], // Should be logged
        component: PostsComponent
    },
    {
        path: 'posts/create-post',
        canActivate: [authGuard], // Should be logged
        component: CreatePostComponent
    },
    {
        path: 'posts/:id/edit-post',
        canActivate: [authGuard],
        component: CreatePostComponent
    },
    {
        path: 'posts/:id',
        component: DetailpostComponent
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
