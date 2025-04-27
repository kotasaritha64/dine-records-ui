import { Component, EventEmitter, Output ,ChangeDetectorRef, ChangeDetectionStrategy , Input} from '@angular/core';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup ,FormArray } from '@angular/forms';
import { MenuItem } from '../../../models/menuitem.model'
import { ToastService } from '../../../service//toast.service';

@Component({
  selector: 'app-add-menu',
  templateUrl: './add-menu.component.html',
  styleUrl: './add-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMenuComponent {
  @Output() closeAddMenu = new EventEmitter<void>();
  @Input() category: string = '';
  restaurantId : any = 0;
  categories : any = [];
  variants : any = [];
  menuItemForm: FormGroup;

  choices = ['Veg', 'Non Veg', 'Egg', 'Others'];

  constructor(private fb: FormBuilder , private store : Store, private menuApiService : MenuApiService , private cd: ChangeDetectorRef , private toastService: ToastService) {}

  ngOnInit(): void {
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantId = id;
      console.log(id);
      if (this.restaurantId) {
        this.getCategories(this.restaurantId);
        this.getMenuvariants(this.restaurantId);
      } else {
        // this.isLoading = false;
        // this.errorMessage = 'No restaurant ID found.';
      }
    });

    this.menuItemForm = this.fb.group({
      items: this.fb.array(Array.from({ length: 10 }, () => this.createItemFormGroup())),
    });
  }


  getCategories(restaurantId: string): void {
    this.toastService.showLoader();
    this.menuApiService.getCategories(restaurantId).subscribe(
      response => {
        this.toastService.hideLoader(); 
        this.categories = response; 
        this.cd.detectChanges();
      },
      error => {
        this.toastService.hideLoader(); 
        // this.isLoading = false;
        // this.errorMessage = 'Error fetching categories.';
        console.error('Error fetching categories:', error);
      }
    );
  }

  getMenuvariants(restaurantId : String) : void {
    this.toastService.showLoader();
    this.menuApiService.getMenuvariants(restaurantId).subscribe((resp : any)=>{
      this.toastService.hideLoader(); 
      this.variants = resp
      this.cd.detectChanges()
    },(error)=>{
      this.toastService.hideLoader(); 
      console.error('Error fetching categories:', error);
    })
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      itemName: [''],
      shortCode: [''],
      onlineDisplayName: [''],
      categoryId: [(this.category != '') ? this.category : null],
      price: [''],
      description: [''],
      available: [''],
      choice: [[]],
      goodsAndServices: [''],
      desktopType: [[]],
      addVariation: [false],
      addOns: [false],
      variations: this.fb.array([]),
    });
  }

  createVariationFormGroup(): FormGroup {
    return this.fb.group({
      restaurantVariantId: [''],
      price: [''],
      variantName : ['']
    });
  }

  get items(): FormArray {
    return this.menuItemForm.get('items') as FormArray;
  }

  onSubmit(closeMenu : boolean): void {
    this.toastService.showLoader();
    const filledItems = this.items.controls
      .map(control => control.value)
      .filter(item => item.itemName || item.shortCode || item.price);

    const payloadArray = filledItems.map((item)=>{
       return {
      "restaurantId": this.restaurantId,
      "categoryId": item.categoryId,
      "itemName": item.itemName,
      "shortCode": item.shortCode,
      "shortCode2": "",
      "onlineDisplayName":  item.onlineDisplayName,
      "category": "Ram",
      "basePrice": item.price,
      "description": item.description,
      "dietary": item.choice,
      "goodsAndService": item.goodsAndServices,
      "orderType": [],
      "variants": item.variations,
      "itemImageURL": "",
      "containerCharges": "",
      "weight": "",
      "profitMargin": "",
      "exposeItem": [],
      "allDays": [],
      "noDecimalValue": false,
      "ignoreTax": "",
      "setAsFavorite": "",
      "openQualityPopup": "",
      "ignoreDiscount": "",
      "ignoreAddOn": "",
      "ignorePackingCharge": "",
      "mrpItem": "",
      "removeFromDineQR": "",
      "containsAlcohol": "",
      "setAsOpenItem": "",
      "setAsCombo": "",
      "glutenFree": "",
      "hsnCode": "",
      "sapCode": "",
      "fsnCode": "",
      "stockStatus": "",
      "status" : true
    }
    
    })

  if(payloadArray.length > 0){
    this.addMenuItems(payloadArray , closeMenu);
  } else {
    this.toastService.hideLoader(); 
    this.toastService.showToast('Error', 'Payload is invalid', false,'error');
  }
 
  

  }
  

  onClose() {
    this.closeAddMenu.emit();
  }

  onChoiceChange(itemIndex: number, value: string): void {
    const choices = this.items.at(itemIndex).get('choice').value as string[];
    const index = choices.indexOf(value);
    if (index > -1) {
      choices.splice(index, 1);  
    } else {
      choices.push(value);  
    }
    this.items.at(itemIndex).patchValue({ choice: choices });  
  }

  // onGoodsAndServicesChange(itemIndex: number, service: string): void {
  //   const goodsAndServices =  this.items.at(itemIndex).get('goodsAndServices').value as string[];
  //   const index = goodsAndServices.indexOf(service);
  //   if (index > -1) {
  //     goodsAndServices.splice(index, 1);  
  //   } else {
  //     goodsAndServices.push(service);  
  //   }
  //   this.items.at(itemIndex).patchValue({ goodsAndServices: goodsAndServices });
  // }

  onGoodsAndServicesChange(itemIndex: number, service: string): void {
    this.items.at(itemIndex).patchValue({ goodsAndServices: service });
  }
  

  onDeliveryOptionChange(itemIndex: number, option: string): void {
    const deliveryOptions =  this.items.at(itemIndex).get('desktopType').value as string[];
    const index = deliveryOptions.indexOf(option);
    if (index > -1) {
      deliveryOptions.splice(index, 1);  
    } else {
      deliveryOptions.push(option);  
    }
    this.items.at(itemIndex).patchValue({ desktopType: deliveryOptions });
  }


  addVariant(itemIndex: number): void {
    const variations = this.items.at(itemIndex).get('variations') as FormArray;
    const newVariant = this.createVariationFormGroup(); 
    variations.push(newVariant); 
    console.log('Current form values:', this.menuItemForm.value);
    this.cd.detectChanges();  
  }
  
  
  getVariants(itemIndex: number): FormArray {
    return this.items.at(itemIndex).get('variations') as FormArray;
  }

  removeVariant(itemIndex: number, variantIndex: number): void {
    const variations = this.items.at(itemIndex).get('variations') as FormArray; 
    variations.removeAt(variantIndex);
    console.log('Current form values:', this.menuItemForm.value);
    this.cd.detectChanges()
  }

  trackByFn(index: number, item: any): number {
    return item.id || index;
  }

  onAddVariationChange(itemIndex: number): void {
    const itemControl = this.items.at(itemIndex);
    const addVariation = itemControl.get('addVariation').value;
  
    if (!addVariation) {
      const variations = itemControl.get('variations') as FormArray;
      variations.clear();
    }
  }

  addMenuItems (payloadArray , closeMenu) {
    this.menuApiService.addMenuItem(payloadArray).subscribe((resp)=>{
      const itemsArray = this.fb.array(Array.from({ length: 10 }, () => this.createItemFormGroup()));
      this.menuItemForm.setControl('items', itemsArray);
      this.toastService.showToast('Success', 'MenuItem(s) created successfully', true,'success');
      this.cd.detectChanges();
      this.toastService.hideLoader(); 
      if(closeMenu) {
        this.onClose();
      }
    },(error)=>{
      this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
      this.toastService.hideLoader(); 
    })
  }
}
