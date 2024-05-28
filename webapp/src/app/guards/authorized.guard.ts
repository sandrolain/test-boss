import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { UserRole } from '../services/auth/login.model';

export function authorizedGuard(requiredRoles: UserRole[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const userRoles = authService.getRoles() ?? [];
    return requiredRoles.every((role) => userRoles.includes(role));
  };
}
