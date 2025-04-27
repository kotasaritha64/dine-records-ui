import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class TableManagementApiService {


    private baseUrl = 'http://localhost:8081/api/v1';

    constructor(private http: HttpClient) { }
  

    reserveTable(reservationData: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/reservations`, reservationData);
    }
    
    getReservationsForArea(restaurantId: string, areaId: string, reservationDate: string): Observable<any> {
      const url = `${this.baseUrl}/reservations/table?restaurantId=${restaurantId}&areaId=${areaId}&reservationDate=${reservationDate}`;
      return this.http.get<any>(url);
    }

    updateReservation(reservationId: number, reservationData: any): Observable<any> {
      return this.http.put<any>(`${this.baseUrl}/reservations/${reservationId}`, reservationData);
    }

    getTimeSlotAvailability(timeSlot: string, restaurantId: string, areaId: number, date: string): Observable<any[]> {
      const apiUrl = `${this.baseUrl}/reservations/timeSlotAvailability?timeSlot=${timeSlot}&restaurantId=${restaurantId}&areaId=${areaId}&date=${date}`;
      return this.http.get<any[]>(apiUrl);
    }
    
    getLiveStatus(restaurantId: string, areaId: number, date: string, time: string): Observable<any> {
      const url = `${this.baseUrl}/reservations/liveStatus?restaurantId=${restaurantId}&areaId=${areaId}&date=${date}&time=${time}`;
      return this.http.get<any>(url);
    }

    getUpcomingReservations(restaurantId: string, areaId: number, date: string): Observable<any> {
      // Get current time + 1 hour, and round it to the next half-hour mark
      const currentDate = new Date();
      const currentTime = new Date(currentDate.getTime() + 60 * 60 * 1000); // Add 1 hour
      let hours = currentTime.getHours();
      let minutes = currentTime.getMinutes();
  
      // Round to the next half hour
      if (minutes >= 30) {
        minutes = 0; // Round to the top of the hour
        hours = (hours + 1) % 24; // Increase hour
      } else {
        minutes = 30; // Round to the next half hour
      }
  
      // Format time to HH:mm
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
      // Construct query parameters
      const params = new HttpParams()
        .set('restaurantId', restaurantId.toString())
        .set('areaId', areaId.toString())
        .set('date', date)
        .set('time', timeString);
  
      // Fetch upcoming reservations from the API
      return this.http.get(`${this.baseUrl}/reservations/upcoming`, { params });
    }
  }


