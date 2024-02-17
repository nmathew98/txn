export interface Restaurant {
	uuid: number;
	items: Item[];
}

export interface Item {
	restaurant: number;
	uuid: number;
	price: number;
}

export interface ItemExtras {
	item: number;
	forItem: number;
}
