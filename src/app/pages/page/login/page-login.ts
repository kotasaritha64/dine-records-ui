import { Component } from '@angular/core';
import { Router }    from '@angular/router';
import { NgForm }    from '@angular/forms';
import { AppSettings } from '../../../service/app-settings.service';
import { AuthService } from '../../../service/auth.service';
import { User } from '../../../models/user.model';
import { RestaurantApiService } from '../../../service/api-services/restaurant-api.service';
import { Store } from '@ngrx/store';
import { setRestaurantId } from '../../../store/restaurant.actions';

@Component({
  selector: 'page-login',
  templateUrl: './page-login.html'
})

export class LoginPage {

  // user  = {
  //   email: '',
  //   password: ''
  // };

  user: User = {
    name: '',
    email: 'kantuat93@gmail.com',
    password: 'Shopping86$',
    confirmPassword: '',
    country: '',
    restaurantName: '',
    gstnNumber:''
  };

  errorMessage: string = '';

  constructor(private router: Router,  private authService: AuthService, 
    private appSettings: AppSettings, 
    private restaurantapiservice: RestaurantApiService,
    private store: Store) {
    this.appSettings.appSidebarNone = true;
    this.appSettings.appHeaderNone = true;
    this.appSettings.appContentClass = 'p-0';
  }
  
  async formSubmit(f: NgForm) {
    // Check if form is valid
    if (f.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }


    try {
      // Call AuthService to log in the user
      await this.authService.signIn(this.user.email, this.user.password);
       // Fetch restaurant ID by making an API call
      this.restaurantapiservice.getRestaurantByUserEmail(this.user.email).subscribe({
        next: (restaurant) => {
          const restaurantId = restaurant.id;
          // Dispatch restaurantId to NgRx store
          this.store.dispatch(setRestaurantId({ restaurantId }));
          console.log('Restaurant ID dispatched during Login:', restaurantId);
        },
        error: (error) => {
          console.error('Failed to fetch restaurant details: ', error);
        }
      });
    } catch (error) {
      console.error('Login Error: ', error);
    }
  }

  ngOnDestroy() {
    this.appSettings.appSidebarNone = false;
    this.appSettings.appHeaderNone = false;
    this.appSettings.appContentClass = '';
  }
  
	// formSubmit(f: NgForm) {
  //   this.router.navigate(['/dashboard']);
  // }
}
