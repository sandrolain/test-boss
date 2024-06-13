import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { enc } from '../../lib/http';
import { TestresultDto, TestresultEditDto } from './testresults.model';

@Injectable({
  providedIn: 'root',
})
export class TestresultsService {
  private apiBaseUrl: string;
  private http: HttpClient = inject(HttpClient);

  constructor() {
    this.apiBaseUrl = environment.API_BASE_URL;
  }

  getTestreportResults(testreport_id: string): Promise<TestresultDto[]> {
    return firstValueFrom(
      this.http.get<TestresultDto[]>(
        `${this.apiBaseUrl}/v1/testreports/${enc(testreport_id)}/testresults`
      )
    );
  }

  createTestresult(
    testreport_id: string,
    data: TestresultEditDto
  ): Promise<TestresultDto> {
    return firstValueFrom(
      this.http.post<TestresultDto>(
        `${this.apiBaseUrl}/v1/testreports/${enc(testreport_id)}/testresults`,
        data
      )
    );
  }

  updateTestresultsPositions(testreport_id: string, testresults: string[]) {
    return firstValueFrom(
      this.http.put<TestresultDto[]>(
        `${this.apiBaseUrl}/v1/testreports/${enc(testreport_id)}/testresults`,
        testresults
      )
    );
  }

  getTestresult(id: string): Promise<TestresultDto> {
    return firstValueFrom(
      this.http.get<TestresultDto>(
        `${this.apiBaseUrl}/v1/testresults/${enc(id)}`
      )
    );
  }

  updateTestresult(
    id: string,
    data: TestresultEditDto
  ): Promise<TestresultDto> {
    return firstValueFrom(
      this.http.put<TestresultDto>(
        `${this.apiBaseUrl}/v1/testresults/${enc(id)}`,
        data
      )
    );
  }

  deleteTestresult(id: string): Promise<TestresultDto> {
    return firstValueFrom(
      this.http.delete<TestresultDto>(
        `${this.apiBaseUrl}/v1/testresults/${enc(id)}`
      )
    );
  }
}
