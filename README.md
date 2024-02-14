![Tests](https://github.com/nmathew98/txn/actions/workflows/main.yml/badge.svg)

## About

Simple distributed transactions using a container.

Has optional support for [`AsyncDisposable`](https://github.com/tc39/proposal-explicit-resource-management).

## Features

-   CJS + ESM ✅
-   Lightweight ✅
-   Simple and easy to use ✅
-   Retry mechanism ✅

## Background

The scenario: when a customer checks out their cart, we need to create an order via the order microservice and a payment via the payment microservice. A checkout should only be successful if both are successful, and if either one is unsuccessful, then the checkout should fail: the order should not be created and the customer should not be charged.

A request can fail for many reasons: either the request provides invalid input (in which case we would want to rollback all changes `onError`) or the network fails (in which case we would want to `makeRetry` the request, the solution to the extreme case of retries failing being throwing our hands in the air and handling things manually).

The first case is simple enough to solve, if creating an order fails then we cannot create a payment because creating a payment requires an order to be linked to it, so we don't have the required parameters to perform the checkout. Neither order nor payment gets created.

The second case is a little trickier, what if we create an order but making a payment fails and the order has to be deleted? Do we handle this on the client, introduce a new endpoint to handle the coordination, or put the checkout event and order creation event in a queue to be consumed and fulfilled by consumers?

[Saga](https://microservices.io/patterns/data/saga.html)'s are an architectural pattern to ensure data consistency between microservices by either choreography (placing events in a queue) or orchestration (having a single handler to ensure both operations are successful and handling the data inconsistencies which may occur if either one fails - React web app or new endpoint).

This package targets orchestration and allows for Saga's to be implemented easily on the client (say a React web app or a new endpoint utilizing a [BFF](https://microservices.io/patterns/apigateway.html)) without tying the implementation to the database. It allows for easy composition with libraries such as [React Query](https://tanstack.com/query/v3/) (`transaction.resolve` can be used as the `queryFn`) and provides both CJS and ESM exports to cater for use on the backend or frontend.

There are a few ways to go about achieving distributed transactions using this package, such as:
1. two phase commits such as with [Postgres](https://www.postgresql.org/docs/current/two-phase.html#TWO-PHASE): we `PREPARE TRANSACTION` using the `queryFn` and `COMMIT PREPARED` `onSuccess` or `ROLLBACK PREPARED` `onError`.

2. optimistically create rows and have a flag field in the database and flip it `onSuccess`, undoing any operations on 3rd party services `onError`

3. optimistically create rows and delete records (and undo operations on 3rd party services) `onError`

## Usage

Transactions are committed at the end of the scope and rolled back if any query fails.

Simply `createTransaction` with your queries and execute them within `resolve` via `exec`:

```typescript
const transaction = createTransaction({
	order: {
		queryFn: orderService.createOrder,
		onSuccess: onSuccessCreateOrder,
		onError: onErrorCreateOrder,
	},
	payment: {
		queryFn: paymentService.createPayment,
		onSuccess: onSuccessCreatePayment,
		onError: onErrorCreatePayment,
	},
});

const { order, payment } = await transaction.resolve(async () => {
	const newOrder = await transaction.exec("order", {
		user: "1234",
		items: [],
	});

	const paymentReceipt = await transaction.exec("payment", { order });

	return { order: newOrder, payment: paymentReceipt };
});

// With support for `AsyncDisposable`

const checkout = async () => {
	await using transaction = createTransaction({
		order: {
			queryFn: orderService.createOrder,
			onSuccess: onSuccessCreateOrder,
			onError: onErrorCreateOrder,
		},
		payment: {
			queryFn: paymentService.createPayment,
			onSuccess: onSuccessCreatePayment,
			onError: onErrorCreatePayment,
		},
	});

	const newOrder = await transaction.exec("order", {
		user: "1234",
		items: [],
	});

	const paymentReceipt = await transaction.exec("payment", { order });

	return { order: newOrder, payment: paymentReceipt };
};

const { order, payment } = await checkout();

// And ability to retry a function with `makeRetry`
// Exponential backoff
const createPayment = makeRetry({
	retryFn: paymentService.createPayment,
});
```

More information in `src/txn/txn.spec.ts`.

## Contributions

-   Contributions are welcome, just make a pull request
