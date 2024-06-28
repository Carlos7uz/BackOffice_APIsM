import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Detalhe } from '../models/detalhe.model';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetalheService {

  private apiUrl = '/api/detalhes'

  constructor(private http: HttpClient) { }

  addAplicativo(detalhe: Detalhe): Observable<Detalhe> {
    return this.http.post<Detalhe>(this.apiUrl, detalhe)
      .pipe(
        catchError(this.handleError)
      );
  }

  getDetalhes(): Observable<Detalhe[]> {
    return this.http.get<Detalhe[]>(this.apiUrl)
      .pipe(
        tap((detalhes) => console.log(`fetched ${detalhes.length} aplicativos`)),
        catchError(this.handleError)
      );
  }

  getDetalhe(id: number): Observable<Detalhe> {
    return this.http.get<Detalhe>(`${this.apiUrl}/${id}`)
      .pipe(
        tap((detalhe) => console.log(`fetched detalhe id=${id} and name= ${detalhe.url}`)),
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
