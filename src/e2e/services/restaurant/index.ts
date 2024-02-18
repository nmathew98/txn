import type { Item } from "./types";

export const createRestaurantService = () => {
	const database = new Map();

	const postRestaurant = async (throws?: boolean): Promise<number> => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		const restaurant = database.size;

		database.set(restaurant, []);

		return restaurant;
	};

	const putItem = async (
		item: Omit<Item, "uuid">,
		throws?: boolean,
	): Promise<number> => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		if (!database.has(item.restaurant)) {
			throw new Error(`Restaurant ${item.restaurant} does not exist`);
		}

		const existingItems = database.get(item.restaurant);

		const ITEM_KEY = existingItems.length;

		const newItem: Item = {
			...item,
			uuid: ITEM_KEY,
		};

		const updatedItems = [newItem, ...existingItems];

		database.set(item.restaurant, updatedItems);

		return newItem.uuid;
	};

	const getItems = async (
		restaurant: number,
		throws?: boolean,
	): Promise<Item[]> => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		if (!database.has(restaurant)) {
			throw new Error(`Invalid restaurant ${restaurant}`);
		}

		return database.get(restaurant);
	};

	return {
		postRestaurant,
		putItem,
		getItems,
	};
};
