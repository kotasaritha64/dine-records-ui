import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {

  constructor(private http: HttpClient) {}

  pay(amount: number) {
    this.http.post<any>('http://localhost:8080/api/payment/create-order', { amount: amount * 100 })
      .subscribe(data => this.openRazorpay(data));
  }

  openRazorpay(data: any) {
    const options: any = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'POS App',
      description: 'Order Payment',
      order_id: data.orderId,
      handler: (response: any) => {
        alert('Payment Success! Payment ID: ' + response.razorpay_payment_id);
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#528FF0'
      }
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }
}
