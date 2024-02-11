export type CreateTransaction = (
	options: CreateTransactionOptions,
) => Transaction;

export interface Transaction extends AsyncDisposable, TODO {
	// TODO
}

export interface CreateTransactionOptions {
	[prefix: string]: {
		onSuccess: (result: unknown) => Promise<void>;
		onError: (error?: unknown) => Promise<void>;
	};
}

export type TODO = any;
