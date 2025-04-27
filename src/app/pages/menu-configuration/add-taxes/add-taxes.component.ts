import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { ToastService } from '../../../service/toast.service';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from '../../../store/restaurant.selectors';

@Component({
  selector: 'app-add-taxes',
  templateUrl: './add-taxes.component.html',
  styleUrls: ['./add-taxes.component.scss']
})
export class AddTaxesComponent implements OnChanges {

  @Input() editTax: any;
  @Output() closeCreateTax = new EventEmitter<boolean>();
  taxForm: FormGroup;
  restaurantID: string | null = null;
  expandedCategories: number[] = [];
  areas: any[] = [];
  categories: any[] = [];
  selectedCategories: any[] = [];
  taxedItemsForArea = new Map<string, any[]>();
  areaIds: any[] = [];
  editId: number = 0;
  constructor(
    private store: Store,
    private menuApiService: MenuApiService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.taxForm = this.fb.group({
      taxType: ['Forward', Validators.required],
      title: ['', Validators.required],
      orderType: [[]],
      type: ['Percent', Validators.required],
      amount: [null, Validators.required],
      description: [''],
      ignoreTax: [false]
    });

    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
      this.loadCategoriesAndAreas(id);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if `editTax` has changed and is not null
    if (changes['editTax'] && this.editTax) {
      this.patchFormValues();
      this.editId = this.editTax.id;
     if(Array.isArray(this.editTax.areaWiseItemsTaxes)) {
      this.taxedItemsForArea.clear();
      this.editTax.areaWiseItemsTaxes.forEach((item: { menuItemId: any; areaIds: any[] }) => {
        this.taxedItemsForArea.set(item.menuItemId.toString(), item.areaIds);
      });
     }
    }
  }

  patchFormValues(): void {
    this.taxForm.patchValue({
      taxType: this.editTax.taxType || 'Forward',
      orderType: this.editTax.orderType || [],
      type: this.editTax.type || 'Percent',
      amount: this.editTax.amount || null,
      description: this.editTax.description || ''
    });
  }


  loadCategoriesAndAreas(restaurantID: string | null) {
    if (restaurantID) {
      this.toastService.showLoader();
      this.menuApiService.getAreasByRestaurantId(restaurantID).subscribe((areas) => {
        this.areas = areas;
        this.areaIds = areas.map(area => area.id);
        this.toastService.hideLoader();
      });
      this.menuApiService.getGroupedMenuItems(Number(restaurantID)).subscribe((categories) => {
        this.categories = categories;
        this.toastService.hideLoader();
      });
    }
  }
  toggleExpand(categoryId: number) {
    const index = this.expandedCategories.indexOf(categoryId);
    if (index === -1) {
      this.expandedCategories.push(categoryId);
    } else {
      this.expandedCategories.splice(index, 1);
    }
  }

  toggleCategoryCheckAll(categoryId: number) {
    const index = this.selectedCategories.indexOf(categoryId);

    if (index !== -1) {
      this.selectedCategories.splice(index, 1);
      const category = this.categories.find(cat => cat.categoryId === categoryId);
      if (category) {
        category.items.forEach((obj: any) => {
          this.taxedItemsForArea.delete(obj.itemId);
        });
      }
    } else {
      this.selectedCategories.push(categoryId);
      const category = this.categories.find(cat => cat.categoryId === categoryId);
      if (category) {
        category.items.forEach((obj: any) => {
          this.taxedItemsForArea.set(obj.itemId, this.areaIds);
        });
      }
    }
  }


  onItemAreaCheckboxChange(event: any, itemId: any, areaId: any) {
    if (this.taxedItemsForArea.has(itemId)) {
      const index = this.taxedItemsForArea.get(itemId)?.indexOf(areaId);
      if (index !== -1) {
        this.taxedItemsForArea.get(itemId)?.splice(index, 1);
      } else {
        this.taxedItemsForArea.get(itemId)?.push(areaId);
      }
    }
    else {
      this.taxedItemsForArea.set(itemId, [areaId]);
    }
    console.log(this.taxedItemsForArea);
  }




