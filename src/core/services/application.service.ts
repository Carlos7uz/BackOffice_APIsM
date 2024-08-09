import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { Application } from '../models/application.model';
import { NgxSpinnerService } from 'ngx-spinner';


@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  private apiUrl = '/api/applications';

  private endpointIdCounter = 1;
  private paramIdCounter = 1;
  private authIdCounter = 1;

  constructor(private http: HttpClient, private spinner: NgxSpinnerService) { }

  getNextAuthParamId(): number {
    return this.authIdCounter++;
  }

  getNextEndpointId(): number {
    return this.endpointIdCounter++;
  }

  getNextParamId(): number {
    return this.paramIdCounter++;
  }


  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      )
  }

  getApplication(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  search(term: string): Observable<Application[]> {
    if ( !term.trim() ) {
      return of([]);
    }

    return this.http.get<Application[]>(`${this.apiUrl}?name=${term}`)
      .pipe(
        tap((application) =>
          application.length
            ? console.log(`found ${application.length} matching "${term}"`)
            : console.log(`No matching "${term}"`)
        )
      )
  }

  addAplicativo(application: Application): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, application)
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
    alert(errorMessage);
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}

