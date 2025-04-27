import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Modal } from 'bootstrap';


interface Order {
  billNo: string;
  tokenNo: string;
  channel: string;
  orderId: string;
  orderedBy: string;
  address: string;
  duration: string;
  amount: string;
  status: string;
}

interface Channel {
    name: string;
}

@Component({
  selector: 'app-orders-dashboard',
  templateUrl: './orders-dashboard.component.html',
  styleUrls: ['./orders-dashboard.component.scss']
})
export class OrdersDashboardComponent implements OnInit {

  channels: Channel[] = [];
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  onlineServiceUrl = 'http://localhost:9999/online/';
  restaurantId = 10;
  @ViewChild('addChannelModal', { static: false }) addChannelModal!: ElementRef;
  private modalInstance: Modal | null = null;
  newChannel = {
      name: '',
      contactEmail: '',
      contactPhone: '',
      restaurantId: null
   };


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchChannels();
    this.fetchOrders('all');
  }

  fetchChannels(): void {
      this.http.get<Channel[]>(this.onlineServiceUrl + 'channels/by-restaurant/' + this.restaurantId) .subscribe(
          (data) => this.channels = data,
          (error) => console.error('Error fetching channels:', error)
        );
  }

  fetchOrders(channel: string): void {
    this.http.get<Order[]>(this.onlineServiceUrl + 'orders/' + channel + "/" + this.restaurantId).subscribe(
      (data) => {
        this.orders = data;
        this.filteredOrders = data;
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  filterOrders(channel: string): void {
      if ('all' === channel) {
          this.filteredOrders = this.orders;
      } else {
          this.filteredOrders = this.orders.filter(order => order.channel === channel);
      }
  }

  get newOrders(): Order[] {
    return this.filteredOrders.filter(order => order.status === 'new');
  }

  get preparingOrders(): Order[] {
    return this.filteredOrders.filter(order => order.status === 'preparing');
  }

  get readyOrders(): Order[] {
    return this.filteredOrders.filter(order => order.status === 'ready');
  }

  ordersCount(channel: string): number {
    return this.orders.filter(order => order.channel === channel).length;
  }

  onRefresh(event: Event) {
    event.preventDefault(); // Stop default anchor behavior (which may reload the page)
    this.fetchOrders('all'); // Reload data from API
  }


  onMap(): void {
    console.log('Map clicked');
  }

  onReport(): void {
    console.log('Report clicked');
  }

  onToggleOnline(): void {
    console.log('Toggle Online clicked');
  }

  updateOrderStatus(orderId: string, status: string) {
      console.log(`Marking order ${orderId} as ${status}...`);
      this.http.put(this.onlineServiceUrl + 'orders/' + orderId + "/status?status=" + status, {}, { responseType: 'text' }).subscribe({
          next: (response: string) => {
              console.log('Order status  updated.');
                // Update the order status in the list
              this.orders = this.orders.map(order =>
                order.orderId === orderId ? { ...order, status } : order
              );
              this.filteredOrders = this.filteredOrders.map(order =>
                order.orderId === orderId ? { ...order, status } : order
              );
          },
          error: (error) => {
            console.error('Error updating order status:', error);
          }
        });
  }

  onMute(): void {
    console.log('Mute clicked');
    // implement your mute logic
  }


  // ✅ Open Modal
    openModal() {
      if (this.addChannelModal) {
        this.modalInstance = new Modal(this.addChannelModal.nativeElement);
        this.modalInstance.show();
      }
    }

    // ✅ Close Modal
    closeModal() {
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
      // Remove any leftover backdrops
      setTimeout(() => {
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
      }, 500);
    }

    // ✅ Add Channel and Close Modal
    addChannel() {
      if (this.newChannel.name && this.newChannel.contactEmail && this.newChannel.contactPhone) {
          this.newChannel.restaurantId = this.restaurantId;
        this.http.post(this.onlineServiceUrl + 'channels', this.newChannel).subscribe({
          next: (response: any) => {
            console.log('Channel added:', response);
            this.channels.push(response);
            this.newChannel = { name: '', contactEmail: '', contactPhone: '', restaurantId: null };

            // ✅ Close modal after successful submission
            this.closeModal();
          },
          error: (error) => {
            console.error('Error adding channel:', error);
            alert('Failed to add channel. Please try again.');
          }
        });
      }
    }

    onSearch(event: Event) {
      const inputValue = (event.target as HTMLInputElement).value;
      console.log('Search Query:', inputValue);
      this.filterOrdersByQuery(inputValue);
    }

    filterOrdersByQuery(query: string) {
      this.filteredOrders = this.orders.filter(order =>
        order.tokenNo.includes(query) || order.orderId.includes(query)
      );
    }

}
