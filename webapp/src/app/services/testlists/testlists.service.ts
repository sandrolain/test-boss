import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { enc } from '../../lib/http';
import {
  TestreportDto,
  TestreportEditDto,
} from '../testreports/testreports.model';
import { TestlistDto, TestlistEditDto } from './testlists.model';

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

  getTestlist(id: string): Promise<TestlistDto> {
    return firstValueFrom(
      this.http.get<TestlistDto>(`${this.apiBaseUrl}/v1/testlists/${enc(id)}`)
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

  createTestreport(
    id: string,
    data: TestreportEditDto
  ): Promise<TestreportDto> {
    return firstValueFrom(
      this.http.post<TestreportDto>(
        `${this.apiBaseUrl}/v1/testlists/${enc(id)}/testreports`,
        data
      )
    );
  }
}
