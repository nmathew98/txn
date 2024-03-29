export interface Expense {
	order: number;
	user: number;
	amount: number;
}

export interface Receipt {
	uuid: number;
	order: number;
	status: string;
}
