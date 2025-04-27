import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  toasts: { title: string; message: string; autoHide: boolean; type: string }[] = [];

  isLoading = false;

  constructor(private toastService: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.toastService.toastState.subscribe(toast => {
      this.toasts.push(toast);
      if (toast.autoHide) {
        setTimeout(() => this.removeToast(toast), 3000); // Auto-hide after 3 seconds
      }
    });


    this.toastService.loading$.subscribe((loading) => {
      this.isLoading = loading;
      this.cdr.detectChanges();
    });
    
  }

  removeToast(toast: { title: string; message: string; autoHide: boolean; type: string }): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
