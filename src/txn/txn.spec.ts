import { describe, expect, it, vitest } from "vitest";
import { createTransaction } from ".";

describe("createTransaction", () => {
	describe("resolve", () => {
		it("returns the result of `resolve`", async () => {
			const TEST_OPTIONS = {
				queryFn: vitest.fn(),
				onSuccess: vitest.fn(),
				onError: vitest.fn(),
			};

			await using transaction = createTransaction({
				test: TEST_OPTIONS,
			});

			const result = await transaction.resolve(
				async () => "hello world!",
			);

			expect(result).toEqual("hello world!");
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

			const result = () =>
				transaction.resolve(async () => {
					await transaction.exec("test");
				});

			expect(result).rejects.toThrowError();
		});
	});

	describe("exec", () => {
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

			await transaction
				.resolve(async () => {
					await transaction.exec("hello", "world");
					await transaction.exec("world", "hello");
				})
				.catch(() => {});

			expect(HELLO_OPTIONS.onError).toBeCalledTimes(1);
			expect(WORLD_OPTIONS.onError).toBeCalledTimes(1);
			expect(HELLO_OPTIONS.onError).toBeCalledWith("world");
			expect(WORLD_OPTIONS.onError).toBeCalledWith("error!");
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

			await transaction
				.resolve(async () => {
					await transaction.exec("hello", "world");
					await transaction.exec("world", "hello");
				})
				.catch(() => {});
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
			await using transaction = createTransaction({
				hello: HELLO_OPTIONS,
				world: WORLD_OPTIONS,
			});

			await transaction.resolve(async () => {
				await transaction.exec("hello", "world");
				await transaction.exec("world", "hello");
			});
		}

		expect(HELLO_OPTIONS.queryFn).toBeCalledWith("world");
		expect(WORLD_OPTIONS.queryFn).toBeCalledWith("hello");
		expect(HELLO_OPTIONS.onSuccess).toBeCalledTimes(1);
		expect(WORLD_OPTIONS.onSuccess).toBeCalledTimes(1);
	});
});
