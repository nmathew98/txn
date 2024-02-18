export type CreateTransaction = <T extends CreateTransactionOptions>(
	options: T,
) => Transaction<T>;

export interface Transaction<T extends CreateTransactionOptions>
	extends AsyncDisposable {
	resolve: <T>(f: () => Promise<T>) => Promise<T>;
	exec: <
		K extends keyof T,
		F extends (...args: any[]) => any = T[K]["queryFn"],
	>(
		key: K,
		...args: Parameters<F>
	) => ReturnType<F>;
}

export interface QueryOptions<
	F extends (...args: any[]) => Promise<any> = (
		...args: any[]
	) => Promise<any>,
> {
	queryFn: F;
	onSuccess?: (result: unknown) => Promise<void>;
	onError?: (error: unknown) => Promise<void>;
}

export type CreateTransactionOptions = Record<
	string | number | symbol,
	QueryOptions
>;

export type Resolve<T extends CreateTransaction> = Pick<
	ReturnType<T>,
	"resolve"
>["resolve"];

export type Exec<
	T extends CreateTransactionOptions,
	K extends keyof T = keyof T,
> = (key: K, ...args: Parameters<T[K]["queryFn"]>) => any;

export type ExecError<
	T extends CreateTransactionOptions,
	K extends keyof T = keyof T,
> = (key: K, error?: unknown) => Promise<void>;

export type AsyncDisposableHandler = Pick<
	AsyncDisposable,
	typeof Symbol.asyncDispose
>[typeof Symbol.asyncDispose];
