import { Component, EventEmitter, Output, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map
} from 'rxjs/operators';
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter, NgbTimeStruct
} from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Category, MenuItem } from '../../../models/selectmenuitems.model';
import { ToastService } from '../../../service//toast.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { get } from 'jquery';
interface DiscountMapping {
  buyBogoItems: any[];  
  getBogoItems: any[];
  buyDetail: string;
  getDetail: string;  
  marked: boolean;  
}
@Component({
  selector: 'app-add-discounts',
  templateUrl: './add-discounts.component.html',
  styleUrl: './add-discounts.component.scss',
  encapsulation: ViewEncapsulation.None

})
export class AddDiscountsComponent {

  @Output() closeCreateDiscount = new EventEmitter<boolean>();
  @ViewChildren('buyList') buyLists: QueryList<CdkDropList>;
  @ViewChildren('getList') getLists: QueryList<CdkDropList>;
  @ViewChild('sourceList') sourceList: CdkDropList; 
  @ViewChild('sourceListGet') sourceListGet: CdkDropList; 
  
  restaurantID: string | null = null;
  discountForm: FormGroup;

  datepickerDefaultValue: String = '';
  datepickerComponentValue: String = '';
  datepickerInlineDate: { year: number; month: number };
  datepickerInlineValue: NgbDateStruct;

  daterangepickerFromDate: NgbDate | null;
  daterangepickerToDate: NgbDate | null;
  daterangepickerHoveredDate: NgbDate | null = null;
  timepickerDefaultValue = { hour: 0, minute: 0 };
  timepickerComponentValue = { hour: 0, minute: 0 };
  timepickerComponentMeridian: boolean = true;
  timepickerInlineValue = { hour: 0, minute: 0 };

  applicableOn: string = 'all';
  selectAll: boolean = false;
  categories: Category[] = [];
  mobileSidebarToggled: boolean = false;
  allDaysSelected = false;
  showDays = false;
  discountOn = '';
  discountName = '';
  amount = '';
  // selectedDiscountType = '';
  selectedAddOn = '';
  description = '';
  isSelected = {
    delivery: true,
    pickUp: true,
    dineIn: true,
    bogoGetItemType:true
  };
  selectedOrderTypes: string[] = [];
  selectedCategories: string[] = [];
  selectedItems: string[] = [];
  minDiscount = '';
  maxDiscount = '';
  allowMaxDiscount = '';

  applicableOnGet: string = 'all';
  selectAllGet: boolean = false;
  selectedCategoriesGet: string[] = [];
  selectedItemsGet: string[] = [];

  selectedBOGOGetItemType: string = 'Lower Price';
  selectedBOGOBuyItemType: string = 'Lower Price';
  selectedBOGODiscountType: string = 'Percentage';
  dateTimeData = {
    fromDate: { year: 2024, month: 12, day: 10 } as NgbDateStruct,
    toDate: { year: 2024, month: 12, day: 10 } as NgbDateStruct,
    fromTime: { hour: 0, minute: 0 } as NgbTimeStruct,
    toTime: { hour: 0, minute: 0 } as NgbTimeStruct
  };
  today: NgbDateStruct;
  Validation: string = '';
  allowRuntimeChanges: boolean = false;
  status: boolean = false;
  selectedDiscountType: string = 'Percentage';
  buyItems: any[] = [];
  getItems: any[] = [];
  buyMappingLists: string[] = [];
  getMappingLists: string[] = [];
  availableSource: any[] = [];
  availableSourceGet: any[] = [];
 mappings: DiscountMapping[] = [];


