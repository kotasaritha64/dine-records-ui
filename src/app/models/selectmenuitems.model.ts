export interface MenuItem {
    itemName: string;
    selected: boolean;
    itemId: number;

  }
  
  export interface Category {
    categoryName: string;
    selected: boolean;
    expanded: boolean;
    items: MenuItem[];
    categoryId: number;
}