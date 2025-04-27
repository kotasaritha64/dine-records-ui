import { Category } from './../../../models/category.model';
import { SharedService } from './../../../service/shared.service';
import { Component, EventEmitter, OnInit, OnDestroy, Output, ChangeDetectorRef } from '@angular/core';
import { MenuApiService } from '../../../service/api-services/menu-api.service';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from '../../../store/restaurant.selectors';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../service//toast.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.scss'
})
export class AddCategoryComponent implements OnInit, OnDestroy {

  @Output() closeCreateCategory = new EventEmitter<string>();

  restaurantID: string | null = null;

  categoryForm: FormGroup;
  categoryName: string = '';
  onlineDisplayName: string = '';
  status: boolean = false;
  logoImage: File | null = null;
  onlinePartnerImage: File | null = null;
  zomatoImage: File | null = null;
  kioskImage: File | null = null;
  categoryId: any = 0;
  existingImages = {
    logo: '',
    onlinePartner: '',
    kiosk: '',
  };
  newImages = {
    logo: null,
    onlinePartner: null,
    kiosk: null
  };

  timeSlots: { from: string, to: string }[] = [{ from: '00:00', to: '24:00' }];
  timeOptions: string[] = [];

  showDays = false;
  // Initialize with default values
  showSchedule: boolean = false;
  allDaysSelected: boolean = true;
  showIndividualDays: boolean = false;
  categoryGroups: any[] = []; // Add a property to store category groups
  isImageResolutionValid: boolean = true; // Flag to track image resolution validation

