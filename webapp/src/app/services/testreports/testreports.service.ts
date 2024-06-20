import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { enc } from '../../lib/http';
import { TestreportDto, TestreportEditDto } from './testreports.model';

@Injectable({
  providedIn: 'root',
})
export class TestreportsService {
  private apiBaseUrl: string;
  private http: HttpClient = inject(HttpClient);

  constructor() {
    this.apiBaseUrl = environment.API_BASE_URL;
  }

  getProjectTestreports(project_id: string): Promise<TestreportDto[]> {
    return firstValueFrom(
      this.http.get<TestreportDto[]>(
        `${this.apiBaseUrl}/v1/projects/${enc(project_id)}/testreports`
      )
    );
  }

  getTestreport(id: string): Promise<TestreportDto> {
    return firstValueFrom(
      this.http.get<TestreportDto>(
        `${this.apiBaseUrl}/v1/testreports/${enc(id)}`
      )
    );
  }

  updateTestreport(
    id: string,
    data: TestreportEditDto
  ): Promise<TestreportDto> {
    return firstValueFrom(
      this.http.put<TestreportDto>(
        `${this.apiBaseUrl}/v1/testreports/${enc(id)}`,
        data
      )
    );
  }

  deleteTestreport(id: string): Promise<TestreportDto> {
    return firstValueFrom(
      this.http.delete<TestreportDto>(
        `${this.apiBaseUrl}/v1/testreports/${enc(id)}`
      )
    );
  }
}
