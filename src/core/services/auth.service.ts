import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storedToken: string | null = null;

  constructor(private http: HttpClient) {}

  authenticate(authUrl: string, authFormat: string, body: any ): Observable<any> {
    let headers = new HttpHeaders({'Content-Type': this.getContentType(authFormat)});

    return this.http.post(authUrl, body, { headers }).pipe(
      tap((response: any) => {
        // Armazenar o access_token
        if (response.access_token) {
          this.storedToken = response.access_token;
        }
      }),
      catchError(error => {
        console.error('Authentication error:', error);
        return throwError(() => new Error('Authentication failed'));
      })
    );
  }

  getStoredToken(): string | null {
    return this.storedToken;
  }

  private getContentType(format: string): string {
    return format === 'JSON' ? 'application/json' : 'application/x-www-form-urlencoded';
  }
}
