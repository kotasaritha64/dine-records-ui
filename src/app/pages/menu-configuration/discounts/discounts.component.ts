import { Component } from '@angular/core';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { Store } from '@ngrx/store';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-discounts',
  templateUrl: './discounts.component.html',
  styleUrl: './discounts.component.scss'
})
export class DiscountsComponent {

  showDiscounts: boolean = false;
  restaurantID: string | null = null;
  discounts: any[] = [];


  constructor( private store: Store,private menuApiService: MenuApiService) {
    // Get the restaurant ID from the store
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
      if (this.restaurantID) {
        this.fetchDiscounts();
      }
    });
  }

  ngOnInit(): void {
    this.fetchDiscounts();
  }


  fetchDiscounts(){
    if (this.restaurantID) {
      this.menuApiService.getDiscountsByRestaurantId(+this.restaurantID)
        .subscribe({
          next: (response) => {
            debugger;
            this.discounts = response; 
          },
          error: (err) => {
            console.error('Error fetching add-ons:', err);
          },
        });
    }
  }
  toggleDiscount() {
    this.showDiscounts = !this.showDiscounts;
  }
  closeCreateDiscount(){
    this.showDiscounts =  false;
  }
}
