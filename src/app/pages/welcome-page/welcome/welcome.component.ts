import { Component } from '@angular/core';
import { Router }    from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
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

  constructor(private router: Router) {}

  navigateToSection(route: string) {
    this.router.navigate([route]);
  }


}
