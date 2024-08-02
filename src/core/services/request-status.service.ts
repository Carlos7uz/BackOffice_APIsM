import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Request } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestStatusService {
  private requestsSubject = new BehaviorSubject<Request[]>([]);
  requests$ = this.requestsSubject.asObservable();

  updateRequests(newRequests: Request[]): void {
    this.requestsSubject.next(newRequests);
  }
}
