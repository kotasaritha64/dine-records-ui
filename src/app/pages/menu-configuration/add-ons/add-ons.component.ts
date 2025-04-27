import { HttpClient } from '@angular/common/http';
import { Component, ChangeDetectorRef } from '@angular/core';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { Store } from '@ngrx/store';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { ToastService } from '../../../service/toast.service';


@Component({
  selector: 'app-add-ons',
  templateUrl: './add-ons.component.html',
  styleUrl: './add-ons.component.scss'
})
export class AddOnsComponent {
  showAddOn: boolean = false;
  showAssignAddOn: boolean = false;
  restaurantID: string | null = null;
  addons: any[] = [];
  filteredAddons: any[] = [];
  departmentFilter: string = '';
  pageSize: number = 10;
  currentPage: number = 0;
  editAddon : any = null;
  constructor(private store: Store, private menuApiService: MenuApiService, private cd: ChangeDetectorRef , private toastService: ToastService) {
    // Get the restaurant ID from the store
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
      if (this.restaurantID) {
        this.fetchAddons();
      }
    });
  }

  ngOnInit(): void {
    this.fetchAddons();
  }

  fetchAddons() {
    if (this.restaurantID) {
      this.toastService.showLoader();
      this.menuApiService.getAddonsByRestaurantId(+this.restaurantID) // Convert to number
        .subscribe({
          next: (response) => {
            this.toastService.hideLoader();
            this.addons = response;
            this.currentPage = 0;
            this.updatePagination();
          },
          error: (err) => {
            this.toastService.hideLoader();
            this.addons = [];
            this.filteredAddons = [];
            console.error('Error fetching add-ons:', err);
          },
        });
    }
  }

  toggleAddOn() {
    this.editAddon = null;
    this.showAddOn = !this.showAddOn;
    if (this.showAddOn == false) {
      this.fetchAddons();
    }
  }
  toggleAssignAddOn() {
    this.showAssignAddOn = !this.showAssignAddOn;
  }

  onFilterChange() {
    if (this.departmentFilter.trim()) {
      this.updatePagination();
      this.filteredAddons = this.filteredAddons.filter(addon =>
        addon.departmentName.toLowerCase().includes(this.departmentFilter.toLowerCase())
      );
    } else {
      this.updatePagination();
    }
  }

  updatePagination() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.filteredAddons = this.addons.slice(start, end);
  }

  goToPrevious() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNext() {
    if ((this.currentPage + 1) * this.pageSize < this.addons.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  onEdit(addon) {
    this.editAddon = addon;
    this.showAddOn = true;
  }

  closeCreateAddon() {
    this.showAssignAddOn = false;
  }
}
