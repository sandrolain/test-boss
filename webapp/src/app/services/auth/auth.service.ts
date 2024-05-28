import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  UserDto,
} from '../users/users.model';
import {
  LoginRequest,
  LoginResponse,
  LoginUserAccount,
  RoleID,
  UserRole,
} from './login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiBaseUrl: string;
  private http: HttpClient = inject(HttpClient);
  private loginData: LoginResponse | null = null;

  private loggedInSignal: WritableSignal<LoginResponse | null> = signal(null);
  readonly loggedIn = this.loggedInSignal.asReadonly();

  private accountSignal: WritableSignal<LoginUserAccount | null> = signal(null);
  readonly account = this.accountSignal.asReadonly();

  constructor() {
    this.apiBaseUrl = environment.API_BASE_URL;
  }

  async loadLoginData() {
    const loginData = localStorage.getItem('login_data');
    if (loginData) {
      this.loginData = JSON.parse(loginData);

      try {
        await this.updateSession();
        this.loggedInSignal.set(this.loginData);
      } catch (error) {
        this.clearLoginData();
        this.loggedInSignal.set(null);
      }
    }
  }

  async login(data: LoginRequest) {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(
        `${this.apiBaseUrl}/v1/sessions/login`,
        data
      )
    );

    this.setLoginData(response);

    return response;
  }

  async updateSession() {
    const response = await firstValueFrom(
      this.http.get<LoginResponse>(`${this.apiBaseUrl}/v1/sessions/me`)
    );

    this.setLoginData(response);

    return response;
  }

  logout() {
    this.clearLoginData();
    this.loggedInSignal.set(null);
  }

  hasLoginData() {
    return this.loginData !== null;
  }

  getAuthToken(): string {
    return this.loginData?.token ?? '';
  }

  getUser(): UserDto {
    return this.loginData?.user ?? ({} as UserDto);
  }

  getImage(): string {
    return this.loginData?.image ?? '';
  }

  getRoles(): RoleID[] {
    return this.loginData?.user.roles ?? [];
  }

  getAccounts(): LoginUserAccount[] {
    return this.loginData?.accounts ?? [];
  }

  private setLoginData(data: LoginResponse) {
    this.loginData = data;
    localStorage.setItem('login_data', JSON.stringify(this.loginData));
    this.loggedInSignal.set(data);
    this.refreshSelectedAccount();
  }

  private clearLoginData() {
    this.loginData = null;
    localStorage.removeItem('login_data');
  }

  changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return firstValueFrom(
      this.http.post<ChangePasswordResponse>(
        `${this.apiBaseUrl}/v1/sessions/change-password`,
        data
      )
    );
  }

  requestPasswordRecovery(email: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.apiBaseUrl}/v1/sessions/password-recovery`, {
        email,
      })
    );
  }

  finalizePasswordRecovery(token: string, password: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.apiBaseUrl}/v1/sessions/password-recovery/${token}`,
        {
          password,
        }
      )
    );
  }

  setSelectedAccount(account_id: string) {
    let account = this.getAccounts().find(
      (account) => account._id === account_id
    );
    if (!account) {
      account = this.getAccounts()[0];
      account_id = account._id;
    }
    localStorage.setItem('account_id', account_id);
    this.accountSignal.set(account);
  }

  refreshSelectedAccount() {
    const accountId = localStorage.getItem('account_id');
    const userAccounts = this.getAccounts();
    let account = userAccounts.find((account) => account._id === accountId);
    if (!account) {
      account = userAccounts[0];
      localStorage.setItem('account_id', account._id);
    }
    this.accountSignal.set(account);
  }
}
