import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
//import * as SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class WebSocketService {
  private client: Client;
  private statusSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8081/ws-reservations', // URL to the Spring Boot WebSocket endpoint
      connectHeaders: {},
      debug: (str) => { console.log(str); },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.subscribeToLiveStatus();
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      }
    });
  }

  // Connect to WebSocket
  public connect() {
    this.client.activate();
  }

  // Subscribe to the live status topic
  private subscribeToLiveStatus() {
    console.log('Subscribing to live status topic: /topic/liveStatus');
    this.client.subscribe('/topic/liveStatus', (message: Message) => {
      console.log('Received live status update:', message.body);  // Print the received message body

      // Parse the received live statuses and update the BehaviorSubject
      const liveStatuses = JSON.parse(message.body);
      console.log('Parsed live statuses:', liveStatuses); // Print parsed statuses
      this.statusSubject.next(liveStatuses); // Push the live status updates to the BehaviorSubject
    });
  }

  // Observable to get live updates
  public getLiveStatuses() {
    return this.statusSubject.asObservable();
  }

  // Disconnect WebSocket
  public disconnect() {
    this.client.deactivate();
  }
}
