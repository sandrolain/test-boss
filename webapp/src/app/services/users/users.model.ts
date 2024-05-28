import { ListPagination } from '../../models/common';
import { AccountID } from '../accounts/accounts.model';
import { RoleID } from '../auth/login.model';

export interface UsersListRequest extends ListPagination {
  q?: string;
}

export interface UsersListResponse {
  list: UserDto[];
  total: number;
}

export type UserID = string;

export interface UserAccount {
  account_id: AccountID;
  is_manager: boolean;
}

export interface UserDto {
  _id: UserID;
  email: string;
  firstname: string;
  lastname: string;
  created_at: string;
  updated_at: string;
  accounts: UserAccount[];
  roles: RoleID[];
}

export type UserEditDto = Omit<UserDto, 'id'>;

export interface UserImageRequest {
  type: string;
  data: string;
}

export interface UserImageResponse {
  image: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {}