  selectAllItemsInCategory(event: any, categoryId: number) {
    const isChecked = event.target.checked;
    const category = this.categories.find(c => c.categoryId === categoryId);
    if (category) {
      category.items.forEach((item: any) => {
        item.selected = isChecked;  // Select or deselect all menu items
        if (item.areas && Array.isArray(item.areas)) { // Ensure areas are an array
          item.areas.forEach((area: any) => {
            area.selected = isChecked;  // Select or deselect all areas for the item
          });
        }
      });
    }
  }


  selectAllMenuItemsInArea(event: any, areaId: any, categoryId: any) {
    const isChecked = event.target.checked;
    const category = this.categories.find(cat => cat.categoryId === categoryId);
    if (category) {
      category.items.forEach((obj: any) => {
        if (this.taxedItemsForArea.has(obj.itemId)) {
          const index = this.taxedItemsForArea.get(obj.itemId)?.indexOf(areaId);
          if (index !== -1 && isChecked == false) {
            this.taxedItemsForArea.get(obj.itemId)?.splice(index, 1);
          } else if (index < 0 && isChecked) {
            this.taxedItemsForArea.get(obj.itemId)?.push(areaId);
          }

        }
        else {
          this.taxedItemsForArea.set(obj.itemId, [areaId]);
        }
      })
    }

    // this.categories.forEach(category => {
    //   category.items.forEach(item => {
    //     if (item.areas && Array.isArray(item.areas)) { // Ensure areas are an array
    //       const areaIndex = item.areas.findIndex((area: any) => area.areaId === areaId);
    //       if (areaIndex > -1) {
    //         item.selected = isChecked;  // Select or deselect the menu item in that area
    //       }
    //     }
    //   });
    // });


  }


  selectItemInRow(event: any, item: any) {
    const isChecked = event.target.checked;
    if (this.taxedItemsForArea.has(item) && isChecked == false) {
      this.taxedItemsForArea.delete(item);
    }
    else if (isChecked) {
      this.taxedItemsForArea.set(item, this.areaIds);
    }
    console.log('row', this.taxedItemsForArea);
  }


  saveTax() {

    if (!this.taxForm.valid || !this.restaurantID) {
      this.toastService.showToast('Error', 'Please fill out all required fields.', true, 'error');
      return;
    }

    let areaWiseItemsTaxes: any[] = [];
    this.taxedItemsForArea.forEach((areaIds, menuItemId) => {
      areaWiseItemsTaxes.push({ menuItemId, areaIds });
    });


    const payload = {
      restaurantId: this.restaurantID,
      ...this.taxForm.value,
      areaWiseItemsTaxes: areaWiseItemsTaxes
    };

    // Show loading spinner
    this.toastService.showLoader();
debugger;
    if (this.editId == 0) {
      // API call to save tax data
      this.menuApiService.addTax(payload).subscribe(
        (response) => {
            this.toastService.showToast('Success', 'Tax added successfully!', true, 'success');
            this.closeCreateTax.emit(false);  // Close form after success
            this.toastService.hideLoader();
        },
        (error) => {
          // Show error message in case of failure
          this.toastService.showToast('Error', 'Something went wrong!', true, 'error');
          this.toastService.hideLoader();  // Hide loading spinner
        }
      );
    } else {
      
    }
    this.toastService.hideLoader();

  }

  onCheckboxChange(event: any) {
    const checkbox = event.target;
    const selectedOrderTypes = this.taxForm.get('orderType')?.value || [];

    if (checkbox.checked) {
      selectedOrderTypes.push(checkbox.value);
    } else {
      const index = selectedOrderTypes.indexOf(checkbox.value);
      if (index > -1) {
        selectedOrderTypes.splice(index, 1);
      }
    }

    this.taxForm.patchValue({ orderType: selectedOrderTypes });
  }

  isAllItemsAssigned(items: any[], areaId: number): boolean {
    for (const item of items) {
      const assignedAreas = this.taxedItemsForArea.get(item.itemId) || [];
      if (!assignedAreas.includes(areaId)) {
        return false;
      }
    }
    return true;
  }
}
