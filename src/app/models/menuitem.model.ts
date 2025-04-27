export interface MenuItem {
    itemName: string;
    shortCode: string;
    onlineDisplayName: string;
    category: string | number; 
    price: string | number;
    description: string;
    available: boolean;
    choice: string;
    goodsAndServices: string;
    desktopType: string;
    addOns: string | boolean; 
    rating: number;
    image?: File;
    variationId?: number;
    restaurantId?: number;
  }
  