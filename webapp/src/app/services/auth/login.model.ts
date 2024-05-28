import { AccountDto, AccountID } from '../accounts/accounts.model';
import { UserAccount, UserDto } from '../users/users.model';

export const USER_ROLES = ['admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUserAccount extends AccountDto {
  isManager: boolean;
}

export interface LoginResponse {
  token: string;
  user: UserDto;
  image?: string;
  accounts: LoginUserAccount[];
}

export interface PasswordRecoveryInitRequest {
  email: string;
}

export interface PasswordRecoveryUpdateResponse {
  password: string;
}

export type RoleID = string;
