// import {InventoryItem} from "@/types/new/inventory.ts";
import {PaginationResponse} from "@/types/new/pagination.ts";

export interface Item {
    id: string;              // UUID
    name: string;
    imageUrl: string | null; // URL картинки
    price: number;           // Стоимость в "звёздах"
    giftId: string | null;   // Telegram gift ID (для получения)
    isNft: boolean;          // Является ли это NFT
}

export interface CaseItem extends Item {
    rarity: 'common' | 'rare' | 'epic' | 'legendary'; // Редкость предмета
    probability: number; // Шанс выпадения (%)
}

export interface CaseSummary {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    createdAt: string; // ISO дата
    updatedAt: string; // ISO дата
}

export interface Case extends CaseSummary {
    items: CaseItem[]; // Какие предметы могут выпасть
}

export interface OpenCaseParams {
    id: string; // UUID кейса
}

export interface CaseInfo {
    id: string;
    name: string;
    price: number;
}

export interface RollDetails {
    probability: number; // вероятность выпадения
    weight: number;      // "вес" в расчётах
}

export interface OpenCaseResponse {
    case: CaseInfo;           // Инфо о кейсе
    // wonItem: InventoryItem;   // Предмет, который выпал (и сразу добавлен в инвентарь)
    roll: RollDetails;        // Детали расчёта
}


// export type CaseSummary = {
//     id: string;
//     name: string;
//     description: string | null;
//     imageUrl: string | null;
//     price: number;
//     createdAt: string;
//     updatedAt: string;
//     rtpRequested: number;
//     rtpAchieved: number;
// };

export interface CreateCaseDto {
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    rtp: number;
    itemIds: string[];
}

// export type CaseDetails = {
//     id: string;
//     name: string;
//     description: string | null;
//     imageUrl: string | null;
//     price: number;
//     createdAt: string;
//     updatedAt: string;
//     items: Array<{
//         itemId: string;
//         name: string;
//         weight: number;
//         probability: number;
//     }>;
//     totalWeight: number;
//     itemCount: number;
// };

export interface CasesResponse {
    cases: CaseSummary[];
    pagination: PaginationResponse;
}