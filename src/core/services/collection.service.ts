import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Collection } from '../models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  private readonly apiUrl = '/api/collections';

  constructor(
    private http: HttpClient,
  ) { }

  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(this.apiUrl)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  getCollection(id: number): Observable<Collection> {
    return this.http.get<Collection>(`${this.apiUrl}/${id}`)
      .pipe(
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
