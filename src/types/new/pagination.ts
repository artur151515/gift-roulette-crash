export interface PaginationQuery {
    page?: number; // Номер страницы (по умолчанию 1)
    limit?: number; // Кол-во элементов на страницу (по умолчанию 20)
}

export interface PaginationResponse {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