  constructor(private fb: FormBuilder,
    private calendar: NgbCalendar,
    private http: HttpClient,
    public formatter: NgbDateParserFormatter,
    private menuApiService: MenuApiService,
    private store: Store,
    private toastService: ToastService) {
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
      if (this.restaurantID) {
        this.getGroupedMenuItems();
      }
    });
    const currentDate = new Date();
    this.today = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate()
    };

    this.dateTimeData.fromDate = { ...this.today };
    this.dateTimeData.toDate = { ...this.today };
  }

  daysOfWeek = [
    { name: 'Monday', selected: false },
    { name: 'Tuesday', selected: false },
    { name: 'Wednesday', selected: false },
    { name: 'Thursday', selected: false },
    { name: 'Friday', selected: false },
    { name: 'Saturday', selected: false },
    { name: 'Sunday', selected: false },
  ];

  ngOnInit(): void {
    this.getGroupedMenuItems();
    this.initializeFileNodeBehavior();
    this.addNewMapping();
  }
  ngAfterViewInit() {
    this.buyLists.changes.subscribe(() => {
      this.buyMappingLists = this.buyLists.map(list => list.id);
    });

    this.getLists.changes.subscribe(() => {
      this.getMappingLists = this.getLists.map(list => list.id);
    });
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarToggled = !this.mobileSidebarToggled;
  }

  toggleSelectAll(applicableOn: string) {
    debugger;
    if (applicableOn == 'category') {
      if (this.selectAll) {
        this.selectedCategories = [];
        this.categories.forEach(category => {
          this.selectedCategories.push(category.categoryId as any);
        });
      } else {
        this.selectedCategories = [];
      }
    } else {
      if (this.selectAll) {
        this.selectedItems = [];
        this.categories.forEach(category => {
          category.items.forEach(item => {
            this.selectedItems.push(item.itemId as any)
          })
        });
      } else {
        this.selectedItems = [];
      }
    }
  }


  toggleCategory(category: string): void {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(item => item !== category);
    } else {
      this.selectedCategories.push(category);
    }
  }

  toggleItem(item: any): void {
    if (this.selectedItems.includes(item)) {
      this.selectedItems = this.selectedItems.filter(i => i !== item);
    } else {
      this.selectedItems.push(item);
    }
    console.log('Selected Items:', this.selectedItems);
  }
  updateSelectAllStatus() {
    this.selectAll = this.categories.every(category => category.selected);
  }

  toggleSelectAllGet(applicableOnGet: string) {
    if (applicableOnGet == 'category') {
      if (this.selectAllGet) {
        this.selectedCategoriesGet = [];
        this.categories.forEach(category => {
          this.selectedCategoriesGet.push(category.categoryId as any);
        });
      } else {
        this.selectedCategoriesGet = [];
      }
    } else {
      if (this.selectAllGet) {
        this.selectedItemsGet = [];
        this.categories.forEach(category => {
          category.items.forEach(item => {
            this.selectedItemsGet.push(item.itemId as any)
          })
        });
      } else {
        this.selectedItemsGet = [];
      }
    }
  }
  
  toggleCategoryGet(category: string): void {
    if (this.selectedCategoriesGet.includes(category)) {
      this.selectedCategoriesGet = this.selectedCategoriesGet.filter(item => item !== category);
    } else {
      this.selectedCategoriesGet.push(category);
    }
  }
  
  toggleItemGet(item: any): void {
    if (this.selectedItemsGet.includes(item)) {
      this.selectedItemsGet = this.selectedItemsGet.filter(i => i !== item);
    } else {
      this.selectedItemsGet.push(item);
    }
  }
  getGroupedMenuItems() {
    this.menuApiService.getGroupedMenuItems(+this.restaurantID).subscribe((data: any) => {
      this.categories = data.map((category: any) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        expanded: false,
        items: category.items.map((item: any) => ({
          itemId: item.itemId,
          itemName: item.itemName,
        }))
      }));
      if (this.applicableOn !== 'all') {
        this.initializeAvailableSource();
      }
      if (this.applicableOnGet !== 'all') {
        this.initializeAvailableSourceGet();
      }
    });
  }
  
  setApplicableOn(option: string): void {
    this.applicableOn = option;
    this.selectAll = false;
    this.selectedCategories = [];
    this.selectedItems = [];
    if (option === 'all') {
      this.categories.forEach(category => {
        this.selectedCategories.push(category.categoryId as any);
      });
      this.availableSource = [];
      this.buyItems = [];
    } else {
      this.initializeAvailableSource();
    }
  }
  

  setApplicableOnGet(option: string) {
    this.applicableOnGet = option;
    this.selectAllGet = false;
    this.selectedCategoriesGet = [];
    this.selectedItemsGet = [];
    if (option === 'all') {
      this.categories.forEach(category => {
        this.selectedCategoriesGet.push(category.categoryId as any);
      });
      this.availableSourceGet = [];
      this.getItems = [];
    } else {
      this.initializeAvailableSourceGet();
    }
    }
  
  get sourceData(): any[] {
    if (this.applicableOn === 'category') {
      return this.categories;
    } else if (this.applicableOn === 'items') {
      let items: MenuItem[] = [];
      this.categories.forEach(category => {
        if (category.items) {
          items.push(...category.items);
        }
      });
      return items;
    }
    return [];
  }

  /**
   * Initializes the availableSource array based on the current applicableOn mode.
   * For 'category' mode, availableSource is a copy of the categories array.
   * For 'items' mode, availableSource is a flattened array of all items from all categories.
   */

  initializeAvailableSource(): void {
    this.availableSource = []; // Clear availableSource when reinitializing.

    if (this.applicableOn === 'category') {
      this.availableSource = [...this.categories]; // Shallow copy
    } else if (this.applicableOn === 'items') {
      this.availableSource = []; // Clear before adding items
      this.categories.forEach(category => {
        if (category.items) {
          this.availableSource.push(...category.items);
        }
      });
    }
  }
  initializeAvailableSourceGet(): void {
    this.availableSourceGet = []; // Clear before reinitializing.
    this.getItems = []; // Clear the target list.
    if (this.applicableOnGet === 'category') {
      this.availableSourceGet = [...this.categories];
    } else if (this.applicableOnGet === 'items') {
      this.categories.forEach(category => {
        if (category.items) {
          this.availableSourceGet.push(...category.items);
        }
      });
    }
  }
  
  drop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      //const draggedItem = event.previousContainer.data[event.previousIndex];

      // Create a copy of the dragged item
      //const newItem = { ...draggedItem }; // Shallow copy, adjust for deep copies if needed

      // Add the *copy* to the target container
     // event.container.data.push(newItem);
      transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              event.previousIndex,
              event.currentIndex
            );
      // Optionally remove from source container if you want move behavior
      // event.previousContainer.data.splice(event.previousIndex, 1);

      if (event.previousContainer.id === 'targetList' && event.container.id === 'sourceList') {
        this.initializeAvailableSource();//or update availableSource based on applicableOn
      }
    }
  }

  dropGet(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  addNewMapping(): void {
    // Add an empty mapping.
    this.mappings.push({ buyBogoItems: [], getBogoItems: [], buyDetail: '', getDetail:'',marked: false });
  }
  markMapping(index: number): void {
    // Toggle the 'marked' state for the mapping.
    this.mappings[index].marked = !this.mappings[index].marked;
  }
  
  // Drop handler for the mapping's BUY side.
  dropMappingBuy(event: CdkDragDrop<any[]>, mappingIndex: number): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.mappings[mappingIndex].buyBogoItems, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        this.mappings[mappingIndex].buyBogoItems,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  // Drop handler for the mapping's GET side.
  dropMappingGet(event: CdkDragDrop<any[]>, mappingIndex: number): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.mappings[mappingIndex].getBogoItems, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        this.mappings[mappingIndex].getBogoItems,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  dropFromSource(event: CdkDragDrop<any[]>, type: 'buy' | 'get') {
    if (event.previousContainer === event.container) {
      return;
    }
  
    const item = event.previousContainer.data[event.previousIndex];
  
    // Determine if the dragged item came from the source list itself
    const fromSource =
      (type === 'buy' && event.previousContainer.id === this.sourceList.id) ||
      (type === 'get' && event.previousContainer.id === this.sourceListGet.id);
  
    if (fromSource) {
      // Dragging from source to mapping (assume mapping index 0 for this example)
      if (type === 'buy') {
        this.mappings[0].buyBogoItems.push(item);
        this.availableSource.splice(event.previousIndex, 1);
      } else {
        this.mappings[0].getBogoItems.push(item);
        this.availableSourceGet.splice(event.previousIndex, 1);
      }
    } else {
      // Dragging from a mapping back to the source.
      if (type === 'buy') {
        // Remove the item from whichever mapping it exists in
        this.mappings.forEach(mapping => {
          const idx = mapping.buyBogoItems.findIndex(i => i.id === item.id);
          if (idx > -1) {
            mapping.buyBogoItems.splice(idx, 1);
          }
        });
        this.availableSource.push(item);
      } else {
        this.mappings.forEach(mapping => {
          const idx = mapping.getBogoItems.findIndex(i => i.id === item.id);
          if (idx > -1) {
            mapping.getBogoItems.splice(idx, 1);
          }
        });
        this.availableSourceGet.push(item);
      }
    }
  }
  

  dropToMapping(event: CdkDragDrop<any[]>, mappingIndex: number, type: 'buy' | 'get') {
    if (event.previousContainer === event.container) {
      return; // Handle reordering within the same container if needed
    }

    const item = event.previousContainer.data[event.previousIndex];
    const mapping = this.mappings[mappingIndex];

    if (type === 'buy') {
        if (event.previousContainer.id === this.sourceList.id) {
            this.availableSource.splice(event.previousIndex, 1);
            mapping.buyBogoItems.push(item); // Only push if coming from source
        } else { // Item dragged from mapping back to source
            const indexInMapping = mapping.buyBogoItems.findIndex(i => i.id === item.id); // Find by ID
            if (indexInMapping > -1) {
                mapping.buyBogoItems.splice(indexInMapping, 1); // remove from mapping
                this.availableSource.push(item); // Add back to source
            }
        }
    } else {
        if (event.previousContainer.id === this.sourceListGet.id) {
            this.availableSourceGet.splice(event.previousIndex, 1);
            mapping.getBogoItems.push(item); // Only push if coming from source
        } else { // Item dragged from mapping back to source
            const indexInMapping = mapping.getBogoItems.findIndex(i => i.id === item.id); // Find by ID
            if (indexInMapping > -1) {
                mapping.getBogoItems.splice(indexInMapping, 1); // remove from mapping
                this.availableSourceGet.push(item); // Add back to source
            }
        }
    }
  }

  removeItemFromMapping(mappingIndex: number, type: 'buy' | 'get', item: any) { // Pass the item itself
    const mapping = this.mappings[mappingIndex];
    const itemsArray = mapping[type === 'buy' ? 'buyBogoItems' : 'getBogoItems'];

    const indexToRemove = itemsArray.findIndex(i => i.id === item.id); // Find by ID

    if (indexToRemove > -1) {
        const itemToRemove = itemsArray[indexToRemove]; // Get the item to add back to source
        itemsArray.splice(indexToRemove, 1); // Remove using the found index
        if (type === 'buy') {
            this.availableSource.push(itemToRemove);
        } else {
            this.availableSourceGet.push(itemToRemove);
        }
    }
}

removeMapping(mappingIndex: number): void {

  this.mappings.splice(mappingIndex, 1);
}

  onItemDropped(event: CdkDragDrop<any>) {
    // The dragged data is available via event.item.data.
    const draggedItem = event.item.data;
    // Optionally, you can check for duplicates here.
    if (!this.buyItems.includes(draggedItem)) {
      this.buyItems.push(draggedItem);
    }
  }
  dropListEnterPredicate(): boolean {
    return false;
  }
  
  saveDiscount() {
    const payload = {
      restaurantId: this.restaurantID,
      applicableOn: this.discountForm.get('applicableOn')?.value,
      categoryIds: this.discountForm.get('categoryIds')?.value,
      itemIds: this.discountForm.get('itemIds')?.value,
      selectedDays: this.discountForm.get('selectedDays')?.value,
    };

    this.menuApiService.saveDiscount(payload).subscribe(
      response => {
        console.log('Discount saved successfully', response);
        this.closeCreateDiscount.emit(true);
      },
      error => {
        console.error('Error saving discount', error);
      }
    );
  }

  initializeFileNodeBehavior() {
    const fileHasSubNodes = document.querySelectorAll(".file-node.has-sub");
    fileHasSubNodes.forEach(node => {
      const fileArrow = node.querySelector(".file-link > .file-arrow");
      if (fileArrow) {
        fileArrow.addEventListener("click", (event) => {
          event.preventDefault();
          node.classList.toggle("expand");
        });
      }
    });
  }

  toggleAllDays() {
    this.showDays = this.allDaysSelected;
    this.daysOfWeek.forEach(day => (day.selected = this.allDaysSelected));
  }

  updateAllDaysStatus() {
    this.allDaysSelected = this.daysOfWeek.every(day => day.selected);
  }

  onDateSelection(date: NgbDate) {
    if (!this.daterangepickerFromDate && !this.daterangepickerToDate) {
      this.daterangepickerFromDate = date;
    } else if (this.daterangepickerFromDate && !this.daterangepickerToDate && date && date.after(this.daterangepickerFromDate)) {
      this.daterangepickerToDate = date;
    } else {
      this.daterangepickerToDate = null;
      this.daterangepickerFromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.daterangepickerFromDate && !this.daterangepickerToDate && this.daterangepickerHoveredDate && date.after(this.daterangepickerFromDate) && date.before(this.daterangepickerHoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.daterangepickerToDate && date.after(this.daterangepickerFromDate) && date.before(this.daterangepickerToDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.daterangepickerFromDate) ||
      (this.daterangepickerToDate && date.equals(this.daterangepickerToDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  formatTime(time: any) {
    var value = '00:00';
    if (time.hour || time.minute) {
      value = (time.hour < 9) ? '0' + time.hour : time.hour;
      value += ':';
      value += (time.minute < 9) ? '0' + time.minute : time.minute;
    }
    return value;
  }

  onChangeOrderType(orderType: string, isChecked: boolean) {
    if (isChecked) {
      this.selectedOrderTypes.push(orderType);
    } else {
      const index = this.selectedOrderTypes.indexOf(orderType);
      if (index > -1) {
        this.selectedOrderTypes.splice(index, 1);
      }
    }
  }


  validation(): boolean {
    if (!this.discountOn) {
      return false;
    }
    if (!this.discountName) {
      return false;
    }
    if (!this.amount || isNaN(Number(this.amount)) || Number(this.amount) <= 0) {
      return false;
    }
    if (!this.selectedDiscountType) {
      return false;
    }
    if (!this.selectedAddOn) {
      return false;
    }
    if (!this.description) {
      return false;
    }
    if (this.selectedOrderTypes.length === 0) {
      return false;
    }


    if (this.selectedCategories.length === 0 && this.selectedItems.length === 0) {
      return false;
    }

    if (!this.minDiscount || isNaN(Number(this.minDiscount)) || Number(this.minDiscount) < 0) {
      return false;
    }


    if (!this.maxDiscount || isNaN(Number(this.maxDiscount)) || Number(this.maxDiscount) < 0) {
      return false;
    }

    if (!this.allowMaxDiscount || isNaN(Number(this.allowMaxDiscount))) {
      return false;
    }


    if (!this.dateTimeData.fromDate || !this.dateTimeData.toDate) {
      return false;
    }
    const fromDate = new Date(this.dateTimeData.fromDate.year, this.dateTimeData.fromDate.month - 1, this.dateTimeData.fromDate.day);
    const toDate = new Date(this.dateTimeData.toDate.year, this.dateTimeData.toDate.month - 1, this.dateTimeData.toDate.day);
    if (fromDate > toDate) {
      return false;
    }
    return true;
  }


  onSubmit() {
    this.toastService.showLoader();
    const payload = {
      "restaurantId": this.restaurantID,
      "discountTitle": "Holiday Discount",
      "discountName": this.discountName,
      "discountAmount": this.amount,
      "discountType": this.selectedDiscountType,
      "addOnType": this.selectedAddOn,
      "description": this.description,
      "termsConditions": "Valid until 25th December 2024.",
      "orderTypes": this.selectedOrderTypes,
      "applicableOn": {
        "type": this.applicableOn,
        "categoryIds": this.selectedCategories.map(Number),
        "menuItemIds": this.selectedItems.map(Number)
      },
      "applicableAmount": {
        "minAmount": this.minDiscount,
        "maxAmount": this.maxDiscount,
        "allowMaxDiscount": false
      },
      "dateDuration": {
        "fromDate": `${this.dateTimeData.fromDate.year}-${this.dateTimeData.fromDate.month.toString().padStart(2, '0')}-${this.dateTimeData.fromDate.day.toString().padStart(2, '0')}`,
        "fromTime": `${this.dateTimeData.fromTime.hour.toString().padStart(2, '0')}:${this.dateTimeData.fromTime.minute.toString().padStart(2, '0')}`,
        "toDate": `${this.dateTimeData.toDate.year}-${this.dateTimeData.toDate.month.toString().padStart(2, '0')}-${this.dateTimeData.toDate.day.toString().padStart(2, '0')}`,
        "toTime": `${this.dateTimeData.toTime.hour.toString().padStart(2, '0')}:${this.dateTimeData.toTime.minute.toString().padStart(2, '0')}`
      },
      "validationType": this.Validation,
      "daysOfWeek": this.daysOfWeek
        .filter(day => day.selected === true)
        .map(day => day.name),
      "allowRuntimeChanges": this.allowRuntimeChanges,
      "status": this.status
    }

    console.log(payload)

    this.menuApiService.saveDiscount(payload).subscribe((resp) => {
      this.toastService.hideLoader();
      this.toastService.showToast('Success', 'Discounts Save/Edit successful!', true, 'success');
      this.closeCreateDiscount.emit(true);
    }, (error) => {
      this.toastService.hideLoader();
      this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
    })

  }
  oncancel() {
    this.closeCreateDiscount.emit(true);
  }

}
