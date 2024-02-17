import { describe, expect, it, vitest } from "vitest";
import { createRestaurantService } from "./services/restaurant";
import { createOrderService } from "./services/order";
import { createCartService } from "./services/cart";
import { createPaymentService } from "./services/payment";

describe("txn", async () => {
	const orderService = createOrderService();
	const cartService = createCartService();
	const paymentService = createPaymentService();
	const restaurantService = createRestaurantService();

	const restaurant = await restaurantService.postRestaurant();

	describe("saving a cart", () => {
		it.todo("is successful if all items and extras are valid");

		it.todo("fails if any item or extra is invalid");
	});

	describe("creating an order", () => {
		it.todo("is successful if all items and extras in the cart are valid");

		it.todo("fails if any item or extra is invalid");
	});

	describe("paying for an order", () => {
		it.todo("is successful if order is valid");

		it.todo("fails if order is invalid");

		it.todo("refunds fail if an order has not been paid for");
	});

	describe("retrieving paid order", () => {
		it.todo("is successful if order is valid and has been paid");

		it.todo("fails if order is not valid");

		it.todo("fails if order has not been paid for");
	});
});
