	import { ChangeDetectorRef, Component } from '@angular/core';
	import { HttpClient } from '@angular/common/http';
	import { selectRestaurantId } from '../../../store/restaurant.selectors';
	import { Store } from '@ngrx/store';
	import { AppSettings } from '../../../service/app-settings.service';
	import { NgbDateStruct, 
			NgbCalendar, 
			NgbDate } from '@ng-bootstrap/ng-bootstrap';
	import { DatePipe } from '@angular/common';
	import { MenuApiService } from '../../../service/api-services/menu-api.service';
	import { WebSocketService } from '../../../service/websocket service/websocket.service';
	import { TableManagementApiService } from '../../../service/api-services/table-management-api.service'
	import { ToastService } from '../../../service//toast.service';

	declare var bootstrap: any;

	@Component({
	selector: 'pos-table-booking',
	templateUrl: './pos-table-booking.html',
	//styleUrl: './pos-table-booking.scss'

	})

	export class PosTableBookingPage {
		tables: any[] = [];
		reservationTimings:  any[] = [];
		selectedArea: any = null;
		currentHour: any = '';
		modal: any = '';
		modalData: any = '';
		restaurantID: string | null = null;
		areas: any[] = [];
		filteredTables: any[] = [];
		isTimeSlotBooking: boolean = false; 
		mealTypes: string[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'BRUNCH'];
		bookingStatus: { icon: string, message: string } | null = null;
		reservationData: any = {};
		selectedTimeSlot: string | null = null;
		selectedTimeSlotByArea: { [areaId: string]: string | null } = {};
		tableStatusMap: { [tableId: number]: string } = {}; 
		selectedTimeSlotStyle: string | null = null;
		liveStatuses: any[] = [];
		progressBarValue: number = 100; 
  		progressInterval: any; 
		isLoading = false; 

		datepickerComponentValue: NgbDateStruct = { year: 0, month: 0, day: 0 }; 
		minDate: NgbDateStruct; 
		maxDate: NgbDateStruct; 
		selectedMealType: string = '';
		isUpdateMode: boolean;
		
		constructor(private appSettings: AppSettings, 
			private http: HttpClient, 
			private cdr: ChangeDetectorRef,
			private datePipe: DatePipe,
			private store: Store,
			private menuApiService: MenuApiService,
			private websocketService: WebSocketService,
			private toastService: ToastService,
		private tableApiService: TableManagementApiService) {
		this.appSettings.appHeaderNone = true;
		this.appSettings.appSidebarNone = true;
		this.appSettings.appContentClass = 'p-0';
		this.appSettings.appContentFullHeight = true;

		this.store.select(selectRestaurantId).subscribe(id => {
			this.restaurantID = id;
			if (this.restaurantID) {
				this.fetchTables();
				this.fetchAreas();  
				this.fetchReservationTimings();
				this.fetchReservationData();
			}
		});
	}
		
	ngOnInit() {

		const today = new Date();
		this.datepickerComponentValue = {
		year: today.getFullYear(),
		month: today.getMonth() + 1,
		day: today.getDate()
		};

		this.minDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
		this.maxDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() + 30 }; // 30 days ahead

		//console.log('Connecting to WebSocket...');
		// this.websocketService.connect();

		// // Subscribe to live statuses from the WebSocket service
		// this.websocketService.getLiveStatuses().subscribe((statuses: any[]) => {
		// 	console.log('Received live statuses:', statuses); // Log the live statuses
		// 	this.liveStatuses = statuses;
		// 	this.updateTableStatuses(); // Update the table statuses based on live data
		//   }, (error) => {
		// 	console.error('Error receiving live statuses:', error); // Log if there's an error
		//   });

	}


	// updateTableStatuses() {
	// 	if (this.reservationData && this.liveStatuses.length) {
	// 	  this.reservationData.forEach((table) => {
	// 		const liveStatus = this.liveStatuses.find(status => status.tableId === table.id);
	// 		if (liveStatus) {
	// 		  table.status = liveStatus.status; // Update table status with the live status
	// 		}
	// 	  });
	// 	  this.cdr.detectChanges(); // Trigger change detection to update the view
	// 	}
	//   }

	// updateTableStatuses() {
	// 	if (this.reservationData && this.liveStatuses.length) {
	// 	  // Iterate over each tableId in reservationData using Object.keys
	// 	  Object.keys(this.reservationData).forEach((tableId) => {
	// 		// Find the corresponding live status from liveStatuses
	// 		const liveStatus = this.liveStatuses.find(status => status.tableId === parseInt(tableId));
	  
	// 		// If we found the live status, update the table's status
	// 		if (liveStatus) {
	// 		  // Find the table in filteredTables using tableId
	// 		  const table = this.filteredTables.find(t => t.id === parseInt(tableId));
			  
	// 		  // If the table is found, update its status
	// 		  if (table) {
	// 			table.status = liveStatus.status; // Update the table's status with the live status
	// 		  }
	// 		}
	// 	  });
	  
	// 	  // Trigger change detection to update the view
	// 	  this.cdr.detectChanges();
	// 	}
	//   }
	  
	  
	  updateTableStatuses() {
		if (this.reservationData && this.liveStatuses.length) {
		  console.log('Reservation Data in updateTable:', this.reservationData);
		  console.log('Live Statuses in updateTable:', this.liveStatuses);
	  
		  // Iterate over each tableId in reservationData using Object.keys
		  Object.keys(this.reservationData).forEach((tableId) => {
			console.log('Processing tableId:', tableId);
	  
			// Find the corresponding live status from liveStatuses
			const liveStatus = this.liveStatuses.find(status => status.tableId === parseInt(tableId));
	  
			console.log('Found live status for tableId', tableId, ':', liveStatus);
	  
			// If we found the live status, update the table's status
			if (liveStatus) {
			  // Find the table in filteredTables using tableId
			  const table = this.filteredTables.find(t => t.id === parseInt(tableId));
	  
			  console.log('Found table in filteredTables:', table);
	  
			  // If the table is found, update its status
			  if (table) {
				console.log('Updating table status:', table.tableNumber, 'to', liveStatus.status);
				table.status = liveStatus.status; // Update the table's status with the live status
			  } else {
				console.log('Table not found in filteredTables for tableId:', tableId);
			  }
			} else {
			  console.log('No live status found for tableId:', tableId);
			}
		  });
	  
		  // Trigger change detection to update the view
		  this.cdr.detectChanges();
		  console.log('Change detection triggered to update the view.');
		} else {
		  console.log('No reservationData or liveStatuses to update.');
		}
	  }
	  

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
			  this.areas = response;  // Assign areas data to the array
			  this.selectedArea = this.areas[0]; // Set the first area as the default selected area
			  this.filterTablesByArea(this.selectedArea); // Filter tables for the selected area
			},
			error: (err) => {
			  console.error('Error fetching areas:', err);
			}
		  });
		}
	  }

	checkTime(i: any) {
		if (i < 10) {
		i = "0" + i;
		}
		return i;
	}


	  // Filter tables based on the selected area
	filterTablesByArea(area: any) {
		if (area && this.tables) {
		  this.filteredTables = this.tables.filter(table => area.tableIds.includes(table.id));
		  this.fetchReservationData();
		}
	}
	
	  // Handle area tab click to set the selected area and filter tables
	selectArea(area: any) {
		this.selectedArea = area;
		this.filterTablesByArea(area); // Update filtered tables based on selected area
	}

	
	  
	   // Fetch reservation timings from the new API based on restaurantId
  	fetchReservationTimings() {
    if (this.restaurantID) {
      this.menuApiService.getBusinessHoursByRestaurantId(this.restaurantID).subscribe({
        next: (response) => {
          const businessHours = response[0]; 
          const openingTime = businessHours.openingTime;
          const closingTime = businessHours.closingTime;
          const allowThirtyMinutesSlots = businessHours.allowThirtyMinutesSlots;

          this.reservationTimings = this.generateTimeSlots(
            openingTime,
            closingTime,
            allowThirtyMinutesSlots
          );
        },
        error: (err) => {
          console.error('Error fetching reservation timings:', err); // Handle error
        },
      	});
    	}
  	}

	fetchReservationData() {
		const selectedDate = this.datePipe.transform(
		  new Date(this.datepickerComponentValue.year, this.datepickerComponentValue.month - 1, this.datepickerComponentValue.day),
		  'yyyy-MM-dd'
		);
	
		if (this.restaurantID && this.selectedArea) {
		  this.tableApiService.getReservationsForArea(this.restaurantID, this.selectedArea.id,  selectedDate).subscribe({
			next: (response) => {
			  this.reservationData = response;
			  console.log('Reservation data:', this.reservationData);
			},
			error: (err) => {
			  console.error('Error fetching reservation data:', err);
			}
		  });
		}
	  }

