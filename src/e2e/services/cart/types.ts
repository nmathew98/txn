export interface Cart {
	uuid: number;
	user: number;
	restaurant: number;
	items: Item[];
}

export interface Item {
	uuid: number;
	quantity: number;
}
