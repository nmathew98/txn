![Tests](https://github.com/nmathew98/txn/actions/workflows/main.yml/badge.svg)

## About

Simple distributed transactions using a container.

Originally intended to be used with two phase commits (for example: [Postgres documentation](https://www.postgresql.org/docs/current/two-phase.html#TWO-PHASE)).

Requires support for [`AsyncDisposable`](https://github.com/tc39/proposal-explicit-resource-management).

## Features

-   CJS + ESM ✅
-   Lightweight ✅
-   Simple and easy to use ✅

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
```

More information in `src/txn/txn.spec.ts`.

## Contributions

-   Contributions are welcome, just make a pull request
