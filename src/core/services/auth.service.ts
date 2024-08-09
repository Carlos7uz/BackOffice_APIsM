import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthParam, AuthRequest } from '../models/auth-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  private storedToken: string | null = null;

  constructor(private http: HttpClient) {}

  authenticate(authUrl: string, authFormat: string, body: any ): Observable<any> {
    let headers = new HttpHeaders({'Content-Type': this.getContentType(authFormat)});

    /*
    if (authFormat === 'JSON') {
      body = this.getJsonBody(authRequest.authParam);
    } else {
      body = this.getUrlEncodedBody(authRequest.authParam);
    }
    */

    return this.http.post(authUrl, body, { headers })
      .pipe(
        tap((response: any) => {
          // Armazenar o access_token
          if (response.access_token) {
            this.storedToken = response.access_token;
          }
        })
      );
  }

  private getContentType(format: string): string {
    return format === 'JSON' ? 'application/json' : 'application/x-www-form-urlencoded';
  }

  private getJsonBody(params: AuthParam[]): any {
    let body: any = {};
    params.forEach(param => {
      body[param.name] = param.value;
    });
    return body;
  }

  private getUrlEncodedBody(params: AuthParam[]): HttpParams {
    let body = new HttpParams();
    params.forEach(param => {
      body = body.append(param.name, param.value);
    });
    return body;
  }

  // Método para recuperar o token armazenado
  getStoredToken(): string | null {
    return this.storedToken;
  }

  login(username: string, password: string): Observable<any> {
    const url = 'https://example.com/auth/login'; // URL de autenticação
    const body = { username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(url, body, { headers }).pipe(
      tap(response => {
        const token = response.access_token;
        this.tokenSubject.next(token);
        localStorage.setItem('access_token', token);
      })
    );
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  logout(): void {
    this.tokenSubject.next(null);
    localStorage.removeItem('access_token');
  }

}
