import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Request } from '../models/request.model';
import { catchError, Observable, throwError } from 'rxjs';
import { Application } from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  private apiUrl = '/api/requisicao';

  private requests: Request[] = [];

  constructor(private http: HttpClient) { }

  addRequest(request: Request): Observable<Request> {
    return this.http.post<Request>(this.apiUrl, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  compareAndDisplayRequests(applications: Application[], requests: Request[]): void {
    requests.slice().reverse().forEach(request => {
      applications.find(application => application.id === request.appId);
    });
  }

  getRequestsForEndpoint(aplicativoId: number, endpointId: number): Request[] {
    return this.requests.filter(request =>
      request.appId === aplicativoId && request.endpointId === endpointId
    );
  }

  loadRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getRequests(): Observable<Request[]> {
    return this.loadRequests(); // Utilize o método loadRequests para garantir consistência
  }

  getRequestsByAppAndEndpoint(appId: number, endpointId: number): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}?appId=${appId}&endpointId=${endpointId}`).pipe(
      catchError(this.handleError)
    );
  }

  getRequest(id: number): Observable<Request> {
    return this.http.get<Request>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }



  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
