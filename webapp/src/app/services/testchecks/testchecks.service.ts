import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TestcheckDto, TestcheckEditDto } from './testchecks.model';
import { firstValueFrom } from 'rxjs';
import { enc } from '../../lib/http';

@Injectable({
  providedIn: 'root',
})
export class TestchecksService {
  private apiBaseUrl: string;
  private http: HttpClient = inject(HttpClient);

  constructor() {
    this.apiBaseUrl = environment.API_BASE_URL;
  }

  getTestlistChecks(testlist_id: string): Promise<TestcheckDto[]> {
    return firstValueFrom(
      this.http.get<TestcheckDto[]>(
        `${this.apiBaseUrl}/v1/testlists/${enc(testlist_id)}/testchecks`
      )
    );
  }

  createTestcheck(
    testlist_id: string,
    data: TestcheckEditDto
  ): Promise<TestcheckDto> {
    return firstValueFrom(
      this.http.post<TestcheckDto>(
        `${this.apiBaseUrl}/v1/testlists/${enc(testlist_id)}/testchecks`,
        data
      )
    );
  }

  getTestcheck(id: string): Promise<TestcheckDto> {
    return firstValueFrom(
      this.http.get<TestcheckDto>(`${this.apiBaseUrl}/v1/testchecks/${enc(id)}`)
    );
  }

  updateTestcheck(id: string, data: TestcheckEditDto): Promise<TestcheckDto> {
    return firstValueFrom(
      this.http.put<TestcheckDto>(
        `${this.apiBaseUrl}/v1/testchecks/${enc(id)}`,
        data
      )
    );
  }

  deleteTestcheck(id: string): Promise<TestcheckDto> {
    return firstValueFrom(
      this.http.delete<TestcheckDto>(
        `${this.apiBaseUrl}/v1/testchecks/${enc(id)}`
      )
    );
  }
}
