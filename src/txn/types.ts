export type CreateTransaction = (
	options: CreateTransactionOptions,
) => Transaction;

export interface Transaction extends AsyncDisposable, TODO {
	// TODO
}

export interface CreateTransactionOptions {
	[prefix: string]: {
		queryFn: (...args: TODO) => Promise<TODO>;
		onSuccess: (result: unknown) => Promise<void>;
		onError: (error?: unknown) => Promise<void>;
	};
}

export type TODO = any;
