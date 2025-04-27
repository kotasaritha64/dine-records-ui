import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { Store } from '@ngrx/store';
import { ToastService } from '../../../service//toast.service';

@Component({
  selector: 'app-menu-items',
  templateUrl: './menu-items.component.html',
  styleUrls: ['./menu-items.component.scss']
})
export class MenuItemsComponent {

  @Input() orderType: string;
  showAddMenu: boolean = false;
  showEditMenu: boolean = false;
  showViewMenu: boolean = false;
  categories: any = [];
  filteredCategories: any = [];
  restaurantId: string | null = null;
  isLoading = true;
  errorMessage = '';
  isEditing = false;  // Initially, no item is being edited
  selectedItem: any;  // To store the item being edited
  selectedCategory: any = null;
  editingMenuItemIndex: number | null = null;
  menuItems: any = [];
  editProp: any;
  viewProp: any;
  previewImage: string | null = null;
  originalImageBase64: string | null = null;
  selectedItemIndex: number | null = null; 

  constructor(private menuApiService: MenuApiService, private store: Store, private cd: ChangeDetectorRef, private toastService: ToastService) { }

  ngOnInit(): void {
    // Fetch the restaurantId from NgRx store
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantId = id;
      console.log(id);
      if (this.restaurantId) {
        this.getCategories(this.restaurantId);
      } else {
        this.isLoading = false;
        this.errorMessage = 'No restaurant ID found.';
      }
    });
  }



  getCategories(restaurantId: string): void {
    this.toastService.showLoader();
    this.menuApiService.getCategories(restaurantId).subscribe(
      response => {
        this.toastService.hideLoader();
        this.categories = response;
        this.filteredCategories = response;
        if (response.length > 0) {
          this.getMenuItemOnCategories(response[0]);
        }
        this.cd.detectChanges();
        console.log(this.categories)
        this.isLoading = false;
      },
      error => {
        this.toastService.hideLoader();
        this.isLoading = false;
        this.errorMessage = 'Error fetching categories.';
        console.error('Error fetching categories:', error);
      }
    );
  }

  onEditMenu(item: any) {
    this.showEditMenu = true;
    this.editProp = item;
  }

  onViewMenu(item: any){
    this.showViewMenu = true;
    this.viewProp = item;
  }

  onCloseEdit(): void {
    console.log(this.selectedCategory)
    this.getMenuItemOnCategories(this.selectedCategory);
    this.showEditMenu = false;
  }
  onGridButtonClick() {
    this.showAddMenu = true;
  }

  closeAddMenu(event: any) {
    
    this.getMenuItemOnCategories(this.selectedCategory);
    this.showAddMenu = false;
  }

  getMenuItemOnCategories(category: any) {
      console.log('order type: ' + this.orderType);
    this.selectedCategory = category;
    this.toastService.showLoader();
    this.menuApiService.getMenuItemOnCategories(this.restaurantId, category.categoryId, this.orderType).subscribe((resp: any) => {
      resp.content = resp.content.map((obj: any) => {
        return { ...obj, isChecked: false };
      });
      this.menuItems = resp || []
      this.toastService.hideLoader();
      this.cd.detectChanges();
      console.log(resp);
    }, (error) => {
      this.menuItems = [];
      this.cd.detectChanges();
      this.toastService.hideLoader();
    })
  }

  onCheckboxChange(index: number, isChecked: boolean) {
    if (isChecked) {
      this.menuItems.content.forEach((item, idx) => {
        if (idx === index) {
          item.isChecked = true;
        }
      });
    } else {
      this.menuItems.content.forEach((item, idx) => {
        if (idx === index) {
          item.isChecked = false;
        }
      });
    }
  }


  isRowDisabled(item: any): boolean {
    return !item.isChecked;
  }

  imageUpload(i: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64Image = e.target?.result as string;
        this.previewImage = base64Image;
        this.cd.detectChanges();
        this.menuItems.content[i].itemImageBase64 = base64Image.split(',')[1];
      };

      reader.readAsDataURL(file);
      console.log(" this.menuItems", this.menuItems.content)
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();  // Trigger the file input to open the file dialog
    }
  }


  // imageUpload(i: number, event: Event): void {
  //   this.selectedItemIndex = i;  // Track which item the image belongs to
  //   const input = event.target as HTMLInputElement;
  //   if (input?.files?.length) {
  //     const file = input.files[0];
  //     const reader = new FileReader();

  //     reader.onload = (e: ProgressEvent<FileReader>) => {
  //       const base64Image = e.target?.result as string;
  //       this.previewImage = base64Image;  // Set preview image
  //       this.menuItems.content[i].itemImageBase64 = base64Image.split(',')[1];  // Store the base64 image data directly
  //       this.originalImageBase64 = this.menuItems.content[i].itemImageBase64;  // Save original image data before changes
  //     };

  //     reader.readAsDataURL(file);
  //   }
  // }
  // imageUpload(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input?.files?.length) {
  //     const file = input.files[0];
  //     const reader = new FileReader();

  //     reader.onload = (e: ProgressEvent<FileReader>) => {
  //       const base64Image = e.target?.result as string;
  //       this.previewImage = base64Image;  // Set preview image
  //     };

  //     reader.readAsDataURL(file);
  //   }
  // }

  editMenuItems(payload: any) {
    this.toastService.showLoader();
    this.menuApiService.editMenuItems(payload).subscribe((resp: any) => {
      this.toastService.hideLoader();
      this.getMenuItemOnCategories(this.selectedCategory);
      this.toastService.showToast('Success', 'Menu item edit successful!', true, 'success');
    }, (error) => {
      this.toastService.hideLoader();
      this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
    })
  }

  // toggleFavorite(item: any): void {
  //   // Toggle the favorite status
  //   item.isFavorite = !item.isFavorite;
  
  //   // Send the payload with `setasfavourite: true`
  //   const payload = [{ ...item, setAsFavorite: true }];
  
  //   // Call the same method you use to save items, but this time pass the favorite update
  //   this.editMenuItems(payload);
  // }
  toggleFavorite(item: any): void {
    // Toggle the favorite status
    item.setAsFavourite = !item.setAsFavourite;
  
    // You can also make an API call here to update the favorite status if needed
    const payload = [{ ...item, setasfavourite: item.setAsFavourite }];
    this.editMenuItems(payload);
  }
  
  

  
  onSave() {
    const checkedItems = this.menuItems.content.filter(item => item.isChecked);
    debugger;
    const payload = checkedItems.map(({ isChecked, ...rest }) => rest);
    this.editMenuItems(payload);
    this.selectedItemIndex = null;
    this.previewImage = null;
  }

  onSearchChange(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.filteredCategories = this.categories.filter(category =>
      category.categoryName.toLowerCase().includes(searchValue)
    );
    this.cd.detectChanges();
  }

  clearImage() {
    if (this.menuItems?.content && this.selectedItemIndex !== null && this.menuItems.content[this.selectedItemIndex]) {
        this.menuItems.content[this.selectedItemIndex].itemImageBase64 = ''; 
    }
}

}
