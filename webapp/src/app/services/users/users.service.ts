import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { encodeUrlParams, fileToBase64 } from '../../lib/http';
import {
  UserDto,
  UserEditDto,
  UserImageResponse,
  UsersListRequest,
  UsersListResponse,
} from './users.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiBaseUrl: string;
  private http: HttpClient = inject(HttpClient);

  constructor() {
    this.apiBaseUrl = environment.API_BASE_URL;
  }

  getUsersList(req: UsersListRequest): Promise<UsersListResponse> {
    return firstValueFrom(
      this.http.get<UsersListResponse>(
        `${this.apiBaseUrl}/v1/users${encodeUrlParams(req)}`
      )
    );
  }

  getUser(id: string): Promise<UserDto> {
    return firstValueFrom(
      this.http.get<UserDto>(`${this.apiBaseUrl}/v1/users/${id}`)
    );
  }

  createUser(data: UserEditDto): Promise<UserDto> {
    return firstValueFrom(
      this.http.post<UserDto>(`${this.apiBaseUrl}/v1/users`, data)
    );
  }

  updateUser(id: string, data: UserEditDto): Promise<UserDto> {
    return firstValueFrom(
      this.http.put<UserDto>(`${this.apiBaseUrl}/v1/users/${id}`, data)
    );
  }

  deleteUser(id: string): Promise<UserDto> {
    return firstValueFrom(
      this.http.delete<UserDto>(`${this.apiBaseUrl}/v1/users/${id}`)
    );
  }

  getUserImage(id: string): Promise<UserImageResponse> {
    return firstValueFrom(
      this.http.get<UserImageResponse>(
        `${this.apiBaseUrl}/v1/users/${id}/image`
      )
    );
  }

  async updateUserImage(
    id: string,
    image: File | Blob
  ): Promise<UserImageResponse> {
    return firstValueFrom(
      this.http.post<UserImageResponse>(
        `${this.apiBaseUrl}/v1/users/${id}/image`,
        await fileToBase64(image)
      )
    );
  }
}
