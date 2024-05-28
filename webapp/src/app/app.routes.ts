import { Routes } from '@angular/router';
import { authenticatedGuard } from './guards/authenticated.guard';
import { authorizedGuard } from './guards/authorized.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./views/login/login.component').then((mod) => mod.LoginComponent),
  },
  {
    path: 'password-recovery',
    loadComponent: () =>
      import('./views/password-recovery/password-recovery.component').then(
        (mod) => mod.PasswordRecoveryComponent
      ),
  },
  {
    path: 'password-recovery/:token',
    loadComponent: () =>
      import('./views/password-recovery/password-recovery.component').then(
        (mod) => mod.PasswordRecoveryComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./views/dashboard/dashboard.component').then(
        (mod) => mod.DashboardComponent
      ),
    canActivate: [authenticatedGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./views/users/users.component').then((mod) => mod.UsersComponent),
    canActivate: [authenticatedGuard, authorizedGuard(['admin'])],
  },
  {
    path: 'users/detail/:id',
    loadComponent: () =>
      import('./views/users/users-detail/users-detail.component').then(
        (mod) => mod.UsersDetailComponent
      ),
    canActivate: [authenticatedGuard, authorizedGuard(['admin'])],
  },
  {
    path: 'users/create',
    loadComponent: () =>
      import('./views/users/users-edit/users-edit.component').then(
        (mod) => mod.UsersEditComponent
      ),
    canActivate: [authenticatedGuard, authorizedGuard(['admin'])],
  },
  {
    path: 'users/edit/:id',
    loadComponent: () =>
      import('./views/users/users-edit/users-edit.component').then(
        (mod) => mod.UsersEditComponent
      ),
    canActivate: [authenticatedGuard, authorizedGuard(['admin'])],
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('./views/accounts/accounts.component').then(
        (mod) => mod.AccountsComponent
      ),
    canActivate: [authenticatedGuard, authorizedGuard(['admin'])],
  },
  {
    path: 'accounts/detail/:id',
    loadComponent: () =>
      import('./views/accounts/accounts-detail/accounts-detail.component').then(
        (mod) => mod.AccountsDetailComponent
      ),
    canActivate: [authenticatedGuard, authorizedGuard(['admin'])],
  },
  {
    path: 'accounts/create',
    loadComponent: () =>
      import('./views/accounts/accounts-edit/accounts-edit.component').then(
        (mod) => mod.AccountsEditComponent
      ),
    canActivate: [authenticatedGuard, authorizedGuard(['admin'])],
  },
  {
    path: 'accounts/edit/:id',
    loadComponent: () =>
      import('./views/accounts/accounts-edit/accounts-edit.component').then(
        (mod) => mod.AccountsEditComponent
      ),
    canActivate: [authenticatedGuard, authorizedGuard(['admin'])],
  },
  {
    path: 'projects/detail/:id',
    loadComponent: () =>
      import('./views/projects/projects-detail/projects-detail.component').then(
        (mod) => mod.ProjectsDetailComponent
      ),
    canActivate: [authenticatedGuard],
  },
  {
    path: 'projects/create',
    loadComponent: () =>
      import('./views/projects/projects-edit/projects-edit.component').then(
        (mod) => mod.ProjectsEditComponent
      ),
  },
  {
    path: 'projects/edit/:id',
    loadComponent: () =>
      import('./views/projects/projects-edit/projects-edit.component').then(
        (mod) => mod.ProjectsEditComponent
      ),
    canActivate: [authenticatedGuard],
  },
  {
    path: 'testlists/detail/:id',
    loadComponent: () =>
      import(
        './views/testlists/testlists-detail/testlists-detail.component'
      ).then((mod) => mod.TestlistsDetailComponent),
    canActivate: [authenticatedGuard],
  },
  {
    path: 'testlists/create',
    loadComponent: () =>
      import('./views/testlists/testlists-edit/testlists-edit.component').then(
        (mod) => mod.TestlistsEditComponent
      ),
    canActivate: [authenticatedGuard],
  },
  {
    path: 'testlists/edit/:id',
    loadComponent: () =>
      import('./views/testlists/testlists-edit/testlists-edit.component').then(
        (mod) => mod.TestlistsEditComponent
      ),
    canActivate: [authenticatedGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./views/profile/profile.component').then(
        (mod) => mod.ProfileComponent
      ),
    canActivate: [authenticatedGuard],
  },
  {
    path: 'profile/edit',
    loadComponent: () =>
      import('./views/profile/profile-edit/profile-edit.component').then(
        (mod) => mod.ProfileEditComponent
      ),
    canActivate: [authenticatedGuard],
  },
  {
    path: 'profile/password',
    loadComponent: () =>
      import(
        './views/profile/profile-password/profile-password.component'
      ).then((mod) => mod.ProfilePasswordComponent),
    canActivate: [authenticatedGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
