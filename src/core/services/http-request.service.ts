import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ResponseDetails } from '../models/response-details';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestService  {

  constructor(private http: HttpClient) { }

  getTokenValue(headers: { key: string, value: string }[]): Observable<string> {
    const tokenHeader = headers.find(header => header.key);
    if (!tokenHeader) {
      return of('null');
    }
    const tokenValue = tokenHeader.value;
    return of(tokenValue);
  }

  makeRequest(
    url: string,
    endpoint: string,
    method: string,
    params: {paramName: string, paramValue: string, paramUrl: boolean}[],
    body: any,
    headers: { key: string, value: string }[]
  ): Observable<ResponseDetails> {
    let fullUrl = `${url}${endpoint}`;
    let queryParams: string[] = [];

    params.forEach(param => {
      if (param.paramValue != null && param.paramValue !== '') { // Verificar se o valor não é nulo ou vazio
        if (param.paramUrl) {
          // Parâmetro de path / antigo query param
          //queryParams.push(`${encodeURIComponent(param.paramName)}=${encodeURIComponent(param.paramValue)}`);
          fullUrl = `${fullUrl}/${encodeURIComponent(param.paramValue)}`;
        } else {
          // Parâmetro de URL
          //fullUrl = `${fullUrl}/${encodeURIComponent(param.paramValue)}`;
        }
      }
    });

    if (queryParams.length > 0) {
      fullUrl = `${fullUrl}/?${queryParams.join('&')}`;
    }

    let httpHeaders = new HttpHeaders();
    headers.forEach(header => {
      httpHeaders = httpHeaders.set(header.key, header.value);
    });

    // No body validation for GET and DELETE methods
    if ((method === 'POST' || method === 'PUT') && !body) {
      console.error('Body is null or undefined');
      return throwError(new Error('Body is required for POST and PUT requests'));
    }

    const requestOptions = {
      headers: httpHeaders,
      observe: 'response' as 'response'
    };

    switch (method) {
      case 'GET':
        return this.http.get<any>(fullUrl, requestOptions).pipe(
          catchError(this.handleError),
          map(this.mapResponse(httpHeaders))
        );
      case 'POST':
        return this.http.post<any>(fullUrl, body, requestOptions).pipe(
          catchError(this.handleError),
          map(this.mapResponse(httpHeaders))
        );
      case 'PUT':
        return this.http.put<any>(fullUrl, body, requestOptions).pipe(
          catchError(this.handleError),
          map(this.mapResponse(httpHeaders))
        );
      case 'DELETE':
        return this.http.delete<any>(fullUrl, requestOptions).pipe(
          catchError(this.handleError),
          map(this.mapResponse(httpHeaders))
        );
      default:
        return throwError(new Error(`Invalid method: ${method}`));
    }
  }

/*
    return this.http.request(method, fullUrl, body, requestOptions).pipe(
      catchError(this.handleError),
      map((response: HttpResponse<any>): ResponseDetails => {
        return {
          status: response.status,
          statusText: response.statusText,
          url: response.url || '',
          type: response.type.toString(),
          headers: headers, // Aqui você está retornando os cabeçalhos com a chave e valor que o usuário digitou
          body: response.body
        };
      })
    );
    */

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error);
  }

  private mapResponse(headers: HttpHeaders) {
    return (response: HttpResponse<any>) => {
      return {
        status: response.status,
        statusText: response.statusText,
        url: response.url || '',
        type: response.type.toString(),
        headers: headers,
        body: response.body
      };
    };
  }
}