  constructor(private fb: FormBuilder, private menuApiService: MenuApiService, private store: Store, private shared: SharedService, private toastService: ToastService, private cdr: ChangeDetectorRef) {
    //this.restaurantId$ = this.store.select(selectRestaurantId);

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Mandatory field
      onlineDisplayName: [''], // Optional field
      status: [true],
      scheduleName: [''],
      days: this.fb.array([]), // Dynamic list of days
      timeSlots: this.fb.array([]), // Initialize as an empty array
      categoryGroupId: [''] // Optional field
    });

    // Get restaurantID from NgRx store
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantID = id;
    });
        // Explicitly initialize schedule state
    // this.buttonText = 'Add Schedule';
        this.showSchedule = false;
    this.toggleAllDays();

    // Retrieve group categories from SharedService
    this.categoryGroups = this.shared.getGroupCategories() || [];
  }

  daysOfWeek = [
    { name: 'Mon', selected: false },
    { name: 'Tue', selected: false },
    { name: 'Wed', selected: false },
    { name: 'Thu', selected: false },
    { name: 'Fri', selected: false },
    { name: 'Sat', selected: false },
    { name: 'Sun', selected: false },
  ];

  ngOnInit(): void {
    const categoryEdit = this.shared.getCategories();

    if (categoryEdit) {
      this.categoryForm.patchValue({
        name: categoryEdit.categoryName,
        onlineDisplayName: categoryEdit.onlineDisplayName,
        status: categoryEdit.status,
        categoryGroupId: categoryEdit.categoryGroupId // Patch category group ID
      });
      this.existingImages.logo = categoryEdit.logoImageUrl;
      this.existingImages.kiosk = categoryEdit.kioskImageUrl;
      this.existingImages.onlinePartner = categoryEdit.foodPartnerImageUrl;
      this.categoryId = categoryEdit.categoryId;
      // Handle schedule data if it exists
      if (categoryEdit.scheduleDTO && categoryEdit.scheduleDTO.days.length > 0) {
        this.categoryForm.patchValue({
          scheduleName: categoryEdit.scheduleDTO.scheduleName
        });

        // Map days
        this.daysOfWeek.forEach(day => {
          day.selected = categoryEdit.scheduleDTO.days.includes(day.name);
        });

        // Map time slots
        const timeSlotsArray = this.categoryForm.get('timeSlots') as FormArray;
        timeSlotsArray.clear();
        categoryEdit.scheduleDTO.timeSlots.forEach((slot: string) => {
          const [from, to] = slot.split('-');
          timeSlotsArray.push(this.fb.group({
            from: [from, Validators.required],
            to: [to, Validators.required]
          }));
        });

        // Enable schedule section
        this.showSchedule = true;
      
        this.updateAllDaysStatus(); // Update the all days checkbox state
      } else {
        // Disable schedule section if no schedule data exists
        this.resetSchedule();
      }
      this.shared.setCategories(null);
    }
    this.generateTimeOptions();
  }

  generateTimeOptions() {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMin = min.toString().padStart(2, '0');
        times.push(`${formattedHour}:${formattedMin}`);
      }
    }
    this.timeOptions = times;
  }

  ngOnDestroy(): void {
    this.categoryId = 0;
    this.newImages = { logo: null, onlinePartner: null, kiosk: null };
    this.existingImages = {
      logo: '',
      onlinePartner: '',
      kiosk: '',
    };
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => {
        img.src = e.target.result;
        img.onload = () => {
          if (img.width < 400 || img.height < 400) {
            this.toastService.showToast('Error', 'Image resolution should be more than 400x400.', true, 'error');
            this.isImageResolutionValid = false; // Set flag to false
            return;
          }
          this.isImageResolutionValid = true; // Set flag to true
          switch (field) {
            case 'logoImage':
              this.logoImage = file;
              this.newImages.logo = e.target.result;
              break;
            case 'onlinePartnerImage':
              this.onlinePartnerImage = file;
              this.newImages.onlinePartner = e.target.result;
              break;
            case 'kioskImage':
              this.kioskImage = file;
              this.newImages.kiosk = e.target.result;
              break;
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  saveCategory() {
    if (!this.isImageResolutionValid) {
        this.toastService.showToast('Error', 'Please upload valid images with resolution more than 400x400.', true, 'error');
        return; // Prevent saving if image resolution is invalid
    }

    // Validate overlapping time slots
    const timeSlots = this.categoryForm.value.timeSlots;
    if (this.hasOverlappingTimeSlots(timeSlots)) {
        this.toastService.showToast('Error', 'Time slots overlap. Please fix them before saving.', true, 'error');
        return;
    }

    const selectedDays = this.daysOfWeek
        .filter(day => day.selected)
        .map(day => day.name);

    this.toastService.showLoader();
    if (!this.restaurantID) {
        console.error('Restaurant ID is missing!');
        this.toastService.hideLoader();
        return;
    }

    const formData = new FormData();
    formData.append('restaurantID', this.restaurantID);
    formData.append('categoryName', this.categoryForm.value.name);
    formData.append('onlineDisplayName', this.categoryForm.value.onlineDisplayName);
    formData.append('status', this.categoryForm.value.status ? 'true' : 'false');

    const categoryGroupId = this.categoryForm.value.categoryGroupId || '';
    formData.append('categoryGroupId', categoryGroupId);

    // Handle logo image
    if (this.logoImage) {
        formData.append('logoImage', this.logoImage);
    } else if (this.existingImages.logo === '') {
        formData.append('logoImageDeleted', 'true'); // Flag to indicate logo image deletion
    }

    // Handle online partner image
    if (this.onlinePartnerImage) {
        formData.append('onlinePartnerImage', this.onlinePartnerImage);
    } else if (this.existingImages.onlinePartner === '') {
        formData.append('onlinePartnerImageDeleted', 'true'); // Flag to indicate online partner image deletion
    }

    // Handle kiosk image
    if (this.kioskImage) {
        formData.append('kioskImage', this.kioskImage);
    } else if (this.existingImages.kiosk === '') {
        formData.append('kioskImageDeleted', 'true'); // Flag to indicate kiosk image deletion
    }

    selectedDays.forEach(day => formData.append("days", day));

    const validTimeSlots = this.categoryForm.value.timeSlots
        .filter(slot => slot.from && slot.to)
        .map(slot => ({
            fromTime: slot.from,
            toTime: slot.to
        }));
    formData.append('timeSlots', JSON.stringify(validTimeSlots));
    formData.append('scheduleName', this.categoryForm.value.scheduleName);

    if (this.categoryId > 0) {
        this.editCategory(formData);
    } else {
        this.createCategory(formData);
    }
}

createCategory(formData: FormData) {
    this.menuApiService.createCategory(formData).subscribe(
        (response) => {
            if (response.status === 201) {
                this.toastService.hideLoader();
                this.toastService.showToast('Success', 'Category created successfully!', true, 'success');
                this.onCancel();
            } else {
                this.toastService.hideLoader();
                this.toastService.showToast('Error', 'Something went wrong!', false, 'error');
            }
        },
        (error) => {
            this.toastService.hideLoader();
            this.toastService.showToast('Error', 'Something went wrong!', true, 'error');
        }
    );
}

editCategory(formData: FormData) {
    this.menuApiService.updateCategories(this.categoryId, formData).subscribe(
        (response) => {
            this.toastService.hideLoader();
            this.toastService.showToast('Success', 'Category updated successfully!', true, 'success');
            this.onCancel();
        },
        (error) => {
            this.toastService.hideLoader();
            this.toastService.showToast('Error', 'Something went wrong!', true, 'error');
        }
    );
}

hasOverlappingTimeSlots(timeSlots: { from: string, to: string }[]): boolean {
    for (let i = 0; i < timeSlots.length; i++) {
        for (let j = i + 1; j < timeSlots.length; j++) {
            const slot1 = timeSlots[i];
            const slot2 = timeSlots[j];
            if (
                (slot1.from < slot2.to && slot1.to > slot2.from) || // Overlap condition
                (slot2.from < slot1.to && slot2.to > slot1.from)
            ) {
                return true;
            }
        }
    }
    return false;
}

onCancel() {
    this.closeCreateCategory.emit('category'); // Emit the tab name
}

  imageReader(type: String, file: any) {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      if (type == "logoImage") {
        this.newImages.logo = event.target.result;
      } else if (type == "kioskImage") {
        this.newImages.kiosk = event.target.result;
      } else {
        this.newImages.onlinePartner = event.target.result;
      }
    };

    reader.readAsDataURL(file);
  }

  clearImage(imageType: string) {
    const confirmation = confirm('Are you sure you want to delete this image?');
    if (!confirmation) {
        return; // Exit if the user cancels the confirmation
    }

    if (imageType === 'logoImage') {
        this.logoImage = null;
        this.newImages.logo = null;
        this.existingImages.logo = '';
        const logoFileInput = document.getElementById('logoFile') as HTMLInputElement;
        if (logoFileInput) logoFileInput.value = '';
    } else if (imageType === 'onlinePartnerImage') {
        this.onlinePartnerImage = null;
        this.newImages.onlinePartner = null;
        this.existingImages.onlinePartner = '';
        const partnerFileInput = document.getElementById('onlinePartnerFile') as HTMLInputElement;
        if (partnerFileInput) partnerFileInput.value = '';
    } else if (imageType === 'kioskImage') {
        this.kioskImage = null;
        this.newImages.kiosk = null;
        this.existingImages.kiosk = '';
        const kioskFileInput = document.getElementById('kioskFile') as HTMLInputElement;
        if (kioskFileInput) kioskFileInput.value = '';
    }

    // Show a success message after deletion
}

// Add/Remove Schedule Button Click
  toggleSchedule() {
    this.showSchedule = !this.showSchedule;
    this.cdr.detectChanges();
    if (this.showSchedule) {
      this.enableAllDays();
      if (this.timeSlotsArray.length === 0) {
        // Add a default time slot when enabling the schedule
        this.timeSlotsArray.push(this.fb.group({
          from: ['00:00', Validators.required],
          to: ['23:30', Validators.required]
        }));
      }
    } else {
      this.resetSchedule();
    }
  }

  // Enable "All Days" by default when adding a schedule
  enableAllDays() {
    this.allDaysSelected = true;
    this.showIndividualDays = false;
    this.daysOfWeek.forEach(day => day.selected = true);
  }

  // Toggle "All Days" Selection
  toggleAllDays() {
    // Explicitly toggle the value
    this.allDaysSelected = !this.allDaysSelected;
    if (this.allDaysSelected) {
      // Check all days & hide individual checkboxes
      this.daysOfWeek.forEach(day => day.selected = true);
      this.showIndividualDays = false;
    } else {
      // Uncheck all days & show individual checkboxes
      this.daysOfWeek.forEach(day => day.selected = false);
      this.showIndividualDays = true;
    }
  }

  // Handle Individual Day Selection
  updateAllDaysStatus() {
    const allSelected = this.daysOfWeek.every(day => day.selected);
    this.allDaysSelected = allSelected;

    // If all days are not selected, show individual checkboxes
    this.showIndividualDays = !allSelected;
  }

  // Reset everything when "Remove Schedule" is clicked
  resetSchedule() {
    this.showSchedule = false;
    this.allDaysSelected = true;
    this.showIndividualDays = false;
    this.daysOfWeek.forEach(day => day.selected = true);
  }

  addTimeSlot() {
    const timeSlotsArray = this.timeSlotsArray;

    if (timeSlotsArray.length >= 3) {
        this.toastService.showToast('Error', 'You cannot add more than 3 slots', true, 'error');
        return;
    }

    const newSlot = this.fb.group({
        from: ['', Validators.required],
        to: ['', Validators.required]
    });

    // Check for overlapping time slots
    const isOverlapping = timeSlotsArray.controls.some(slot => {
        const existingFrom = slot.value.from;
        const existingTo = slot.value.to;

        // Ensure both "from" and "to" values are valid
        if (!existingFrom || !existingTo) {
            return false;
        }

        const newFrom = newSlot.value.from;
        const newTo = newSlot.value.to;

        return (
            (newFrom >= existingFrom && newFrom < existingTo) || // New "from" is within an existing slot
            (newTo > existingFrom && newTo <= existingTo) || // New "to" is within an existing slot
            (newFrom <= existingFrom && newTo >= existingTo) // New slot completely overlaps an existing slot
        );
    });

    if (isOverlapping) {
        this.toastService.showToast('Error', 'The time slot overlaps with an existing time slot.', true, 'error');
        return;
    }

    timeSlotsArray.push(newSlot);
}

  removeTimeSlot(index: number) {
        this.timeSlotsArray.removeAt(index);
  }

  toggleDaySelection(index: number) {
    this.daysOfWeek[index].selected = !this.daysOfWeek[index].selected;
    this.updateAllDaysStatus(); // Ensure "All Days" updates accordingly
  }

  get timeSlotsArray() {
    return this.categoryForm.get('timeSlots') as FormArray;
  }

  checkUniqueCategoryName() {
    const categoryName = this.categoryForm.get('name')?.value.trim();
    if (!categoryName || !this.restaurantID) return;

    this.menuApiService.getCategories(this.restaurantID).subscribe((categories) => {
        const isDuplicate = categories.some(c => 
            c.categoryName.toLowerCase() === categoryName.toLowerCase() && 
            c.id !== this.categoryId // Ensure it doesn't match the current category ID in edit mode
        );

        if (isDuplicate) {
            this.categoryForm.get('name')?.setErrors({ duplicate: true });
        } else {
            this.categoryForm.get('name')?.setErrors(null);
        }
    });
}

}
