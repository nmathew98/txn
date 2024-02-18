export interface Cart {
	user: number;
	cart: number;
	restaurant: number;
	items: Item[];
}

export interface Order extends Cart {
	uuid: number;
}

export interface Item {
	uuid: number;
	quantity: number;
}
