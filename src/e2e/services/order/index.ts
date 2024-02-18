import type { Cart, Order } from "./types";

export const createOrderService = () => {
	const database = new Map();

	const postOrder = async (cart: Cart, throws?: boolean): Promise<number> => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		const existingOrders = database.has(cart.user)
			? database.get(cart.user)
			: [];

		const newOrder: Order = {
			...cart,
			uuid: database.size + 1,
		};

		const updatedOrders: Order[] = [newOrder, ...existingOrders];

		database.set(cart.user, updatedOrders);

		return newOrder.uuid;
	};

	const getOrder = async (
		user: number,
		order: number,
		throws?: boolean,
	): Promise<Order> => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		if (!database.has(user)) {
			throw new Error(`No orders available for user ${user}`);
		}

		const existingOrders = database.get(user);
		const savedOrder = existingOrders.find(
			savedOrder => savedOrder.uuid === order,
		);

		if (!savedOrder) {
			throw new Error(`Order ${order} not found`);
		}

		return savedOrder;
	};

	const deleteOrder = async (
		user: number,
		order: number,
		throws?: boolean,
	) => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		if (!database.has(user)) {
			throw new Error(`Invalid user ${user}`);
		}

		const existingOrders = database.get(user);

		const updatedOrders: Order[] = existingOrders.filter(
			existingOrder => existingOrder.uuid === order,
		);

		database.set(user, updatedOrders);
	};

	return {
		getOrder,
		postOrder,
		deleteOrder,
	};
};
