import { SharedService } from './../../../service/shared.service';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { Store } from '@ngrx/store';
import { ToastService } from '../../../service/toast.service';
import { selectRestaurantId } from '../../../store/restaurant.selectors';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {

  showAddCategory: boolean = false;
  showAddParentCategory: boolean = false;
  showAddGroupingCategory: boolean = false;

  categories: any[] = []; // Ensure this is an array
  parentCategories: any[] = []; // Ensure this is an array
  groupCategories: any[] = []; // Ensure this is an array
  restaurantId: string | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  searchCategory: string = '';
  searchParentCategory: string = '';
  searchGroupCategory: string = '';
  activeTab: string = 'category'; // Default to 'category'
  isEditing: boolean = false;

  constructor(
    private menuApiService: MenuApiService,
    private store: Store,
    private shared: SharedService,
    private toastService: ToastService,

  ) { }

  ngOnInit(): void {
    // Fetch the restaurantId from NgRx store (or you could pass it directly if available)
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantId = id;
      console.log(id);
      if (this.restaurantId) {
        this.getCategories(this.restaurantId);
        this.getParentCategories(this.restaurantId);
        this.getGroupCategories(this.restaurantId);
      } else {
        this.isLoading = false;
        this.errorMessage = 'No restaurant ID found.';
      }
    });
  }

  toggleAddCategory() {
    this.showAddCategory = !this.showAddCategory;
  }

  toggleAddParentCategory() {
    this.showAddParentCategory = !this.showAddParentCategory;
  }

  toggleAddGroupingCategory() {
    this.showAddGroupingCategory = !this.showAddGroupingCategory;
    if (this.showAddGroupingCategory) {
      this.shared.setGroupCategories(null); // Clear any existing data
    }
  }
  getCategories(restaurantId: any): void {
    this.toastService.showLoader();
    this.menuApiService.getCategories(restaurantId)
      .subscribe(
        (resp: any) => {
          this.categories = resp;
          this.toastService.hideLoader();
        },
        (err) => {
          console.error('Error fetching categories:', err);
          this.errorMessage = 'Failed to load categories.';
          this.toastService.hideLoader();
        }
      );
  }
  getParentCategories(restaurantId: any): void {
    this.toastService.showLoader();
    this.menuApiService.getParentCategories(restaurantId)
        .subscribe(
            (resp: any) => {
                this.parentCategories = resp.map(parentCategory => ({
                    ...parentCategory,
                    categoryNames: parentCategory.categoryNames?.filter(name => name?.trim()) || [] // Filter invalid values
                }));
                this.toastService.hideLoader();
            },
            (err) => {
                console.error('Error fetching parent categories:', err);
                this.errorMessage = 'Failed to load parent categories.';
                this.toastService.hideLoader();
            }
        );
  }
  getGroupCategories(restaurantId: any): void {
    this.toastService.showLoader();
    this.menuApiService.getGroupCategories(restaurantId)
      .subscribe(
        (resp: any) => {
          this.groupCategories = resp.map(category => ({
            ...category,
            status: category.active, // Ensure status is correctly mapped
            createdDate: new Date(category.createdDate) // Ensure createdDate is correctly mapped
          }));
          this.shared.setGroupCategories(this.groupCategories); // Share group categories via SharedService
          this.toastService.hideLoader();
        },
        (err) => {
          console.error('Error fetching group categories:', err);
          this.errorMessage = 'Failed to load group categories.';
          this.toastService.hideLoader();
        }
      );
  }

  updateDisplayPriority(category) {
    const updatedCategory = {
      ...category,
      displayPriority: category.displayPriority
    };

    this.menuApiService.updateCategories(category.id, updatedCategory).subscribe(
      (response) => {
        this.toastService.showToast('Success', 'Display Priority updated successfully!', true, 'success');
      },
      (error) => {
        console.error('Error updating display priority:', error);
        this.toastService.showToast('Error', 'Failed to update Display Priority!', true, 'error');
      }
    );
  }

  getStatusLabel(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }

  getStatusClass(status: boolean): string {
    return status ? 'bg-teal text-teal-800' : 'bg-orange text-orange-800';
  }


  closeCreateCategory() {
    this.toggleAddCategory();

    if (this.restaurantId) {
      this.getCategories(this.restaurantId);
    } else {
      this.isLoading = false;
      this.errorMessage = 'No restaurant ID found.';
    }
  }

  closeCreateParentCategory() {
    console.log('closeCreateParentCategory called'); // Debug log to ensure the method is triggered
    this.toggleAddParentCategory();

    if (this.restaurantId) {
        // Refresh the Parent Categories list to include the latest changes
        this.getParentCategories(this.restaurantId);
    } else {
        this.isLoading = false;
        this.errorMessage = 'No restaurant ID found.';
    }
  }
  closeCreateGroupCategory() {
    this.toggleAddGroupingCategory();

    if (this.restaurantId) {
      this.getGroupCategories(this.restaurantId);
    } else {
      this.isLoading = false;
      this.errorMessage = 'No restaurant ID found.';
    }
  }
  onEdit(category) {
    this.shared.setCategories(category);
    this.toggleAddCategory();
  }

  onEditParentCategory(category) {
    if (category) {
      this.menuApiService.getParentCategoriesById(category.id)
        .subscribe(
          (resp: any) => {
            if (resp) {
              this.shared.setParentCategories(resp); // Pass valid data
              this.toggleAddParentCategory(); // Open the edit form
            } else {
              console.error('API response is null or undefined');
              this.toastService.showToast('Error', 'Failed to load parent category details!', true, 'error');
            }
          },
          (err) => {
            console.error('Error fetching parent category:', err);
            this.toastService.showToast('Error', 'Failed to load parent category details!', true, 'error');
          }
        );
    } else {
      console.error('Category is null or undefined');
    }
  }
  onEditGroupCategory(category) {
    if (category) {
      this.menuApiService.getGroupCategoriesById(category.id)
        .subscribe(
          (resp: any) => {
            if (resp) {
              this.shared.setGroupCategories(resp); // Pass valid data
              this.showAddGroupingCategory = true; // Open the edit form
            } else {
              console.error('API response is null or undefined');
              this.toastService.showToast('Error', 'Failed to load Group category details!', true, 'error');
            }
          },
          (err) => {
            console.error('Error fetching group category:', err);
            this.toastService.showToast('Error', 'Failed to load Group category details!', true, 'error');
          }
        );
    } else {
      console.error('Group Category is null or undefined');
    }
  }
  setActiveTab(tab: string) {
    this.activeTab = tab;
    console.log(`Active tab set to: ${this.activeTab}`); // Debug log to verify the active tab
  }
  switchTab(tab: string) {
    this.activeTab = tab;
  }
  // Method to handle back navigation
  onBack(tab: string) {
    console.log(`onBack called with tab: ${tab}`); // Debug log to ensure the method is triggered

    // Refresh data based on the tab
    if (tab === 'category') {
        this.closeCreateCategory();
    } else if (tab === 'parentcategory') {
        this.closeCreateParentCategory();
    } else if (tab === 'grouping') {
        this.closeCreateGroupCategory();
    }

    this.setActiveTab(tab); // Set the active tab based on the emitted tab name
    this.showAddCategory = false;
    this.showAddParentCategory = false;
    this.showAddGroupingCategory = false;
  }
  // goToPrevious() {
  //   if (!this.categories.first) {
  //     this.pagination.pageNo--;
  //     this.getCategories(this.restaurantId, this.pagination.pageNo, this.pagination.size);
  //   }
  // }

  // goToNext() {
  //   if (!this.categories.last) {
  //     this.pagination.pageNo++;
  //     this.getCategories(this.restaurantId, this.pagination.pageNo, this.pagination.size);
  //   }
  // }

  get filteredCategories() {
    if (!this.searchCategory) {
      return this.categories;
    }
    return this.categories.filter(category =>
      category.categoryName.toLowerCase().includes(this.searchCategory.toLowerCase())
    );
  }
  get filteredParentCategories() {
    if (!this.searchParentCategory) {
      return this.parentCategories;
    }
    return this.parentCategories.filter(parentCategory =>
      parentCategory.categoryName.toLowerCase().includes(this.searchParentCategory.toLowerCase())
    );
  }

  get filteredGroupCategories() {
    if (!this.searchGroupCategory) {
      return this.groupCategories;
    }
    return this.groupCategories.filter(groupCategory =>
      groupCategory.categoryName.toLowerCase().includes(this.searchGroupCategory.toLowerCase())
    );
  }

  enableEditing() {
    this.isEditing = true;
  }

  saveAllChanges() {
    if (this.activeTab === 'category') {
        const updatedCategories = this.filteredCategories.map(category => ({
            id: category.categoryId,
            displayPriority: category.displayPriority
        }));

        this.menuApiService.updateMultipleCategories(updatedCategories).subscribe(
            (response) => {
                this.toastService.showToast('Success', 'Display Priority updated successfully!', true, 'success');
                this.isEditing = false;

                // Refresh the categories list to reflect the updated rank
                if (this.restaurantId) {
                    this.getCategories(this.restaurantId);
                }
            },
            (error) => {
                console.error('Error updating display priority:', error);
                this.toastService.showToast('Error', 'Failed to update Display Priority!', true, 'error');
            }
        );
    }
  }

}
