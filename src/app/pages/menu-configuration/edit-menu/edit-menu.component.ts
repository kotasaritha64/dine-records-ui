import { Component, EventEmitter, Input, Output, ViewEncapsulation, OnChanges, SimpleChanges, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { ToastService } from '../../../service//toast.service';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
@Component({
  selector: 'app-edit-menu',
  templateUrl: './edit-menu.component.html',
  styleUrl: './edit-menu.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EditMenuComponent implements OnChanges, OnInit {

  @Input() menuItem: any;
  @Output() closeEdit = new EventEmitter<void>();
  menuItemForm: FormGroup;

  isVariationsEnabled: boolean = false;
  variations: any[] = [];
  categories: any[] = [];
  restaurantId: any = 0;
  sizeTagsValue = ['XL', 'S'];
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  alldays: string[] = [];
  cuisines: string[] = ["Italian", "Chinese", "Mexican", "Indian", "French", "Japanese",
    "Thai", "Middle Eastern", "Greek", "Spanish", "Korean",
    "Lebanese", "Caribbean", "Vietnamese", "Ethiopian"];
  variantOptions: any = [];
  menuItems: any[] = [];
  //comboItems: any[] = [];
  comboItems: any[] = [{ itemId: '', qty: '', price: '' }];
  comboType: string = '';
  setAsCombo: any[] = [];
  setAsComboChecked: boolean = false; 

  addons : any 
  sizeTagsValidator = Validators.required;

  colorTagsValue = ['Black'];
  colorTagsValidator = Validators.required;

  materialTagsValue = [];
  materialTagsValidator = Validators.required;

  tagsInputValue = ['Laptop', 'Apple'];
  tagsInputValidator = Validators.required;

  constructor(private fb: FormBuilder, private menuApiService: MenuApiService, private toastService: ToastService, private store: Store, private cdr: ChangeDetectorRef) {
    this.menuItemForm = this.fb.group({
      itemId: [null],
      restaurantId: [null],
      categoryId: [null],
      itemName: ['', Validators.required],
      shortCode: [''],
      shortCode2: [''],
      onlineDisplayName: [''],
      category: [''],
      basePrice: ['', Validators.required],
      description: [''],
      dietary: this.fb.array([]),
      goodsAndService: [''],
      orderType: this.fb.array([]),
      variants: this.fb.array([]),
      itemImageURL: [''],
      containerCharges: [''],
      weight: [''],
      profitMargin: [''],
      exposeItem: this.fb.array([]),
      allDays: this.fb.array([]),
      noDecimalValue: [false],
      ignoreTax: [false],
      setAsFavorite: [false],
      openQualityPopup: [false],
      ignoreDiscount: [false],
      ignoreAddOn: [false],
      ignorePackingCharge: [false],
      mrpItem: [false],
      removeFromDineQR: [false],
      containsAlcohol: [false],
      setAsOpenItem: [false],
      setAsCombo: [false],
      glutenFree: [false],
      hsnCode: [''],
      sapCode: [''],
      fsnCode: [null],
      stockStatus: [''],
      cuisine: [''],
      comboType: [''],
      
    });

    
  }
 
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuItem']) {
      this.menuItem = changes['menuItem'].currentValue;
      this.setFormValues(this.menuItem);
      this.alldays = this.menuItem.allDays;
      this.variations = this.menuItem.variants;
      this.setAsCombo = this.menuItem.setAsCombo;
    }
  }

  ngOnInit(): void {
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantId = id;
      if (this.restaurantId) {
        this.getCategories(this.restaurantId);
        this.getMenuvariants(this.restaurantId);
        // this.fetchAddons();
      }
    });

    // this.comboItems.push({ itemId: '', qty: '', price: '' });
    this.loadMenuItems();

  }

  setFormValues(menuItem: any) {
    this.menuItemForm.patchValue({
      itemId: menuItem.itemId,
      restaurantId: menuItem.restaurantId,
      categoryId: menuItem.categoryId,
      itemName: menuItem.itemName,
      shortCode: menuItem.shortCode,
      shortCode2: menuItem.shortCode2,
      onlineDisplayName: menuItem.onlineDisplayName,
      category: menuItem.category,
      basePrice: menuItem.basePrice,
      description: menuItem.description,
      goodsAndService: menuItem.goodsAndService,
      containerCharges: menuItem.containerCharges,
      weight: menuItem.weight,
      profitMargin: menuItem.profitMargin,
      noDecimalValue: menuItem.noDecimalValue,
      ignoreTax: (menuItem.ignoreTax == 'true') ? true : false,
      setAsFavorite: (menuItem.setAsFavorite == 'true') ? true : false,
      openQualityPopup: (menuItem.openQualityPopup == 'true') ? true : false,
      ignoreDiscount: (menuItem.ignoreDiscount == 'true') ? true : false,
      ignoreAddOn: (menuItem.ignoreAddOn == 'true') ? true : false,
      ignorePackingCharge: (menuItem.ignorePackingCharge == 'true') ? true : false,
      mrpItem: (menuItem.mrpItem == 'true') ? true : false,
      removeFromDineQR: (menuItem.removeFromDineQR == 'true') ? true : false,
      containsAlcohol: (menuItem.containsAlcohol == 'true') ? true : false,
      setAsOpenItem: (menuItem.setAsOpenItem == 'true') ? true : false,
      setAsCombo: (menuItem.setAsCombo == 'true' || true) ? true : false,
      glutenFree: (menuItem.glutenFree == 'true') ? true : false,
      hsnCode: menuItem.hsnCode,
      sapCode: menuItem.sapCode,
      fsnCode: (menuItem.fsnCode != null) ? menuItem.fsnCode : '',
      stockStatus: menuItem.stockStatus,
      cuisine: (menuItem.cuisine != null) ? menuItem.cuisine : ""
    });

    this.setFormArrayValues(this.dietary, menuItem.dietary);
    this.setFormArrayValues(this.orderType, menuItem.orderType);
    this.setFormArrayValues(this.exposeItem, menuItem.exposeItem);
    // this.setFormArrayValues(this.allDays, menuItem.allDays);
    // this.setFormArrayOfComboItems(menuItem.setAsCombo);
    this.setFormArrayOfVariants(menuItem.variants);
  }

  setFormArrayValues(formArray: FormArray, values: any[]) {
    formArray.clear();
    values.forEach(value => formArray.push(this.fb.control(value)));
  }

  setFormArrayOfVariants(variants: any[]) {
    this.variants.clear();
    variants.forEach(variant => {
      this.variants.push(this.fb.group({
        ...variant
      }));
    });
    this.isVariationsEnabled = true;
  }

  // setFormArrayOfComboItems(setAsCombo: any[]) {
  //   const setAsComboArray = this.menuItemForm.get('setAsCombo') as FormArray;
  //   setAsComboArray.clear();  // Clear existing combo items if any
  
  //   // Populate setAsCombo with combo items
  //   setAsCombo.forEach(comboItem => {
  //     setAsComboArray.push(this.fb.group({
  //       comboType: comboItem.comboType,
  //       itemName: comboItem.itemName,
  //       qty: comboItem.Qty,
  //       price: comboItem.Price
  //     }));
  //   });
  // }

  get dietary() {
    return this.menuItemForm.get('dietary') as FormArray;
  }

  get orderType() {
    return this.menuItemForm.get('orderType') as FormArray;
  }

  get variants() {
    return this.menuItemForm.get('variants') as FormArray;
  }

  get exposeItem() {
    return this.menuItemForm.get('exposeItem') as FormArray;
  }

  // get allDays() {
  //   return this.menuItemForm.get('allDays') as FormArray;
  // }

  get comboTypeControl() {
    return this.menuItemForm.get('comboType');
  }

  // isQtyDisabled(index: number): boolean {
  //   return this.menuItemForm.get('comboType')?.value === 'Straight';
  // }

  // isPriceDisabled(index: number): boolean {
  //   return this.menuItemForm.get('comboType')?.value === 'Customizable';
  // }

  // Method to detect changes manually
  onComboTypeChange(selectedValue: string): void {
    this.comboType = selectedValue;
    // Trigger change detection manually
    this.cdr.detectChanges();
  }

  addVariation(): void {
    this.variations.push({
      variantName: '',
      price: '',
      containerCharges: '',
      sapCode: '',
      profitMargin: '',
      restaurantVariantId: '',
      serves: '',
      setAsCombo: ''
    });
  }
  onVariationCheckChange(): void {
    if (this.isVariationsEnabled) {
      const collapseElement = document.getElementById('collapseOne');
      if (collapseElement) {
        collapseElement.classList.remove('show');
      }
      this.isVariationsEnabled = false
    }
    else {
      this.isVariationsEnabled = true
    }
  }
  removeVariation(index: number): void {
    this.variations.splice(index, 1);
  }

  getCategories(restaurantId: any): void {
    this.toastService.showLoader();
    this.menuApiService.getCategories(restaurantId)
      .subscribe(
        (resp: any) => {
          this.toastService.hideLoader();
          this.categories = resp;
        },
        (err) => {
          this.toastService.hideLoader();
        }
      );
  }

  loadMenuItems(): void {
    this.menuApiService.getMenuItems(this.restaurantId).subscribe(
      (res: any[]) => {
        // Save the API response.
        // Each object is expected to have properties like itemId and itemName.
        this.menuItems = res;
      },
      (error) => {
        console.error('Error fetching menu items:', error);
      }
    );
  }

  addRow(): void {
    this.comboItems.push({ itemId: '', qty: '', price: '' });
  }
  deleteRow(index: number): void {
    // The Delete button is disabled for the first row, but double-check here.
    if (index === 0) {
      return;
    }

    if (confirm('Are you sure you want to delete this row?')) {
      if (this.comboItems.length > 1) {
        this.comboItems.splice(index, 1);
      } else {
        // If only one row remains, simply clear its values.
        this.comboItems[0] = { itemId: '', qty: '', price: '' };
      }
    }
  }


  onDietaryChange(dietaryOption: string, event: any): void {
    const dietaryArray: FormArray = this.menuItemForm.get('dietary') as FormArray;
    if (event.target.checked) {
      dietaryArray.push(this.fb.control(dietaryOption));
    } else {
      const index = dietaryArray.controls.findIndex(ctrl => ctrl.value === dietaryOption);
      if (index >= 0) {
        dietaryArray.removeAt(index);
      }
    }
  }

  onOrderTypeChange(orderType: string, event: any): void {
    const orderTypeArray: FormArray = this.menuItemForm.get('orderType') as FormArray;
    if (event.target.checked) {
      orderTypeArray.push(this.fb.control(orderType));
    } else {
      const index = orderTypeArray.controls.findIndex(ctrl => ctrl.value === orderType);
      if (index >= 0) {
        orderTypeArray.removeAt(index);
      }
    }
  }

  isAllDaysSelected(): boolean {
    return this.alldays.length === this.daysOfWeek.length;
  }


  onAllDaysChange(event: any): void {
    if (event.target.checked) {
      this.alldays = [...this.daysOfWeek];
    } else {
      this.alldays = [];
    }
  }

  // Handle individual day checkbox change
  onDayChange(day: string, event: any): void {
    if (event.target.checked) {
      // Add selected day to the array
      if (!this.alldays.includes(day)) {
        this.alldays.push(day);
      }
    } else {
      // Remove deselected day from the array
      const index = this.alldays.indexOf(day);
      if (index > -1) {
        this.alldays.splice(index, 1);
      }
    }

    // If all individual days are selected, check the "All Days" checkbox
    if (this.alldays.length === this.daysOfWeek.length) {
      // This will automatically check "All Days"
    } else {
      // This will uncheck "All Days" if not all days are selected
    }
  }
  onCloseMenu(): void {
    this.closeEdit.emit();
  }

  getMenuvariants(restaurantId: String): void {
    this.menuApiService.getMenuvariants(restaurantId).subscribe((resp: any) => {
      this.variantOptions = resp
    }, (error) => {
      console.error('Error fetching categories:', error);
    })
  }

  // fetchAddons() {
  //   if (this.restaurantId) {
  //     this.menuApiService.getAddonsByRestaurantId(+this.restaurantId) // Convert to number
  //       .subscribe({
  //         next: (response) => {
  //           console.log("addons" , response);
  //           this.addons = response; // Assign response to addons
  //         },
  //         error: (err) => {
  //           console.error('Error fetching add-ons:', err);
  //         },
  //       });
  //   }
  // }

  onSave () {
    this.toastService.showLoader()

    const payload = {
      itemId: this.menuItemForm.value.itemId,
      restaurantId: this.menuItemForm.value.restaurantId,
      categoryId: this.menuItemForm.value.categoryId,
      itemName: this.menuItemForm.value.itemName,
      shortCode: this.menuItemForm.value.shortCode,
      shortCode2: this.menuItemForm.value.shortCode2,
      onlineDisplayName: this.menuItemForm.value.onlineDisplayName,
      category: this.menuItemForm.value.category,
      basePrice: this.menuItemForm.value.basePrice,
      description: this.menuItemForm.value.description,
      dietary: this.menuItemForm.value.dietary || [],  // FormArray values
      goodsAndService: this.menuItemForm.value.goodsAndService,
      orderType: this.menuItemForm.value.orderType || [],  // FormArray values
      variants: this.variations || [],  // FormArray values
      itemImageURL: this.menuItemForm.value.itemImageURL,
      containerCharges: this.menuItemForm.value.containerCharges,
      weight: this.menuItemForm.value.weight,
      profitMargin: this.menuItemForm.value.profitMargin,
      exposeItem: this.menuItemForm.value.exposeItem || [],  // FormArray values
      allDays: this.alldays || [],  // FormArray values
      noDecimalValue: this.menuItemForm.value.noDecimalValue,
      ignoreTax: this.menuItemForm.value.ignoreTax,
      setAsFavorite: this.menuItemForm.value.setAsFavorite,
      openQualityPopup: this.menuItemForm.value.openQualityPopup,
      ignoreDiscount: this.menuItemForm.value.ignoreDiscount,
      ignoreAddOn: this.menuItemForm.value.ignoreAddOn,
      ignorePackingCharge: this.menuItemForm.value.ignorePackingCharge,
      mrpItem: this.menuItemForm.value.mrpItem,
      removeFromDineQR: this.menuItemForm.value.removeFromDineQR,
      containsAlcohol: this.menuItemForm.value.containsAlcohol,
      setAsOpenItem: this.menuItemForm.value.setAsOpenItem,
     setAsCombo: this.menuItemForm.value.setAsCombo,
     comboItems: this.comboItems.filter((obj:any) => obj.itemId !== '') || [],
      glutenFree: this.menuItemForm.value.glutenFree,
      hsnCode: this.menuItemForm.value.hsnCode,
      sapCode: this.menuItemForm.value.sapCode,
      fsnCode: this.menuItemForm.value.fsnCode || '',  // Use empty string if null
      stockStatus: this.menuItemForm.value.stockStatus,
      cuisine: this.menuItemForm.value.cuisine || ""  // Use empty string if null
    };

    this.menuApiService.editMenuItems([payload]).subscribe((resp) => {
      this.toastService.hideLoader();
      this.onCloseMenu();
    },(error) => {
      this.toastService.hideLoader();
    })
  }

  onItemChange(comboItem: any) {
    const selectedItem = this.menuItems.find(item => item.itemId === comboItem.itemId);
    if (selectedItem) {
        comboItem.price = selectedItem.basePrice; 
    } else {
        comboItem.price = '';
    }
}

  
}