// Function to convert time from 12-hour format (e.g., "6:00am") to 24-hour format (e.g., "06:00:00")
convertTo24HourFormatForTableTimeSlot(time: string): string {
	const [hour, minutePart] = time.split(':');
	const [minute, period] = minutePart.split(/(am|pm)/i); // Split minute and period (AM/PM)
  
	let hour24 = parseInt(hour, 10);
  
	// Convert to 24-hour format
	if (period.toLowerCase() === 'pm' && hour24 !== 12) {
	  hour24 += 12;  // Convert PM times (except for 12 PM)
	} else if (period.toLowerCase() === 'am' && hour24 === 12) {
	  hour24 = 0;  // Convert 12 AM to 00
	}
  
	// Format hour as two digits
	const formattedHour = hour24 < 10 ? `0${hour24}` : `${hour24}`;
	return `${formattedHour}:${minute}:00`; // Add seconds to make it consistent with API response
  }
  

  isSlotReserved(time: string, tableId: number): boolean {
	const formattedTime = this.convertTo24HourFormatForTableTimeSlot(time);  // Convert the UI time to 24-hour format
	const tableReservations = this.reservationData[tableId];
	if (tableReservations) {
	  const reservation = tableReservations.find(res => res.startTime === formattedTime);
	
	  if (reservation) {
		return reservation.status === 'RESERVED';
	  }
	}
	return false; 
  }
  
