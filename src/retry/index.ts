import type { RetryParameters } from "./types";

export const makeRetry = <T extends (...args: any[]) => Promise<any>>({
	retryFn,
	retryTimes = 3,
	interval = 100,
	multiplier = 2,
}: RetryParameters<T>) => {
	const retry = async (
		count: number,
		...args: any[]
	): Promise<Awaited<ReturnType<typeof retryFn>>> => {
		try {
			return await retryFn(...args);
		} catch (error: any) {
			if (count >= retryTimes) throw error;

			await sleep(exponentialWaitFor(count, interval, multiplier));
			return await retry(count + 1, ...args);
		}
	};

	return (...args: Parameters<typeof retryFn>) => retry(0, ...args);
};

const exponentialWaitFor = (n: number, interval: number, multiplier: number) =>
	interval * Math.pow(multiplier, n);

const sleep = (ms?: number) => new Promise(resolve => setTimeout(resolve, ms));
