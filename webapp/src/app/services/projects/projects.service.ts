import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProjectDto, ProjectEditDto } from './projects.model';
import { firstValueFrom } from 'rxjs';
import { enc } from '../../lib/http';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private apiBaseUrl: string;
  private http: HttpClient = inject(HttpClient);

  constructor() {
    this.apiBaseUrl = environment.API_BASE_URL;
  }

  getAccountProjects(account_id: string): Promise<ProjectDto[]> {
    return firstValueFrom(
      this.http.get<ProjectDto[]>(
        `${this.apiBaseUrl}/v1/accounts/${enc(account_id)}/projects`
      )
    );
  }

  getProject(id: string): Promise<ProjectDto> {
    return firstValueFrom(
      this.http.get<ProjectDto>(`${this.apiBaseUrl}/v1/projects/${enc(id)}`)
    );
  }

  createProject(account_id: string, data: ProjectEditDto): Promise<ProjectDto> {
    return firstValueFrom(
      this.http.post<ProjectDto>(
        `${this.apiBaseUrl}/v1/accounts/${enc(account_id)}/projects`,
        data
      )
    );
  }

  updateProject(id: string, data: ProjectEditDto): Promise<ProjectDto> {
    return firstValueFrom(
      this.http.put<ProjectDto>(
        `${this.apiBaseUrl}/v1/projects/${enc(id)}`,
        data
      )
    );
  }

  deleteProject(id: string): Promise<ProjectDto> {
    return firstValueFrom(
      this.http.delete<ProjectDto>(`${this.apiBaseUrl}/v1/projects/${enc(id)}`)
    );
  }
}
