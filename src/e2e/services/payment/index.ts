import type { Expense, Receipt } from "./types";

export const createPaymentService = () => {
	const database = new Map();

	const putPayment = async (
		expense: Expense,
		throws?: boolean,
	): Promise<void> => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		const EXPENSE_KEY = `expense.${expense.order}`;
		const RECEIPT_KEY = `receipt.${expense.order}`;

		if (database.has(EXPENSE_KEY)) return;

		database.set(EXPENSE_KEY, expense);

		const receipt: Receipt = {
			uuid: database.size,
			order: expense.order,
			status: "paid",
		};

		database.set(RECEIPT_KEY, receipt);
	};

	const putRefund = async (
		order: number,
		throws?: boolean,
	): Promise<void> => {
		if (throws) {
			throw new Error("AHHH!!!");
		}

		const KEY = `receipt.${order}`;

		if (!database.has(KEY)) {
			throw new Error(`Order ${order} has not been charged yet`);
		}

		const existingReceipt = database.get(KEY);

		if (existingReceipt.status === "refunded") {
			return;
		}

		const refundedReceipt: Receipt = {
			...existingReceipt,
			status: "refunded",
		};

		database.set(KEY, refundedReceipt);
	};

	return {
		putPayment,
		putRefund,
	};
};