//   selectTimeSlot(reservation: any) {
// 	this.selectedTimeSlot = reservation.time; // Set the selected time slot
// 	this.filterTablesByArea(this.selectedArea); // Filter tables for the current area
//   }
//   selectTimeSlot(reservation: any) {
// 	if (this.selectedArea && this.selectedArea.id) {
// 	  this.selectedTimeSlotByArea[this.selectedArea.id] = reservation.time; // Set selected time slot for the current area
// 	  //this.filterTablesByArea(this.selectedArea); // Filter tables for the current area
// 	}
//   }
selectTimeSlot(reservation: any) {
	this.toastService.showLoader();

	if (this.selectedArea && this.selectedArea.id && this.restaurantID) {
	  const timeSlot24Hour = this.convertTo24HourFormat(reservation.time); // Convert to 24-hour format
	  const formattedDate = this.datePipe.transform(
		new Date(this.datepickerComponentValue.year, this.datepickerComponentValue.month - 1, this.datepickerComponentValue.day),
		'yyyy-MM-dd'
	  );
	  this.selectedTimeSlotStyle = reservation.time;
	  //console.log('Selected time slot style:', this.selectedTimeSlotStyle);
	  this.cdr.detectChanges();
	  // Call the API to fetch table availability
	  this.tableApiService.getTimeSlotAvailability(timeSlot24Hour, this.restaurantID, this.selectedArea.id, formattedDate!)
		.subscribe({
		  next: (response) => {
			this.toastService.hideLoader();

			// Update the tableStatusMap with the API response
			this.tableStatusMap = response.reduce((map, table) => {
			  map[table.tableId] = table.status; // Set the status for each table
			  return map;
			}, {});
			this.cdr.detectChanges();
		  },
		  error: (err) => {
			console.error('Error fetching table availability:', err);
		  }
		});
	}
  }

  getTableStatusClass(tableId: number): string {
	const status = this.tableStatusMap[tableId];
	return status === 'VACANT' ? 'vacant' : status === 'RESERVED' ? 'reserved' : '';
  }
  
  
