export interface Cart {
	user: number;
	restaurant: string;
	items: CartItem[];
	location: [number, number];
}

export interface SavedCart extends Cart {
	uuid: number;
}

export interface Item {
	uuid: number;
	quantity: number;
}

export interface CartItem extends Item {
	extras: Item[];
}
