import { Component } from '@angular/core';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { Store } from '@ngrx/store';
import { MenuApiService } from '../../../service/api-services/menu-api.service';

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrl: './taxes.component.scss'
})
export class TaxesComponent {


  showTaxes: boolean = false;
  restaurantID: string | null = null;
  taxes: any[] = [];
  editTax  : any = null;

  constructor( private store: Store,private menuApiService: MenuApiService) {
    // Get the restaurant ID from the store
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
      if (this.restaurantID) {
        this.fetchTaxes();
      }
    });
  }

  ngOnInit(): void {
    this.fetchTaxes();
  }


  fetchTaxes(){
    if (this.restaurantID) {
      this.menuApiService.getTaxesByRestaurantId(+this.restaurantID)
        .subscribe({
          next: (response) => {
            this.taxes = response; 
          },
          error: (err) => {
            console.error('Error fetching add-ons:', err);
          },
        });
    }
  }
  toggleTax() {
    this.showTaxes = !this.showTaxes;
  }

  onEdit(tax : any) {
    this.showTaxes = !this.showTaxes;
    this.editTax = tax;
  }
  closeCreateTax($event) {
    this.showTaxes = false;
    this.editTax = null;
  }

}
