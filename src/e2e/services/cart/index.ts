import type { Cart, SavedCart } from "./types";

export const createCartService = () => {
	const database = new Map();

	const postCart = async (cart: Cart, throws?: boolean) => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		const savedCart: SavedCart = {
			...cart,
			uuid: database.size,
		};

		database.set(cart.user, savedCart);

		return savedCart.uuid;
	};

	const getCart = async (user: number, throws?: boolean) => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		if (!database.has(user)) {
			throw new Error(`Cart not found for user ${user}`);
		}

		return database.get(user);
	};

	const deleteCart = async (cart: number, throws?: boolean) => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		database.delete(cart);
	};

	return {
		getCart,
		postCart,
		deleteCart,
	};
};
