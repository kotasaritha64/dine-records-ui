import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { Store } from '@ngrx/store';
import { ToastService } from '../../../service//toast.service';
import { selectRestaurantId } from '../../../store/restaurant.selectors';



@Component({
  selector: 'app-table-area',
  templateUrl: './table-area.component.html',
  styleUrl: './table-area.component.scss'
})
export class TableAreaComponent implements OnInit {

  @ViewChild('myButton') myButton!: ElementRef;
  @ViewChild('myButton2') myButton2!: ElementRef;
  tableForm: FormGroup;
  areaForm: FormGroup;
  restaurantId: string | null = null;
  errorMessage: string = '';
  selectedTables: string[] = [];
  selectedTableIds: number[] = [];
  tables: any[] = [];
  areas: any[] = [];
  editTableId: any = 0;
  areaId: any = 0;
  assignedTables: Set<number> = new Set();
  searchTable : string = '';
  searchArea ; string = '';
  constructor(
    private fb: FormBuilder,
    private menuApiService: MenuApiService,
    private store: Store,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    // Create form group


    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantId = id;
    });

  }

  ngOnInit(): void {

    this.tableForm = this.fb.group({
      tableNumber: ['', [Validators.required, Validators.minLength(1)]],
      numberOfPersons: ['', [Validators.required]],
      additionalInfo: [''],
      status: [true]
    });

    this.areaForm = this.fb.group({
      areaType: ['', [Validators.required]],
      areaName: ['', [Validators.required]],
      status: [true]
      //tables: [[]] // Store selected tables
    });

    this.loadTables();
    this.getAreas();
  }

  // Create a table
  createTable() {
    if (this.tableForm.invalid) {
      this.toastService.showToast('Error', 'Form is invalid. Please check the fields.', false, 'error');
      return;
    }

    const tableData = {
      restaurantId: this.restaurantId,
      tableNumber: this.tableForm.value.tableNumber,
      numberOfPersons: this.tableForm.value.numberOfPersons,
      extraInformation: this.tableForm.value.additionalInfo,
      status: this.tableForm.value.status
    };

    if (this.editTableId == 0) {
      this.menuApiService.createTable(tableData).subscribe({
        next: (response) => {
          this.toastService.showToast('Success', 'Table created successfully', true, 'success');
          this.loadTables();
          this.resetTableForm();
          this.myButton.nativeElement.click();
        },
        error: (err) => {
          this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
        }
      });
    } else {
      this.menuApiService.updateTable(this.editTableId, tableData).subscribe((resp) => {
        this.toastService.showToast('Success', 'Table updated successfully', true, 'success');
        this.loadTables();
        this.resetTableForm();
        this.myButton.nativeElement.click();
      }, (error) => {
        this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
      })
    }

  }

  // Fetch tables for the current restaurant
  loadTables() {
    //if (!this.restaurantID) return;

    this.menuApiService.getTablesByRestaurantId(this.restaurantId).subscribe(
      (tables) => {
        this.tables = tables;
        this.cdr.detectChanges();
      },
      (err) => {
        this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
      }
    );
  }

  // Handle checkbox change for selecting tables
  onTableSelect(event: any, tableId: number) {
    if (event.target.checked) {
      this.selectedTableIds.push(tableId); // Add table ID to selected list
    } else {
      const index = this.selectedTableIds.indexOf(tableId);
      if (index !== -1) {
        this.selectedTableIds.splice(index, 1); // Remove table ID from selected list
      }
    }
  }


  selectAllTables(event: any) {
    if (event.target.checked) {
      this.selectedTableIds = this.tables.map(table => table.id); 
    } else {
      this.selectedTableIds = []; 
    }
  }

  // Save Area
  createArea() {
    if (this.areaForm.invalid) {
      this.toastService.showToast('Error', 'Form is invalid. Please check the fields.', false, 'error');
      return;
    }

    const areaData = {
      areaName: this.areaForm.value.areaName,
      areaType: this.areaForm.value.areaType,
      restaurantId: this.restaurantId,
      tableIds: this.selectedTableIds,
      status : this.areaForm.value.status
    };

    if(this.areaId == 0){

      this.menuApiService.createArea(areaData).subscribe({
        next: (response) => {
          this.toastService.showToast('Success', 'Area created successfully', true, 'success');
          this.resetAreaForm();
          this.getAreas();
          this.myButton2.nativeElement.click();
        },
        error: (err) => {
          this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
        }
      });
    }
    else {
        this.menuApiService.updateArea(this.areaId ,areaData).subscribe((resp)=>{
          this.toastService.showToast('Success', 'Area updated successfully', true, 'success');
          this.resetAreaForm();
          this.getAreas();
          this.myButton2.nativeElement.click();
        },(error) =>{
          this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
        })
    }
    
  }

  resetTableForm() {
    this.editTableId = 0;
    this.tableForm.reset({
      tableNumber: '',
      numberOfPersons: '',
      additionalInfo: '',
      status: true
    });
  }

  resetAreaForm() {
    this.areaId = 0;
    this.areaForm.reset({
      areaName: '',
      areaType: '',
      status: true
    });
    this.selectedTableIds = [];
  }



  onEdit(table: any) {
    this.editTableId = table.id;

    this.tableForm.patchValue({
      tableNumber: table.tableNumber,
      numberOfPersons: table.numberOfPersons,
      additionalInfo: table.extraInformation,
      status: table.status
    });


  }

  onEditArea(area : any) {
    this.areaId = area.id;
    this.areaForm.patchValue({
      areaType: area.areaType,
      areaName: area.areaName,
      status: area.status || true
  });
  this.selectedTableIds = area.tableIds;
  this.checkAssignedTables();

  }
  checkAssignedTables() {
    this.assignedTables.clear();  
    
    this.areas.forEach(area => {
      if (area.id !== this.areaId) { 
        area.tableIds.forEach(tableId => {
          this.assignedTables.add(tableId);  
        });
      }
    });
  }

  isTableAssignedToOtherArea(tableId: number): boolean {
    return this.assignedTables.has(tableId);
  }
  
  getAssignedAreaNameForTable(tableId: number): string {
    const assignedAreas = this.areas.filter(area => area.tableIds.includes(tableId));
      return assignedAreas.map(area => area.areaName).join(', ') || 'No Area Assigned';
  }
  

  clearTableModal() {
    this.editTableId = 0;

    this.tableForm.reset({
      tableNumber: '',
      numberOfPersons: '',
      additionalInfo: '',
      status: true
    });
  }

  getAreas() {
    this.menuApiService.getAreasByRestaurantId(this.restaurantId).subscribe((resp: any) => {
      this.areas = resp;
      this.cdr.detectChanges();
    }, (error) => {
      this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
    })
  }

  clearAreaModal() {
    this.areaId = 0;

    this.areaForm.reset({
      areaType: '',
      areaName: '',
      status: true
    });

    this.selectedTableIds = [];

  }

  getTableNames(tableIds: number[]): string {
    const tableMap = new Map(this.tables.map(table => [table.id, table.tableNumber]));
    return tableIds
      .map(id => tableMap.get(id)) 
      .filter(tableNumber => tableNumber !== undefined)
      .join(', ');
  }

  get filteredTables() {
    return this.tables.filter(table =>
      table.tableNumber.toLowerCase().includes(this.searchTable.toLowerCase())
    );
  }

  get filteredAreas() {
    const searchTerm = this.searchArea ? this.searchArea.toLowerCase() : '';   
    return this.areas.filter(area =>
      area.areaType.toLowerCase().includes(searchTerm)
    );
  }

}
