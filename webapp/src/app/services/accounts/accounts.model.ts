import { ListPagination } from '../../models/common';
import { UserDto } from '../users/users.model';

export interface AccountsListRequest extends ListPagination {
  q?: string;
}

export interface AccountsListResponse {
  list: AccountDto[];
  total: number;
}

export type AccountID = string;

export interface AccountDto {
  _id: AccountID;
  name: string;
  created_at: string;
  updated_at: string;
}

export type AccountEditDto = Omit<
  AccountDto,
  '_id' | 'created_at' | 'updated_at'
>;

export interface AccountsMembersListRequest extends ListPagination {
  q?: string;
}

export interface AccountsMembersListResponse {
  list: UserDto[];
  total: number;
}
