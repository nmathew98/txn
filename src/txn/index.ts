import type {
	CreateTransaction,
	AsyncDisposableHandler,
	ExecError,
	Exec,
	Resolve,
} from "./types";

(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");

export const createTransaction: CreateTransaction = options => {
	const executedQueries = new Map();

	const resolve: Resolve<typeof createTransaction> = async f => {
		const result = await f().finally(dispose);

		return result;
	};

	const exec: Exec<typeof options> = async (key, ...args) => {
		try {
			const result = await options[key]?.queryFn(...args);

			executedQueries.set(key, result);

			return result;
		} catch (error) {
			return await reject(key, error);
		}
	};

	const reject: ExecError<typeof options> = async (key, error) => {
		await Promise.all(
			[...executedQueries.entries()].map(([key, value]) =>
				options[key]?.onError(value),
			),
		);

		await options[key]?.onError(error);

		executedQueries.clear();

		throw error;
	};

	const dispose: AsyncDisposableHandler = async () => {
		const numberOfQueries = Object.keys(options).length;
		const numberOfResults = [...executedQueries.keys()].length;

		if (numberOfQueries !== numberOfResults) return;

		await Promise.all(
			[...executedQueries.entries()].map(([key, value]) =>
				options[key]?.onSuccess(value),
			),
		);

		executedQueries.clear();
	};

	return {
		resolve,
		exec,
		[Symbol.asyncDispose]: dispose,
	};
};
