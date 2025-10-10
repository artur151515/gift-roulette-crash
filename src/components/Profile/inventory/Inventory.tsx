import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useUserInventory,
	useClaimInventoryItem,
	useSellInventoryItem,
} from "@/hooks/useUserInventory";
import telegramService from "@/lib/telegram";
import InventoryItemCard from "./InventoryItemCard";
import ItemActionDialog from "./ItemActionDialog";
import { InventoryStatus, InventoryItemDto } from "@/types/inventory.ts";
import { getStatusLabel } from "./utils";

const Inventory: React.FC = () => {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<InventoryStatus | undefined>();
	const [selectedItem, setSelectedItem] = useState<InventoryItemDto | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const limit = 12;

	const { data, isLoading, error } = useUserInventory(page, limit, statusFilter);
	const claimMutation = useClaimInventoryItem();
	const sellMutation = useSellInventoryItem();

	const handleClaim = (id: string) => {
		telegramService.impactOccurred("light");
		claimMutation.mutate(id);
	};

	const handleSell = (id: string) => {
		telegramService.impactOccurred("light");
		sellMutation.mutate(id);
	};

	const handleItemClick = (item: InventoryItemDto) => {
		setSelectedItem(item);
		setIsDialogOpen(true);
	};

	const handleStatusFilter = (status: string) => {
		setStatusFilter(status === "all" ? undefined : (status as InventoryStatus));
		setPage(1);
	};

	if (error) {
		return (
			<Card className="card-elevated">
				<CardContent className="p-6 text-center">Ошибка загрузки данных</CardContent>
			</Card>
		);
	}

	const totalItems = data?.pagination?.total || 0;
	const totalPages = data?.pagination?.totalPages || 1;

	return (
		<Card className="card-elevated">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Инвентарь ({totalItems})</span>
					<Select value={statusFilter || "all"} onValueChange={handleStatusFilter}>
						<SelectTrigger className="w-32 h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Все</SelectItem>
							<SelectItem value="AVAILABLE">Доступны</SelectItem>
							<SelectItem value="RECEIVED">Получены</SelectItem>
							<SelectItem value="SOLD">Проданы</SelectItem>
							<SelectItem value="PENDING_FOR_RECEIVAL">Ожидают</SelectItem>
						</SelectContent>
					</Select>
				</CardTitle>
			</CardHeader>

			<CardContent className="p-6 pt-0">
				{isLoading ? (
					<div className="grid grid-cols-3 gap-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="aspect-square rounded-lg" />
						))}
					</div>
				) : data?.items?.length ? (
					<>
						<div className="grid grid-cols-2 gap-3 mb-4">
							{data.items.map((item) => (
								<InventoryItemCard
									key={item.id}
									item={item}
									onItemClick={handleItemClick}
								/>
							))}
						</div>

						{totalPages > 1 && (
							<div className="flex items-center justify-center gap-2 mt-4">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1 || isLoading}
								>
									Назад
								</Button>
								<span className="text-sm text-muted-foreground">
									{page} из {totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages || isLoading}
								>
									Вперёд
								</Button>
							</div>
						)}
					</>
				) : (
					<div className="text-center py-8 space-y-3">
						<div className="text-4xl mb-4">📦</div>
						<h3 className="font-semibold text-foreground">Инвентарь пуст</h3>
						<p className="text-muted-foreground text-sm">
							{statusFilter
								? `Нет предметов со статусом "${getStatusLabel(statusFilter)}"`
								: "Откройте кейсы, чтобы получить предметы!"}
						</p>
					</div>
				)}
			</CardContent>

			<ItemActionDialog
				item={selectedItem}
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				onClaim={handleClaim}
				onSell={handleSell}
				isClaiming={claimMutation.isPending}
				isSelling={sellMutation.isPending}
			/>
		</Card>
	);
};

export default Inventory;