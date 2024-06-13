import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Aplicativo } from '../models/aplicativo.model';


@Injectable({
  providedIn: 'root'
})
export class AplicativoService {

  private apiUrl = '/api/aplicativos';

  private endpointIdCounter = 1;
  private paramIdCounter = 1;

  constructor(private http: HttpClient) { }

  getNextEndpointId(): number {
    return this.endpointIdCounter++;
  }

  getNextParamId(): number {
    return this.paramIdCounter++;
  }

  createAplicativo(aplicativo: Aplicativo): Observable<Aplicativo> {
    return this.http.post<Aplicativo>(this.apiUrl, aplicativo)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAplicativos(): Observable<Aplicativo[]> {
    return this.http.get<Aplicativo[]>(this.apiUrl)
      .pipe(
        tap((aplicativos) => console.log(`fetched ${aplicativos.length} aplicativos`)),
        catchError(this.handleError)
      );
  }

  getAplicativo(id: number): Observable<Aplicativo> {
    return this.http.get<Aplicativo>(`${this.apiUrl}/${id}`)
      .pipe(
        tap((aplicativo) => console.log(`fetched aplicativo id=${id} and name= ${aplicativo.nameFormControl}`)),
        catchError(this.handleError)
      );
  }

  addAplicativo(aplicativo: Aplicativo): Observable<Aplicativo> {
    return this.http.post<Aplicativo>(this.apiUrl, aplicativo)
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
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}

