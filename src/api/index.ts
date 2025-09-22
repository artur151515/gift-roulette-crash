export type TelegramUser = {
    id: number;
    first_name: string;
    last_name?: string;
    username: string;
    language_code: string;
    allows_write_to_pm: boolean;
    photo_url: string;
};

export type TelegramLoginResponse = {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
    }
};

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

export type CaseSummary = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    createdAt: string;
    updatedAt: string;
    rtpRequested: number;
    rtpAchieved: number;
};

export type CaseDetails = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    createdAt: string;
    updatedAt: string;
    items: Array<{
        itemId: string;
        name: string;
        weight: number;
        probability: number;
    }>;
    totalWeight: number;
    itemCount: number;
};

const BASE_URL = "https://turkeywrind.cloudpub.ru";

async function handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    let data: any;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }

    if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`);
    }

    return data;
}

// ---------------------- AUTH ----------------------

export const loginWithTelegram = async (
    initData: string
): Promise<TelegramLoginResponse> => {
    const res = await fetch(`${BASE_URL}/auth/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
    });
    return handleResponse<TelegramLoginResponse>(res);
};

export const refreshToken = async (
    refreshToken: string
): Promise<TelegramLoginResponse> => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<TelegramLoginResponse>(res);
};

export const getCurrentUser = async (
    accessToken: string
): Promise<TelegramUser> => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse<TelegramUser>(res);
};

// ---------------------- DEPOSITS ----------------------

export const createInvoice = async (
    amount: number,
    accessToken: string
): Promise<CreateInvoiceResponse> => {
    const res = await fetch(`${BASE_URL}/deposits/create-invoice`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ amount }),
    });
    return handleResponse<CreateInvoiceResponse>(res);
};

export const getDepositStatus = async (
    id: string,
    accessToken: string
): Promise<DepositStatus> => {
    const res = await fetch(`${BASE_URL}/deposits/${id}/status`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse<DepositStatus>(res);
};

// ---------------------- CASES ----------------------

export const getCases = async (
    accessToken: string,
    page?: number,
    limit?: number
): Promise<CaseSummary[]> => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const res = await fetch(`${BASE_URL}/api/cases?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse<CaseSummary[]>(res);
};

export const getCaseDetails = async (
    id: string,
    accessToken: string
): Promise<CaseDetails> => {
    const res = await fetch(`${BASE_URL}/api/cases/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse<CaseDetails>(res);
};

export const openCase = async (id: string, accessToken: string) => {
    const res = await fetch(`${BASE_URL}/api/cases/${id}/open`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse(res);
};

// ---------------------- USER INVENTORY ----------------------

export const getUserInventory = async (
    accessToken: string,
    page?: number,
    limit?: number,
    status?: string
) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (status) params.append("status", status);

    const res = await fetch(`${BASE_URL}/api/user-inventory?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse(res);
};

export const claimInventoryItem = async (id: string, accessToken: string) => {
    const res = await fetch(`${BASE_URL}/api/user-inventory/${id}/claim`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse(res);
};

export const sellInventoryItem = async (id: string, accessToken: string) => {
    const res = await fetch(`${BASE_URL}/api/user-inventory/${id}/sell`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse(res);
};
