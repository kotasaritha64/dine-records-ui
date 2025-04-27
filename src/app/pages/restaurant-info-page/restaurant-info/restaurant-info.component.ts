import { Component, OnInit } from '@angular/core';
import { Router }    from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-restaurant-info',
  standalone: false,
  templateUrl: './restaurant-info.component.html',
  styleUrl: './restaurant-info.component.scss'
})
export class RestaurantInfoComponent implements OnInit{
  sections = [
    { title: 'Add Menu', route: '/welcome/add-menu', icon: 'mdi mdi-food' },
    { title: 'Seating', route: '/welcome/seating', icon: 'mdi mdi-chair' },
    { title: 'Tax Info', route: '/welcome/tax-info', icon: 'mdi mdi-cash' },
    { title: 'Staff Onboarding', route: '/welcome/staff-onboarding', icon: 'mdi mdi-account-group' },
    { title: 'Payment Methods', route: '/welcome/payment-methods', icon: 'mdi mdi-credit-card' },
    { title: 'Working Days', route: '/welcome/working-days', icon: 'mdi mdi-calendar' },
    { title: 'Vendors Info', route: '/welcome/vendors-info', icon: 'mdi mdi-store' },
    { title: 'Inventory', route: '/welcome/inventory', icon: 'mdi mdi-warehouse' },
    { title: 'Restaurant Details', route: '/welcome/restaurant-details', icon: 'mdi mdi-home' }
  ];
  code5: any;

  constructor(private router: Router , private http : HttpClient) {
  }

  ngOnInit(): void {
    this.http.get('/assets/data/ui-card/code-5.json', { responseType: 'text' }).subscribe(data => {
    	this.code5 = data;
		});
  }
  navigateToSection(route: string) {
    this.router.navigate([route]);
  }


}
