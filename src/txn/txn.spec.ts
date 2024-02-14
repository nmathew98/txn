import { describe, expect, it, vitest } from "vitest";
import { createTransaction } from ".";

describe("createTransaction", () => {
	describe("`resolve`", () => {
		it("returns the result of `resolve`", async () => {
			const TEST_OPTIONS = {
				queryFn: vitest.fn(),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			await using transaction = createTransaction({
				test: TEST_OPTIONS,
			});

			const result = transaction.resolve(async () => "hello world!");

			expect(result).resolves.toEqual("hello world!");
		});

		it("`resolve` throws if any query throws", async () => {
			const TEST_OPTIONS = {
				queryFn: vitest.fn().mockImplementation(() => {
					throw "error!";
				}),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			await using transaction = createTransaction({
				test: TEST_OPTIONS,
			});

			expect(
				transaction.resolve(async () => {
					await transaction.exec("test");
				}),
			).rejects.toThrowError();
		});

		it("invokes `onSuccess` at the end of the scope with `using`", async () => {
			const HELLO_OPTIONS = {
				queryFn: vitest.fn(),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			const WORLD_OPTIONS = {
				queryFn: vitest.fn(),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			{
				await using transaction = createTransaction({
					hello: HELLO_OPTIONS,
					world: WORLD_OPTIONS,
				});

				await transaction.exec("hello", "world");
				await transaction.exec("world", "hello");
			}

			expect(HELLO_OPTIONS.queryFn).toBeCalledWith("world");
			expect(WORLD_OPTIONS.queryFn).toBeCalledWith("hello");
			expect(HELLO_OPTIONS.onSuccess).toBeCalledTimes(1);
			expect(WORLD_OPTIONS.onSuccess).toBeCalledTimes(1);
		});

		it("does not invoke `onSuccess` more than once with `using` and `resolve`", async () => {
			const HELLO_OPTIONS = {
				queryFn: vitest.fn(),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			const WORLD_OPTIONS = {
				queryFn: vitest.fn(),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			{
				await using transaction = createTransaction({
					hello: HELLO_OPTIONS,
					world: WORLD_OPTIONS,
				});

				await expect(
					transaction.resolve(async () => {
						await transaction.exec("hello", "world");
						await transaction.exec("world", "hello");
					}),
				).resolves.not.toThrowError();
			}

			expect(HELLO_OPTIONS.queryFn).toBeCalledWith("world");
			expect(WORLD_OPTIONS.queryFn).toBeCalledWith("hello");
			expect(HELLO_OPTIONS.onSuccess).toBeCalledTimes(1);
			expect(WORLD_OPTIONS.onSuccess).toBeCalledTimes(1);
		});
	});

	describe("`exec`", () => {
		it("invokes `onError` for each executed query if any throws", async () => {
			const HELLO_OPTIONS = {
				queryFn: vitest.fn().mockImplementation((arg: string) => arg),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			const WORLD_OPTIONS = {
				queryFn: vitest.fn().mockImplementation(() => {
					throw "error!";
				}),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			await using transaction = createTransaction({
				hello: HELLO_OPTIONS,
				world: WORLD_OPTIONS,
			});

			await expect(
				transaction.resolve(async () => {
					await transaction.exec("hello", "world");
					await transaction.exec("world", "hello");
				}),
			).rejects.toThrowError();

			expect(HELLO_OPTIONS.onError).toBeCalledTimes(1);
			expect(WORLD_OPTIONS.onError).toBeCalledTimes(1);
			expect(HELLO_OPTIONS.onError).toBeCalledWith("world");
			expect(WORLD_OPTIONS.onError).toBeCalledWith("error!");
		});
	});

	describe("atomicity", () => {
		it("if any `onError` rejects, the rest are still invoked", async () => {
			const HELLO_OPTIONS = {
				queryFn: vitest.fn(),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			const WORLD_OPTIONS = {
				queryFn: vitest.fn().mockImplementation(() => {
					throw new Error();
				}),
				onSuccess: vitest.fn(),
				onError: vitest.fn().mockImplementation(() => {
					throw new Error();
				}),
			};

			await using transaction = createTransaction({
				hello: HELLO_OPTIONS,
				world: WORLD_OPTIONS,
			});

			await expect(
				transaction.exec("hello", "world"),
			).resolves.not.toThrowError();
			await expect(
				transaction.exec("world", "hello"),
			).rejects.toThrowError();

			expect(HELLO_OPTIONS.onError).toBeCalledTimes(1);
			expect(WORLD_OPTIONS.onError).toBeCalledTimes(1);
		});

		it("if any `onSuccess` rejects, the rest are still invoked", async () => {
			const HELLO_OPTIONS = {
				queryFn: vitest.fn(),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			const WORLD_OPTIONS = {
				queryFn: vitest.fn(),
				onSuccess: vitest.fn(),
				onError: vitest.fn().mockImplementation(() => {
					throw new Error();
				}),
			};

			const transaction = createTransaction({
				hello: HELLO_OPTIONS,
				world: WORLD_OPTIONS,
			});

			await expect(
				transaction.resolve(async () => {
					await transaction.exec("hello", "world");
					await transaction.exec("world", "hello");
				}),
			).resolves.not.toThrowError();

			expect(HELLO_OPTIONS.onSuccess).toBeCalledTimes(1);
			expect(WORLD_OPTIONS.onSuccess).toBeCalledTimes(1);
		});
	});

	it("does not invoke `onSuccess` if any query has failed", async () => {
		const HELLO_OPTIONS = {
			queryFn: vitest.fn(),
			onSuccess: vitest.fn(),
			onError: vitest.fn(),
		};

		const WORLD_OPTIONS = {
			queryFn: vitest.fn().mockImplementation(() => {
				throw "error!";
			}),
			onSuccess: vitest.fn(),
			onError: vitest.fn(),
		};

		{
			await using transaction = createTransaction({
				hello: HELLO_OPTIONS,
				world: WORLD_OPTIONS,
			});

			await expect(
				transaction.resolve(async () => {
					await transaction.exec("hello", "world");
					await transaction.exec("world", "hello");
				}),
			).rejects.toThrowError();
		}

		expect(HELLO_OPTIONS.queryFn).toBeCalledWith("world");
		expect(WORLD_OPTIONS.queryFn).toBeCalledWith("hello");
		expect(HELLO_OPTIONS.onSuccess).not.toBeCalled();
		expect(WORLD_OPTIONS.onSuccess).not.toBeCalled();
	});

	it("invokes `onSuccess` for each query", async () => {
		const HELLO_OPTIONS = {
			queryFn: vitest.fn(),
			onSuccess: vitest.fn(),
			onError: vitest.fn(),
		};

		const WORLD_OPTIONS = {
			queryFn: vitest.fn(),
			onSuccess: vitest.fn(),
			onError: vitest.fn(),
		};

		{
			const transaction = createTransaction({
				hello: HELLO_OPTIONS,
				world: WORLD_OPTIONS,
			});

			await expect(
				transaction.resolve(async () => {
					await transaction.exec("hello", "world");
					await transaction.exec("world", "hello");
				}),
			).resolves.not.toThrowError();
		}

		expect(HELLO_OPTIONS.queryFn).toBeCalledWith("world");
		expect(WORLD_OPTIONS.queryFn).toBeCalledWith("hello");
		expect(HELLO_OPTIONS.onSuccess).toBeCalledTimes(1);
		expect(WORLD_OPTIONS.onSuccess).toBeCalledTimes(1);
	});
});
