import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Request } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestHistoryService {
  private requestSubject = new Subject<Request>();
  requestUpdates$ = this.requestSubject.asObservable();

  addRequest(request: Request): void {
    this.requestSubject.next(request);
  }
}