// Generate time slots based on opening time, closing time, and whether 30-minute slots are allowed
	generateTimeSlots(openingTime: string, closingTime: string, allowThirtyMinutesSlots: boolean) {
		const slots = [];
		let startHour = parseInt(openingTime.split(':')[0]);
		let startMinute = parseInt(openingTime.split(':')[1]);
	
		let endHour = parseInt(closingTime.split(':')[0]);
		let endMinute = parseInt(closingTime.split(':')[1]);
	
		const formatTime = (hour: number, minute: number): string => {
		const suffix = hour < 12 ? 'am' : 'pm';
		const formattedHour = hour % 12 === 0 ? 12 : hour % 12;  // Convert 0 to 12 for 12am and 12pm
		const formattedMinute = minute === 0 ? '00' : `${minute}`;
		return `${formattedHour}:${formattedMinute}${suffix}`;
		};
	
		if (allowThirtyMinutesSlots) {
		// Generate 30-minute slots
		while (startHour < endHour || (startHour === endHour && startMinute < endMinute)) {
			const time = formatTime(startHour, startMinute);
			slots.push({ time: time, text: '' }); 
			startMinute += 30;
			if (startMinute === 60) {
			startMinute = 0;
			startHour++;
			}
		}
		} else {
		// Generate hourly slots
		while (startHour < endHour || (startHour === endHour && startMinute === 0)) {
			const time = formatTime(startHour, startMinute);
			slots.push({ time: time, text: '' }); 
			startHour++;
		}
		}
	
		if (startHour === endHour && startMinute === endMinute) {
			const time = formatTime(endHour, endMinute);
			slots.push({ time: time, text: '' });
		}
		return slots;
	}

	toggleTimeSlotBooking() {
		this.isTimeSlotBooking = !this.isTimeSlotBooking;
	  }
  
	showTimeSlotBooking() {
		this.isTimeSlotBooking = true;
	  }
	
	  // Go back to Table Booking
	  goBackToTableBooking() {
		this.isTimeSlotBooking = false;
	  }

	getTime() {
		var today = new Date();
		var h = today.getHours();
		var m = today.getMinutes();
		var s = today.getSeconds();
		var a;
		m = this.checkTime(m);
		s = this.checkTime(s);
		a = (h > 11) ? 'pm' : 'am';
		h = (h > 12) ? h - 12 : h;

		setTimeout(() => this.getTime(), 500);

		return h + ":" + m + a;
	}
	

		
	checkSameHour(time: any) {
			var today = new Date();
			var currentFullHour = today.getHours();
			var currentAmPm = (currentFullHour > 12) ? 'pm' : 'am';
			var hour = (currentFullHour > 12) ? currentFullHour - 12 : currentFullHour;
			var currentHour = (hour < 10) ? '0' + hour : hour;
			var currentTime = currentHour + ':00' + currentAmPm;
			
			if (currentTime == time) {
				return true;
			}
			return false;
		}
		
	checkAvailable(reservation: any) {
			for (var x = 0; x < reservation.length; x++) {
				var time = reservation[x].time.split(':');
				var hour = parseInt(time[0]);
				var today = new Date();
				var currentHour = today.getHours();
						currentHour = (currentHour > 12) ? currentHour - 12 : currentHour;
			
				if (currentHour == hour && reservation.text) {
					return true;
				}
			}
			return false;
		}

		
	// Function to convert time from 12-hour format (e.g., "08:00pm") to 24-hour format (e.g., "20:00")
	convertTo24HourFormat(time: string): string {
			const [hour, minutePart] = time.split(':');
			const [minute, period] = minutePart.split(/(am|pm)/i); // Split minute and period (AM/PM)
		
			let hour24 = parseInt(hour, 10);
		
			// Convert to 24-hour format
			if (period.toLowerCase() === 'pm' && hour24 !== 12) {
			hour24 += 12;  // Convert PM times (except for 12 PM)
			} else if (period.toLowerCase() === 'am' && hour24 === 12) {
			hour24 = 0;  // Convert 12 AM to 00
			}
		
			// Format hour as two digits
			const formattedHour = hour24 < 10 ? `0${hour24}` : `${hour24}`;
			return `${formattedHour}:${minute}`;
		}

	getPaxOptions(maxPax: number): number[] {
			return Array.from({ length: maxPax }, (_, i) => i + 1);
		  }
	

		
	showBookingModal(event: MouseEvent, table: any, selectedTime: string) {
			event.preventDefault();
		  
			// Format the selected date
			const formattedDate = this.datePipe.transform(
			  new Date(this.datepickerComponentValue.year, this.datepickerComponentValue.month - 1, this.datepickerComponentValue.day),
			  'yyyy-MM-dd'
			);
		  
			// Find the reservation for the selected table and time
			const reservation = this.reservationData[table.id]?.find(res => res.startTime === this.convertTo24HourFormatForTableTimeSlot(selectedTime));
		  
			if (reservation) {
			  // If there is an existing reservation, populate the modal with reservation data
			  this.modalData = {
				reservationid: reservation.id, // This is reservation.id, used for API URL during update
				id: table.id,	
				name: table.tableNumber,
				pax: reservation.paxCount,
				mealType: reservation.slotType,
				selectedDate: formattedDate,
				selectedTime: selectedTime,
				customerName: reservation.reservedBy,
				customerPhone: reservation.phoneNumber,
				selectedPax: reservation.paxCount,
				status: reservation.status,
				notes:reservation.notes,
				origin:reservation.origin
			  };
			  this.isUpdateMode = true; // Mark as update mode
			} else {
			  // If the time slot is available, initialize modalData with empty values
			  this.modalData = {
				id: table.id, // table.id used for new reservation
				name: table.tableNumber,
				pax: table.numberOfPersons,
				mealType: '',
				selectedDate: formattedDate,
				selectedTime: selectedTime,
				customerName: '',
				customerPhone: '',
				selectedPax:'', // Default pax count
				status: '',
				notes:'',
				origin:''
			  };
			  this.isUpdateMode = false; // Mark as create mode
			}
		  
			this.cdr.detectChanges();
			this.bookingStatus = null;
		  
			// Show the booking modal
			const modalPosBooking = document.getElementById('modalPosBooking');
			if (modalPosBooking) {
			  this.modal = new bootstrap.Modal(modalPosBooking);
			  this.modal.show();
			}
		  }
		  
		  
		  
	submitBooking() {
		
 		this.isLoading = true;
			// Ensure all fields are filled
			if (this.modalData.mealType && this.modalData.customerName && this.modalData.customerPhone && this.modalData.selectedPax) {
			  // Create payload
			  const reservationPayload = {
				tableId:  this.modalData.id,  // Always pass table.id (for both new and update)
				areaId: this.selectedArea.id, 
				restaurantId: this.restaurantID,
				reservationDate: this.modalData.selectedDate,
				slotType: this.modalData.mealType,
				reservedBy: this.modalData.customerName,
				phoneNumber: this.modalData.customerPhone,
				paxCount: this.modalData.selectedPax,
				notes:this.modalData.notes,
				origin:this.modalData.origin,
				startTime: this.convertTo24HourFormat(this.modalData.selectedTime),
			  };
		  
			  // Check if we are updating (isUpdateMode) or creating a new reservation
			  if (this.isUpdateMode) {
				// If we are updating, use the PUT API with reservation.id in the URL
				this.tableApiService.updateReservation(this.modalData.reservationid, reservationPayload).subscribe(
				  (response) => {
					//this.toastService.hideLoader();
					this.isLoading = false;
					console.log('Reservation successfully updated:', response);
					this.bookingStatus = {
					  icon: '/assets/img/pos/success-icon11.gif',
					  message: 'Table updated successfully'
					};
					this.startProgressBar();
					this.fetchReservationData();
					this.selectTimeSlot({ time: this.selectedTimeSlotStyle }); 
					//this.toastService.hideLoader();
				  },
				  (error) => {
					//this.toastService.hideLoader();
					console.error('Error updating reservation:', error);
					this.bookingStatus = {
					  icon: '/assets/img/pos/error-icon4.png',
					  message: 'Error updating table. Something went wrong'
					};
					this.startProgressBar();
					//this.toastService.hideLoader();

					// Handle failure
				  }
				);
			  } else {
				// If we are creating a new reservation, use the POST API (existing code)
				this.tableApiService.reserveTable(reservationPayload).subscribe(
				  (response) => {
					//this.toastService.hideLoader();
					this.isLoading = false;
					console.log('Reservation successfully created:', response);
					this.bookingStatus = {
					  icon: '/assets/img/pos/success-icon11.gif',
					  message: 'Table reserved successfully'
					};
					this.startProgressBar();
					this.fetchReservationData();
					this.selectTimeSlot({ time: this.selectedTimeSlotStyle }); 
					//this.toastService.hideLoader();
				  },
				  (error) => {
					this.toastService.hideLoader();
					console.error('Error creating reservation:', error);
					this.bookingStatus = {
					  icon: '/assets/img/pos/error-icon4.png',
					  message: 'Error booking table. Something went wrong'
					};
					this.startProgressBar();
					//this.toastService.hideLoader();

					// Handle failure
				  }
				);
			  }
			}
		  }
		  

		  startProgressBar() {
			this.progressBarValue = 100; // Reset to full
			const intervalDuration = 25; // Update progress bar every 50ms
			const decrementValue = 100 / 100; // Decrease by 1% every interval
		
			this.progressInterval = setInterval(() => {
			  if (this.progressBarValue > 0) {
				this.progressBarValue -= decrementValue;
			  } else {
				clearInterval(this.progressInterval); // Stop the interval once it reaches 0
				this.closeModal(); // Close the modal after progress completes
			  }
			}, intervalDuration);
		  }
		
		  closeModal() {
			const modalPosBooking = document.getElementById('modalPosBooking');
			if (modalPosBooking) {
			  const modal = bootstrap.Modal.getInstance(modalPosBooking);
			  modal.hide(); // Close the modal programmatically
			}
			this.toastService.hideLoader();

		  }

	ngOnDestroy() {
		this.appSettings.appHeaderNone = false;
		this.appSettings.appSidebarNone = false;
		this.appSettings.appContentClass = '';
		this.appSettings.appContentFullHeight = false;
		this.websocketService.disconnect();

	}
	}
