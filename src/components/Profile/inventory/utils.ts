import { InventoryStatus } from "@/types/new/inventory";

export const getStatusColor = (status: InventoryStatus) => {
	switch (status) {
		case "AVAILABLE":
			return "bg-green-500/20 text-green-600 border-green-500/30";
		case "RECEIVED":
			return "bg-blue-500/20 text-blue-600 border-blue-500/30";
		case "SOLD":
			return "bg-gray-500/20 text-gray-600 border-gray-500/30";
		case "PENDING_FOR_RECEIVAL":
			return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
		default:
			return "bg-gray-500/20 text-gray-600 border-gray-500/30";
	}
};

export const getStatusLabel = (status: InventoryStatus) => {
	switch (status) {
		case "AVAILABLE":
			return "Доступен";
		case "RECEIVED":
			return "Получен";
		case "SOLD":
			return "Продан";
		case "PENDING_FOR_RECEIVAL":
			return "Ожидает";
		default:
			return status;
	}
};