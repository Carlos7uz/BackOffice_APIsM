import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private isLoading = false;

  show(): void {
    this.isLoading = true;
    console.log('show',this.isLoading)
  }

  hide(): void {
    this.isLoading = false;
    console.log('hide',this.isLoading)
  }

  get isLoading$(): boolean {
    return this.isLoading;
  }
}
