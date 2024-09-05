import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, throwError } from 'rxjs';
import { Collection, CollectionParam, CollectionRequests } from '../models/collection.model';
import { ResponseDetails } from '../models/response-details';
import { CollectionResponse } from '../models/collection-response.model';
import { CollectionError } from '../models/collection-error.model';

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
        catchError(error => this.errorGetCollections(error))
      );
  }

  getCollection(id: number): Observable<Collection> {
    return this.http.get<Collection>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => this.errorGetCollections(error))
      );
  }

  sendCollectionRequests(collection: Collection, requests: CollectionRequests[]): Observable<{ responses: CollectionResponse[], errors: CollectionError[] }>{
    const responses: CollectionResponse[] = [];
    const errors: CollectionError[] = [];


    return new Observable<{ responses: CollectionResponse[], errors: CollectionError[] }>((observer) => {
      const executeNextRequest = (index: number) => {
        if (index >= requests.length) {
          observer.next({ responses, errors });
          observer.complete();
          return;
        }

        this.sendRequest(collection, requests[index]).subscribe({
          next: (response) => {
            responses.push(response as CollectionResponse);
            executeNextRequest(index + 1);
          },
          error: (error) => {
            errors.push(error);
            executeNextRequest(index + 1);
            //observer.next({responses, errors}); // Emitir respostas parciais antes de completar com erro
            //errors.push(error as CollectionError );
            /*
            observer.error({
              responses,
              error: error
            });
            */
          }
        });
      };
      executeNextRequest(0);
    });
  }

  private sendRequest(collection: Collection, request: CollectionRequests): Observable<CollectionResponse | CollectionError> {
    let url = this.replacePathParams(request.url, request.params);
    let params = new HttpParams();
    let headers = new HttpHeaders();

    if (request.params) {
      request.params.forEach(param => {
        if (param.paramName && param.paramValue) {
          if (param.paramUrl) {
            url = url.replace(`:${param.paramName}`, encodeURIComponent(param.paramValue));
          } else {
            params = params.set(param.paramName, param.paramValue);
          }
        }
      });
    }

    console.log(`Enviando requisição para URL: ${url} com método: ${request.method}`);

    const requestOptions = {
      headers,
      params,
      observe: 'response' as 'response'
    };

    switch (request.method.toUpperCase()) {
      case 'GET':
        return this.http.get<any>(url, requestOptions).pipe(
          map(response => this.mapResponse(response, collection.id, request.id)),
          catchError(error => this.handleError(error, collection.id, request.id, request.url))
        );
      case 'POST':
        return this.http.post<any>(url, request.body, requestOptions).pipe(
          map(response => this.mapResponse(response, collection.id, request.id)),
          catchError(error => this.handleError(error, collection.id, request.id, request.url))
        );
      default:
        return throwError(() => new Error(`Unsupported request method: ${request.method}`));
    };
  }

  private mapResponse(response: HttpResponse<any>, collectionId: number, requestId: number): CollectionResponse {
    console.log('Resposta recebida:', response);
    return {
      collectionId,
      requestId,
      status: response.status,
      statusText: response.statusText,
      url: response.url || '',
      headers: response.headers,
      body: response.body,
      response: response
    };
  }

  private handleError(error: HttpErrorResponse, collectionId: number, requestId: number, requestUrl: string): Observable<CollectionError> {
    console.log('Erro recebido:', error);

    const collectionError: CollectionError = {
      collectionId,
      requestId,
      url: requestUrl || error.url || '',
      status: error.status,
      statusText: error.statusText,
      message: error.message || 'Erro desconhecido',
      //headers: error.headers || new HttpHeaders(),
    };

    console.log('Erro recebido:', collectionError)
    return throwError(() => collectionError);
  }


  private replacePathParams(url: string, pathParams?: CollectionParam[]): string {
    if (!pathParams) {
      return url;
    }
    pathParams.forEach(param => {
      if (param.paramUrl && param.paramName && param.paramValue) {
        url = url.replace(`:${param.paramName}`, encodeURIComponent(param.paramValue));
      }
    });
    return url;
  }

  private errorGetCollections(error:HttpErrorResponse): Observable<never>{
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
