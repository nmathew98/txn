export interface RetryParameters<T> {
	retryFn: T;
	retryTimes?: number;
	interval?: number;
	multiplier?: number;
}
