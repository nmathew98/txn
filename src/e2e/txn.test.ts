import { describe, expect, it, vitest } from "vitest";
import { createRestaurantService } from "./services/restaurant";
import { createOrderService } from "./services/order";
import { createCartService } from "./services/cart";
import { createPaymentService } from "./services/payment";
import { createTransaction } from "../txn";
import { Cart } from "./services/cart/types";

describe("txn", () => {
	const orderService = createOrderService();
	const cartService = createCartService();
	const paymentService = createPaymentService();
	const restaurantService = createRestaurantService();

	describe("saving a cart", async () => {
		const restaurant = await restaurantService.postRestaurant();
		const items = await Promise.all(
			new Array(2)
				.fill(null)
				.map((_, idx) => ({
					restaurant,
					price: idx,
				}))
				.map(item => restaurantService.putItem(item)),
		);

		it("is successful if all items are valid", async () => {
			const postCart = async (cart: Omit<Cart, "uuid">) => {
				await using transaction = createTransaction({
					getItems: {
						queryFn: restaurantService.getItems,
						// TODO: Optional `onSuccess` and `onError`
						onSuccess: vitest.fn(),
						onError: vitest.fn(),
					},
					postCart: {
						queryFn: cartService.postCart,
						onSuccess: vitest.fn(),
						onError: vitest.fn(),
					},
				});

				const validItems = await transaction.exec(
					"getItems",
					cart.restaurant,
				);
				const validItemsSet = new Set(
					validItems.map(item => item.uuid),
				);

				if (cart.items.some(item => !validItemsSet.has(item.uuid))) {
					throw new Error("Cart has invalid items");
				}

				const newCart = await transaction.exec("postCart", cart);

				return { cart: newCart };
			};

			const result = await postCart({
				user: 1,
				restaurant,
				items: items.map((item, idx) => ({
					uuid: item,
					quantity: idx,
				})),
			});

			expect(result.cart).toBeTruthy();
		});

		it("fails if any item is invalid", async () => {
			const onSuccessGetItems = vitest.fn();
			const onErrorGetItems = vitest.fn();
			const onSuccessPostCart = vitest.fn();
			const onErrorPostCart = vitest.fn();

			const postCart = async (cart: Omit<Cart, "uuid">) => {
				await using transaction = createTransaction({
					getItems: {
						queryFn: restaurantService.getItems,
						// TODO: Optional `onSuccess` and `onError`
						onSuccess: onSuccessGetItems,
						onError: onErrorGetItems,
					},
					postCart: {
						queryFn: cartService.postCart,
						onSuccess: onSuccessPostCart,
						onError: onErrorPostCart,
					},
				});

				const validItems = await transaction.exec(
					"getItems",
					cart.restaurant,
				);
				const validItemsSet = new Set(
					validItems.map(item => item.uuid),
				);

				if (cart.items.some(item => !validItemsSet.has(item.uuid))) {
					throw new Error("Cart has invalid items");
				}

				const newCart = await transaction.exec("postCart", cart);

				return { cart: newCart };
			};

			const result = postCart({
				user: 1,
				restaurant,
				items: [{ uuid: 10, quantity: 2 }],
			});

			await expect(result).rejects.toThrowError();

			expect(onSuccessGetItems).not.toBeCalled();
			expect(onErrorGetItems).not.toBeCalled();

			expect(onSuccessPostCart).not.toBeCalled();
			expect(onErrorPostCart).not.toBeCalled();
		});
	});

	describe("creating an order", () => {
		it.todo("is successful if all items in the cart are valid");

		it.todo("fails if any item is invalid");
	});

	describe("paying for an order", () => {
		it.todo("is successful if order is valid");

		it.todo("fails if order is invalid");

		it.todo("refunds fail if an order has not been paid for");
	});

	describe("retrieving an order", () => {
		it.todo("fails if the items in an order are not valid");

		it.todo("is successful if the items in an order are valid");
	});

	describe("retrieving paid order", () => {
		it.todo("is successful if order is valid and has been paid");

		it.todo("fails if order is not valid");

		it.todo("fails if order has not been paid for");
	});
});
