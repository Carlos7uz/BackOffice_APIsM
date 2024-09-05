import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { Application } from '../models/application.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  private readonly apiUrl = '/api/applications';

  private endpointIdCounter = 1;
  private paramIdCounter = 1;
  private authIdCounter = 1;

  constructor(
    private http: HttpClient,
  ) { }

  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(this.apiUrl)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  getApplication(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }
  addApplication(application: Application): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, application)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  getNextAuthParamId(): number {
    return this.authIdCounter++;
  }

  getNextEndpointId(): number {
    return this.endpointIdCounter++;
  }

  getNextParamId(): number {
    return this.paramIdCounter++;
  }

  search(term: string): Observable<Application[]> {
    if (!term.trim()) {
      return of([]);
    }

    return this.http.get<Application[]>(`${this.apiUrl}?name=${term}`)
      .pipe(
        tap(applications =>
          applications.length
            ? console.log(`found ${applications.length} matching "${term}"`)
            : console.log(`No matching "${term}"`)
        ),
        catchError(error => this.handleError(error))
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

    alert(errorMessage);
     return throwError(() => new Error(errorMessage));
  }
}

