import { describe, it, expect, vitest } from "vitest";
import { makeRetry } from ".";

describe("makeRetry", () => {
	it("retries if the function throws", async () => {
		const retryFn = vitest.fn().mockImplementation(() => {
			throw new Error();
		});

		const retry = makeRetry({
			retryFn,
			retryTimes: 1,
		});

		await expect(retry).rejects.toThrowError();
		expect(retryFn).toBeCalledTimes(2);
	});

	it("forwards arguments correctly", async () => {
		const retryFn = vitest.fn();

		const retry = makeRetry({
			retryFn,
			retryTimes: 1,
		});

		await expect(retry("hello", "world")).resolves.not.toThrowError();
		expect(retryFn).toBeCalledWith("hello", "world");
	});
});
