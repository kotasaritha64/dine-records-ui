import { Component, EventEmitter, Output, OnChanges, SimpleChanges, input, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { ToastService } from '../../../service/toast.service';
@Component({
  selector: 'app-edit-add-ons',
  templateUrl: './edit-add-ons.component.html',
  styleUrl: './edit-add-ons.component.scss'
})
export class EditAddOnsComponent implements OnChanges {
  @Input() editAddon: any;
  @Output() closeCreateAddon = new EventEmitter<boolean>();
  restaurantID: string | null = null;
  addOnId: any = 0;
  choices = ['Veg', 'Non Veg', 'Egg', 'Others'];
  addOnForm: FormGroup;
  constructor(private fb: FormBuilder, private menuApiService: MenuApiService, private store: Store, private toastService: ToastService) {

    this.addOnForm = this.fb.group({
      departmentName: [''],
      onlineDisplayName: [''],
      showOnline: [true],
      items: this.fb.array(Array.from({ length: 10 }, () => this.createItemFormGroup()))
    });

    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
    });

  }

  // ngOnInit(): void {

  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editAddon']) {
      const currentValue = changes['editAddon'].currentValue;
      if (currentValue != null) {
        console.log(currentValue);
        this.addOnId = currentValue.id;
        this.addOnForm.patchValue({
          departmentName: currentValue.departmentName,
          onlineDisplayName: currentValue.onlineDisplayName,
          showOnline: currentValue.showOnline,
        });


        if (currentValue.addonGroupItems && currentValue.addonGroupItems.length > 0) {
          const itemsArray = this.addOnForm.get('items') as FormArray;
          itemsArray.clear();
          currentValue.addonGroupItems.forEach((addonItem, index) => {
            itemsArray.push(this.fb.group({
              id: addonItem.id || null,
              itemName: addonItem.name || '',
              shortCode: addonItem.shortCode || '',
              price: addonItem.price || '',
              attributes: this.fb.array(addonItem.attributes ? addonItem.attributes.split(',') : []),
              available: addonItem.available || false
            }));
          });

          const numItemsToAdd = 10 - itemsArray.length;
          for (let i = 0; i < numItemsToAdd; i++) {
            itemsArray.push(this.fb.group({
              id: null,
              itemName: '',
              shortCode: '',
              price: '',
              attributes: this.fb.array([]),
              available: false
            }));
          }
        }
      } else {
        this.addOnId = 0;
      }
    }
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      itemName: [''],
      shortCode: [''],
      price: [''],
      attributes: this.fb.array([]),
      available: [false]
    });
  }


  get items(): FormArray {
    return this.addOnForm.get('items') as FormArray;
  }

  addNewItem() {
    this.items.push(this.createItemFormGroup());
  }

  onChoiceChange(index: number, choice: string): void {
    const itemsArray = this.addOnForm.get('items') as FormArray;
    const selectedItem = itemsArray.at(index);
    const attributesControl = selectedItem.get('attributes') as FormArray;
    const isSelected = attributesControl.value.includes(choice);
    if (isSelected) {
      const indexToRemove = attributesControl.value.indexOf(choice);
      attributesControl.removeAt(indexToRemove);
    } else {
      attributesControl.push(this.fb.control(choice));
    }
  }

  saveAddOnGroup(): void {
    if (this.addOnForm.valid && this.restaurantID) {
      this.toastService.showLoader();
      const formData = this.addOnForm.value;
      const filteredItems = formData.items.filter((item: any) => {
        return item.itemName.trim() !== '' || item.price.trim() !== '' || item.shortCode.trim() !== '' || (item.attributes && item.attributes.length > 0);
      });

      //preparing the payload
      const payload = {
        id : (this.addOnId > 0) ? this.addOnId : null,
        restaurantId: this.restaurantID,
        departmentName: formData.departmentName.trim(),
        onlineDisplayName: formData.onlineDisplayName.trim(),
        showOnline: formData.showOnline,
        addonGroupItems: filteredItems.map((item: any) => ({
          id : (item.id) ? item.id : null,
          name: item.itemName.trim(),
          price: item.price,
          shortCode: item.shortCode.trim(),
          attributes: item.attributes.join(',').toString(),
          available: item.available
        }))
      };
      console.log(payload);
      if(this.addOnId == 0){
        this.menuApiService.saveAddOnGroup(payload).subscribe({
          next: (response) => {
            this.toastService.hideLoader();
            this.toastService.showToast('Success', 'Addon created successfully', true, 'success');
            this.closePage();
          },
          error: (err) => {
            this.toastService.hideLoader();
          }
        });
      }
      else {
        console.log("call edit addons with payload" , payload)
        this.toastService.hideLoader();
      }
      
    } else {
      this.toastService.showToast('Error', 'Payload is invalid', false, 'error');
    }
  }

  closePage() {
    this.closeCreateAddon.emit(true);
  }

}
