import { Injectable } from '@angular/core';
import { Subject,BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<{ title: string; message: string; autoHide: boolean; type: string }>();
  toastState = this.toastSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  showLoader() {
    this.loadingSubject.next(true);
  }

  hideLoader() {
    this.loadingSubject.next(false);
  }

  showToast(title: string, message: string, autoHide: boolean = true, type: string): void {
    this.toastSubject.next({ title, message, autoHide, type });
  }
  
}
