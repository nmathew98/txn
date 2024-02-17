export interface Cart {
	uuid: number;
	user: number;
	restaurant: string;
	items: CartItem[];
	location: [number, number];
}

export interface Item {
	uuid: number;
	quantity: number;
}

export interface CartItem extends Item {
	extras: Item[];
}
