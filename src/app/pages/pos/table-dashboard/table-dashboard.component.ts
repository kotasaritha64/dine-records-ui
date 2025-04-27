import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../../service/app-settings.service';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { Store } from '@ngrx/store';
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDate
} from '@ng-bootstrap/ng-bootstrap';
declare var bootstrap: any;
import { TableManagementApiService } from '../../../service/api-services/table-management-api.service'
import { ToastService } from '../../../service//toast.service';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-table-dashboard',
  templateUrl: './table-dashboard.component.html',
  styleUrl: './table-dashboard.component.scss'
})
export class PosTableDashboardPage {

  tables: any[] = [];
  currentHour: any = '';
  restaurantID: string | null = null;
  areas: any[] = [];
  filteredTables: any[] = [];
  currentTime: string;
  reservationTimings: any[] = [];
  selectedArea: any;
  liveStatusFetched: boolean = false;
  upcomingReservations: any[] = [];
  private intervalId: any;

  datepickerComponentValue: NgbDateStruct = { year: 0, month: 0, day: 0 };
  minDate: NgbDateStruct;
  maxDate: NgbDateStruct;

  constructor(private appSettings: AppSettings,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private store: Store,
    private menuApiService: MenuApiService,
    private tableApiService: TableManagementApiService
  ) {
    this.appSettings.appHeaderNone = true;
    this.appSettings.appSidebarNone = true;
    this.appSettings.appContentClass = 'p-0';
    this.appSettings.appContentFullHeight = true;

    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
      if (this.restaurantID) {
        this.fetchTables();
        this.fetchAreas();
        this.fetchUpcomingReservations();
        this.fetchLiveStatus();
      }
    });


  }


  ngOnInit() {

    this.http.get<any[]>('/assets/data/pos-table-booking/data.json').subscribe(data => {
      this.tables = data.map(table => ({
        ...table,
        // Ensure each table has at least an empty reservationBy array for safety
        reservationBy: table.reservationBy || []
      }));
    }, error => {
      console.error('Failed to load table data:', error);
    });


    const today = new Date();
    this.datepickerComponentValue = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };

    this.minDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    this.maxDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() + 30 }; // 30 days ahead

  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed to avoid memory leaks
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  // updateCurrentHour() {
  //   const today = new Date();
  //   const hours = today.getHours();
  //   const ampm = hours >= 12 ? 'pm' : 'am';
  //   const formattedHours = hours % 12 || 12;
  //   this.currentHour = `${this.checkTime(formattedHours)}:00${ampm}`;
  // }

  // isCurrentReservation(time: string): boolean {
  //   const [hours, minutes] = time.split(':').map(t => parseInt(t, 10));
  //   const currentTime = new Date();
  //   return currentTime.getHours() === hours && currentTime.getMinutes() === minutes;
  // }

  getSeatsArray(pax: number): any[] {
    return Array.from({ length: pax });
  }

  getSeatPosition(index: number, pax: number): string {
    const positions = {
      2: ['50%', '50%'],               // Centered vertically for two seats
      4: ['25%', '25%', '75%', '75%'],  // Separate top and bottom rows for 4 seats
      6: ['17%', '50%', '83%', '17%', '50%', '83%'],  // Three positions for each side in 6 seats
      8: ['12.5%', '12.5%', '62.5%', '87.5%', '37.5%', '37.5%', '87.5%', '62.5%']  // Four positions for each side in 8 seats
    };
    return positions[pax] ? positions[pax][index] : '0%';
  }

  getTableBackground(table: any): string {
    const baseColor = '#3a3b4f';
    const statusColor = this.getStatusColor(table);
    return `linear-gradient(to right, ${baseColor} 75%, ${statusColor} 25%)`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'occupied': return '#00a2ff';
      case 'reserved': return '#ffcc00';
      case 'vacant': return '#4caf50';
      default: return '#ccc';
    }
  }

  getGradientColor(table: any): string {
    const colors = {
      occupied: '#00a2ff',
      reserved: '#ffcc00',
      vacant: '#4caf50'
    };
    return `linear-gradient(to right, #3a3b4f 75%, ${colors[table.status] || '#ccc'} 25%)`;
  }

  // checkTime(i: any) {
  //   if (i < 10) {
  //     i = "0" + i;
  //   }
  //   return i;
  // }

  // getTime() {
  //   var today = new Date();
  //   var h = today.getHours();
  //   var m = today.getMinutes();
  //   var s = today.getSeconds();
  //   var a;
  //   m = this.checkTime(m);
  //   s = this.checkTime(s);
  //   a = (h > 11) ? 'pm' : 'am';
  //   h = (h > 12) ? h - 12 : h;

  //   setTimeout(() => this.getTime(), 500);

  //   return h + ":" + m + a;
  // }

  // getAvailableTable() {
  //   var count = 0;
  //   var today = new Date();
  //   var h = today.getHours();
  //   var a;
  //   a = (h > 11) ? 'pm' : 'am';
  //   h = (h > 12) ? h - 12 : h;

  //   this.currentHour = this.checkTime(h) + ":00" + a;

  //   for (var i = 0; i < this.tables.length; i++) {
  //     for (var x = 0; x < this.tables[i].reservation.length; x++) {
  //       if (this.tables[i].reservation[x].time == this.currentHour && !this.tables[i].reservation[x].text) {
  //         count++;
  //       }
  //     }
  //   }
  //   return count;
  // }

  // getStatus(reservation: any): string {
  //   if (typeof reservation.time === 'string') {
  //     const parts = reservation.time.split(':');
  //     const hour = parseInt(parts[0], 10);
  //     // Additional logic based on the split time
  //     // Example logic to return status based on hour
  //     return hour >= 12 ? 'PM' : 'AM';
  //   }
  //   return 'Invalid time';  // Handle the case where time is not properly set
  // }

  // checkAvailable(reservation: any[]): boolean {
  //   const currentTime = new Date();
  //   return reservation.some(r => {
  //     const reservationTime = new Date(r.time);
  //     return reservationTime.getHours() === currentTime.getHours() && reservationTime.getMinutes() === currentTime.getMinutes();
  //   });
  // }

  fetchTables() {
    if (this.restaurantID) {
      this.menuApiService.getTablesByRestaurantId(this.restaurantID).subscribe({
        next: (response) => {
          this.tables = response;
          console.log(this.tables);
          if (this.selectedArea) {
            this.filterTablesByArea(this.selectedArea);
          }
        },
        error: (err) => {
          console.error('Error fetching tables:', err);
        }
      });
    }
  }

  fetchAreas() {
    if (this.restaurantID) {
      this.menuApiService.getAreasByRestaurantId(this.restaurantID).subscribe({
        next: (response) => {
          this.areas = response; // Assign areas data to the array
          this.selectedArea = this.areas[0]; // Set the first area as the default selected area
          this.intervalId = setInterval(() => {
            this.filterTablesByArea(this.selectedArea);
          }, 120000);
        },
        error: (err) => {
          console.error('Error fetching areas:', err);
        }
      });
    }
  }

  filterTablesByArea(area: any) {
    if (area && this.tables) {
      this.filteredTables = this.tables.filter(table => area.tableIds.includes(table.id));
      console.log("Filtered tables:", this.filteredTables);

      this.liveStatusFetched = false;
      this.fetchLiveStatus(); 
      this.fetchUpcomingReservations();

    }
  }

  selectArea(area: any) {
    console.log("Area selected:", area.areaName);

    this.selectedArea = area;
    this.filterTablesByArea(area); // Update filtered tables based on selected area
  }

  fetchUpcomingReservations(): void {
    const selectedDate = this.datePipe.transform(
      new Date(this.datepickerComponentValue.year, this.datepickerComponentValue.month - 1, this.datepickerComponentValue.day),
      'yyyy-MM-dd'
    );
    this.tableApiService
      .getUpcomingReservations(this.restaurantID, this.selectedArea.id, selectedDate)
      .subscribe({
        next: (response) => {
          console.log('Upcoming reservations:', response);
          this.upcomingReservations = response; // Store the response in the upcomingReservations array
        },
        error: (err) => {
          console.error('Error fetching upcoming reservations:', err);
        },
      });
  }

  formatTime(time: string): string {
    const date = new Date(`1970-01-01T${time}Z`); // Parse the time string as a date
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour
    const formattedMinutes = minutes.toString().padStart(2, '0'); // Ensure minutes are two digits
    return `${formattedHours}:${formattedMinutes}`;
  }

  // Get AM/PM based on the time
  getAMPM(time: string): string {
    const date = new Date(`1970-01-01T${time}Z`);
    const hours = date.getHours();
    return hours >= 12 ? 'PM' : 'AM';
  }

  // Get the table number based on the tableId
  getTableNumber(tableId: number): string {
    // Find the table by tableId from the tables array
    const table = this.tables.find(t => t.id === tableId);
    console.log(table.tableName)
    return table ? table.tableName : 'N/A';  // Return table name or N/A if not found
  }

  // fetchLiveStatus() {
  //   const selectedDate = this.datePipe.transform(
  //     new Date(this.datepickerComponentValue.year, this.datepickerComponentValue.month - 1, this.datepickerComponentValue.day),
  //     'yyyy-MM-dd'
  //   );

  //   const currentDate = new Date();
  //   const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

  //   if (this.restaurantID && this.selectedArea) {
  //     this.tableApiService.getLiveStatus(this.restaurantID, this.selectedArea.id, selectedDate, currentTime).subscribe({
  //       next: (response) => {
  //         this.updateTableStatuses(response);
  //       },
  //       error: (err) => {
  //         console.error('Error fetching live status:', err);
  //       }
  //     });
  //   }
  // }
  fetchLiveStatus() {
    // Only call the live status API if the status hasn't been fetched yet
    if (this.liveStatusFetched) {
      console.log("Live status already fetched, skipping fetch.");

      return;
    }

    const selectedDate = this.datePipe.transform(
      new Date(this.datepickerComponentValue.year, this.datepickerComponentValue.month - 1, this.datepickerComponentValue.day),
      'yyyy-MM-dd'
    );

    const currentDate = new Date();
    const currentTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
    console.log("Fetching live status for selected area:", this.selectedArea.areaName);

    if (this.restaurantID && this.selectedArea) {
      this.tableApiService.getLiveStatus(this.restaurantID, this.selectedArea.id, selectedDate, currentTime).subscribe({
        next: (response) => {
          console.log("Live status response:", response);

          this.updateTableStatuses(response);
          this.liveStatusFetched = true; // Set to true to avoid calling API again
        },
        error: (err) => {
          console.error('Error fetching live status:', err);
        }
      });
    }
  }

  getAvailableTableForArea(area: any): number {
    if (!area || !this.tables) return 0;
    // Filter tables byarea and count how many tables are vacant
    const availableTables = this.tables.filter(table =>
      area.tableIds.includes(table.id) && table.status === 'vacant'
    );

    return availableTables.length;
  }

  updateTableStatuses(liveStatusData: any[]) {
    console.log("Updating table statuses with live data:", liveStatusData);

    // Keep track of whether any table's status was updated
    let statusUpdated = false;

    // Loop through live status data
    liveStatusData.forEach(status => {
      // Find the table using tableId
      const table = this.tables.find(t => t.id === status.tableId);

      if (table) {
        // If a matching table is found, update its status
        console.log(`Updating status for table ${table.tableName}:`, status.status);

        table.status = status.status.toLowerCase(); // Set the status as VACANT, RESERVED, etc.
        table.reservedBy = status.reservedBy;
        table.startTime = status.startTime;
        // Flag that a table's status was updated
        statusUpdated = true;
      } else {
        console.log(`Table with ID ${status.tableId} not found.`);
      }
    });

    // If any status was updated, re-filter tables
    // if (statusUpdated) {
    //   console.log("Re-filtering tables after live status update.");
    //   this.filterTablesByArea(this.selectedArea); // Re-filter tables based on selected area
    // }
  }


}
