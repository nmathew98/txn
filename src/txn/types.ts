export type CreateTransaction = (
	options: CreateTransactionOptions,
) => Transaction<typeof options>;

export interface Transaction<T extends CreateTransactionOptions>
	extends AsyncDisposable {
	resolve: <T>(f: () => Promise<T>) => Promise<T>;
	exec: (
		key: keyof T,
		...args: Parameters<T[keyof T]["queryFn"]>
	) => ReturnType<T[keyof T]["queryFn"]>;
}

export interface QueryOptions {
	queryFn: <T, U>(...args: T[]) => Promise<U>;
	onSuccess: <T>(result: T) => Promise<void>;
	onError: <T>(error?: T) => Promise<void>;
}

export type CreateTransactionOptions = Record<string, QueryOptions>;

export type Resolve<T extends CreateTransaction> = Pick<
	ReturnType<T>,
	"resolve"
>["resolve"];

export type Exec<T extends CreateTransaction> = Pick<
	ReturnType<T>,
	"exec"
>["exec"];

export type ExecError<T extends CreateTransaction> = (
	key: Parameters<Pick<ReturnType<T>, "exec">["exec"]>[0],
	error?: unknown,
) => Promise<void>;

export type AsyncDisposableHandler = Pick<
	AsyncDisposable,
	typeof Symbol.asyncDispose
>[typeof Symbol.asyncDispose];
