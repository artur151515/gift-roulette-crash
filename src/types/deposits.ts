export type DepositStatus = {
    id: string;
    amount: number;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "EXPIRED";
    createdAt: string;
    expiresAt: string | null;
    transactionId: string | null;
    invoiceUrl: string | null;
};

export type CreateInvoiceResponse = {
    depositId: string;
    invoiceUrl: string;
    amount: number;
    expiresAt: string;
};