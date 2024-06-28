import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Requisicao } from '../models/requisicao.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequisicaoService {

  private apiUrl = '/api/requisicao'

  constructor(private http: HttpClient) { }

  addRequisicao(requisicao: Requisicao): Observable<Requisicao> {
    return this.http.post<Requisicao>(this.apiUrl, requisicao)
    .pipe(
      catchError(this.handleError)
    )
  }

  getRequisicoes(): Observable<Requisicao[]>{
    return this.http.get<Requisicao[]>(this.apiUrl)
    .pipe(
      catchError(this.handleError)
    )
  }

  getRequisicao(id: number): Observable<Requisicao> {
    return this.http.get<Requisicao>(`${this.apiUrl}/${id}`)
    .pipe(
      catchError(this.handleError)
    )
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
