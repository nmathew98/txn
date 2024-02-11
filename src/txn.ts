export interface CreateTransactionOptions {
	[prefix: string]: {
		onSuccess: (result: unknown) => Promise<void>;
		onError?: (error: unknown) => Promise<void>;
	};
}

export interface Transaction<T> extends AsyncDisposable {
	exec: ExecQuery;
	resolve: ResolveTransaction;
}

export interface ResolveTransaction {
	<T extends (...args: any[]) => Promise<Record<string, any>> | Promise<void>>(f: T): ReturnType<typeof f>
}

export interface ExecQuery<T = unknown> {
	(
		key: string,
		f: (...args: any[]) => Promise<T>,
	): (...args: Parameters<typeof f>) => ReturnType<typeof f>;
}

export const createTransaction = <T = unknown>(
	options: CreateTransactionOptions,
): Transaction<T> => {
	const executedQueries = new Map();

	const resolve: ResolveTransaction = (f) =>  f() as any;

	const exec: ExecQuery =
		(key: string, f) =>
		async (...args: any[]) => {
			try {
				const result = await f(args);

				executedQueries.set(key, result);

				return result;
			} catch (error: unknown) {
				return await reject(key, error as Error);
			}
		};

	const reject = async (key: string, error: Error) => {
		await options[key]?.onError?.(key);

		throw error;
	};

	const dispose = async () => {
		await Promise.all(
			[...executedQueries.entries()].map(([key, value]) => {
				options[key]?.onSuccess(value);
			}),
		);
	};

	return {
		resolve,
		exec,
		[Symbol.asyncDispose]: dispose,
	};
};

// const transaction = createTransaction({
// 	test: {
// 		onSuccess: () => Promise.resolve(),
// 	}
// });

// const { test } = await transaction.resolve(async () => {
// 	const test = await transaction.exec('test', async () => { return null; })();

// 	return { test };
// });

/**
 * ```typescript
 * const { resolve, exec } = createTransaction({
 * 	order: {
 * 		onSuccess: async (result: unknown) => {},
 * 		onError: async (error: unknown) => {
 * 		}
 * 	},
 * 	payment: {
 * 		onSuccess: async (result: unknown) => {},
 * 		onError: async (error: unknown) => {}
 * 	}
 * })
 *
 * const { order, payment } = await resolve(async () => {
 * 	const order = await exec('order', orderService.createOrder)(orderArgs);
 * 	const payment = await exec('payment', paymentService.createPayment)({ order, user });
 *
 * 	return { order, payment };
 * })
 * ```
 */
