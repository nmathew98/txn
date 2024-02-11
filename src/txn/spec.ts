import { describe, it } from "vitest";

describe("createTransaction", () => {
	it.todo("returns the result of `resolve`");
	it.todo("`resolve` throws if any query throws");
	it.todo("invokes `onError` for each query if any throws");
	it.todo("does not invoke `onSuccess` if any query has failed");
	it.todo("invokes `onSuccess` for each query at the end of the scope");
});
