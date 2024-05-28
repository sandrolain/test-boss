import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TestlistDto, TestlistEditDto } from './testlists.model';
import { firstValueFrom } from 'rxjs';
import { enc } from '../../lib/http';

@Injectable({
  providedIn: 'root',
})
export class TestlistsService {
  private apiBaseUrl: string;
  private http: HttpClient = inject(HttpClient);

  constructor() {
    this.apiBaseUrl = environment.API_BASE_URL;
  }

  getProjectTestlists(project_id: string): Promise<TestlistDto[]> {
    return firstValueFrom(
      this.http.get<TestlistDto[]>(
        `${this.apiBaseUrl}/v1/projects/${enc(project_id)}/testlists`
      )
    );
  }

  getTestlist(id: string): Promise<TestlistDto> {
    return firstValueFrom(
      this.http.get<TestlistDto>(`${this.apiBaseUrl}/v1/testlists/${enc(id)}`)
    );
  }

  createTestlist(
    project_id: string,
    data: TestlistEditDto
  ): Promise<TestlistDto> {
    return firstValueFrom(
      this.http.post<TestlistDto>(
        `${this.apiBaseUrl}/v1/projects/${enc(project_id)}/testlists`,
        data
      )
    );
  }

  updateTestlist(id: string, data: TestlistEditDto): Promise<TestlistDto> {
    return firstValueFrom(
      this.http.put<TestlistDto>(
        `${this.apiBaseUrl}/v1/testlists/${enc(id)}`,
        data
      )
    );
  }

  deleteTestlist(id: string): Promise<TestlistDto> {
    return firstValueFrom(
      this.http.delete<TestlistDto>(
        `${this.apiBaseUrl}/v1/testlists/${enc(id)}`
      )
    );
  }
}
