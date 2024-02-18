import type { Cart } from "./types";

export const createCartService = () => {
	const database = new Map();

	const postCart = async (
		cart: Omit<Cart, "uuid">,
		throws?: boolean,
	): Promise<number> => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		const savedCart: Cart = {
			...cart,
			uuid: database.size + 1,
		};

		database.set(cart.user, savedCart);

		return savedCart.uuid;
	};

	const getCart = async (user: number, throws?: boolean): Promise<Cart> => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		if (!database.has(user)) {
			throw new Error(`Cart not found for user ${user}`);
		}

		return database.get(user);
	};

	const deleteCart = async (
		cart: number,
		throws?: boolean,
	): Promise<void> => {
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
