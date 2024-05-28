import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { enc, encodeUrlParams } from '../../lib/http';
import {
  AccountDto,
  AccountEditDto,
  AccountsListRequest,
  AccountsListResponse,
  AccountsMembersListRequest,
  AccountsMembersListResponse,
} from './accounts.model';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private apiBaseUrl: string;
  private http: HttpClient = inject(HttpClient);

  constructor() {
    this.apiBaseUrl = environment.API_BASE_URL;
  }

  getAllAccountsList(): Promise<AccountsListResponse> {
    return firstValueFrom(
      this.http.get<AccountsListResponse>(
        `${this.apiBaseUrl}/v1/accounts${encodeUrlParams({ all: 1 })}`
      )
    );
  }

  getAccountsList(req: AccountsListRequest): Promise<AccountsListResponse> {
    return firstValueFrom(
      this.http.get<AccountsListResponse>(
        `${this.apiBaseUrl}/v1/accounts${encodeUrlParams(req)}`
      )
    );
  }

  getAccount(id: string): Promise<AccountDto> {
    return firstValueFrom(
      this.http.get<AccountDto>(`${this.apiBaseUrl}/v1/accounts/${id}`)
    );
  }

  createAccount(data: AccountEditDto): Promise<AccountDto> {
    return firstValueFrom(
      this.http.post<AccountDto>(`${this.apiBaseUrl}/v1/accounts`, data)
    );
  }

  updateAccount(id: string, data: AccountEditDto): Promise<AccountDto> {
    return firstValueFrom(
      this.http.put<AccountDto>(`${this.apiBaseUrl}/v1/accounts/${id}`, data)
    );
  }

  deleteAccount(id: string): Promise<AccountDto> {
    return firstValueFrom(
      this.http.delete<AccountDto>(`${this.apiBaseUrl}/v1/accounts/${id}`)
    );
  }

  getAccountMembersList(
    id: string,
    req: AccountsMembersListRequest
  ): Promise<AccountsMembersListResponse> {
    return firstValueFrom(
      this.http.get<AccountsMembersListResponse>(
        `${this.apiBaseUrl}/v1/accounts/${id}/members${encodeUrlParams(req)}`
      )
    );
  }
}
