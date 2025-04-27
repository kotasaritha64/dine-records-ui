import { Component, OnInit } from '@angular/core';
import { Router }    from '@angular/router';
import { NgForm }    from '@angular/forms';
import { AppSettings } from '../../../service/app-settings.service';
import { countries } from '../../../shared/country-data-store'; 
import { User } from '../../../models/user.model';
import { AuthService } from '../../../service/auth.service';
import { RestaurantApiService } from '../../../service/api-services/restaurant-api.service';
import { FormBuilder, FormGroup, Validators, AbstractControl , ValidatorFn} from '@angular/forms';
import { Store } from '@ngrx/store';
import { setRestaurantId } from '../../../store/restaurant.actions';
declare var bootstrap: any; 

@Component({
  selector: 'page-register',
  templateUrl: './page-register.html'
})


export class RegisterPage implements OnInit{
  form: FormGroup;
  countries = countries;
  restaurantId: string | null = null;

  constructor(private router: Router, private authService: AuthService, 
    private appSettings: AppSettings , 
    private restaurantService: RestaurantApiService, 
    private fb: FormBuilder,
    private store: Store) {
    this.appSettings.appSidebarNone = true;
    this.appSettings.appHeaderNone = true;
    this.appSettings.appContentClass = 'p-0';
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required],
      country: ['India', Validators.required],
      phoneNumber: ['', Validators.required],
      restaurantName: ['', Validators.required],
      gstn: ['', [Validators.required, this.gstinValidator()]],
      agree: [false, Validators.requiredTrue]
    }, { validator: this.passwordMatchValidator });
  } 

  async signUpFormSubmit() {
    // Check if form is valid
    if (this.form.invalid) {
      alert('Please fill in all required fields.');
      return;
    }

      try {
          // Call AuthService to register the user
          const email = this.form.get('email')?.value;
          const password = this.form.get('password')?.value;
          await this.authService.register(email, password);
          // Call the restaurant registration API with necessary fields
          const restaurantPayload = {
            userName: this.form.get('name')?.value,
            restaurantName: this.form.get('restaurantName')?.value,
            country: this.form.get('country')?.value,
            phoneNumber: this.form.get('phoneNumber')?.value,
            email: this.form.get('email')?.value,
            gstn: this.form.get('gstn')?.value
          };
          this.restaurantService.registerRestaurant(restaurantPayload).subscribe({
            next: (restaurantResponse) => {
              // Handle success, store restaurant ID
              const restaurantId = restaurantResponse.id; 
            
               // Dispatch NgRx action to store restaurant ID
              this.store.dispatch(setRestaurantId({ restaurantId }));
             // localStorage.setItem('restaurantId', restaurantId);
             console.log('Restaurant ID dispatched during signup:', restaurantId);
             
              const successModal = new bootstrap.Modal(document.getElementById('modalSuccess'));
              successModal.show();
              this.form.reset();
            },
            error: async (error) => {
              alert('Restaurant registration failed: ' + error.message);      
              // Rollback Firebase registration
              await this.authService.deleteCurrentUser();
              this.form.reset();
            }
          });
      
        } catch (error) {
          alert('Registration failed: ' + error.message);
        }
      }

  onSuccessOk() {
    this.router.navigate(['/page/login']);
  }

  ngOnDestroy() {
    this.appSettings.appSidebarNone = false;
    this.appSettings.appHeaderNone = false;
    this.appSettings.appContentClass = '';
  }
  
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password && confirmPassword && password !== confirmPassword ? { 'passwordMismatch': true } : null;
  }

  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control.value) {
        return null; // No error if control value is empty
      }

      // Regular expression to validate password strength
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      const valid = passwordPattern.test(control.value);

      return valid ? null : { 'passwordStrength': true };
    };
  }

  gstinValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const gstin = control.value;

      // Basic validation for GSTIN (15 alphanumeric characters)
      const gstinPattern = /^[A-Z0-9]{15}$/;

      return gstinPattern.test(gstin) ? null : { 'invalidGstin': true };
    };
  }

}
