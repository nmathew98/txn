import type {
	TODO,
	CreateTransactionOptions,
	CreateTransaction,
} from "./types";

(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");

export const createTransaction: CreateTransaction = (
	options: CreateTransactionOptions,
) => {
	const executedQueries = new Map();

	const resolve: TODO = f => f();

	const exec: TODO = async (key, args) => {
		try {
			const result = await options[key]?.queryFn(args);

			executedQueries.set(key, result);

			return result;
		} catch (error) {
			return await reject(key, error);
		}
	};

	const reject: TODO = async (key, error) => {
		await Promise.all(
			[...executedQueries.keys()].map(key => options[key]?.onError()),
		);

		await options[key]?.onError(key);

		throw error;
	};

	const dispose = async (): Promise<void> => {
		const numberOfQueries = Object.keys(options).length;
		const numberOfResults = [...executedQueries.keys()].length;

		if (numberOfQueries !== numberOfResults) return;

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
