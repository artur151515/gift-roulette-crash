import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Gift, Package, Clock, CheckCircle } from "lucide-react";
import { InventoryItemDto } from "@/types/inventory.ts";
import { getStatusColor, getStatusLabel } from "./utils";

interface ItemActionDialogProps {
	item: InventoryItemDto | null;
	isOpen: boolean;
	onClose: () => void;
	onClaim: (id: string) => void;
	onSell: (id: string) => void;
	isClaiming: boolean;
	isSelling: boolean;
}

const ItemActionDialog: React.FC<ItemActionDialogProps> = ({
															   item,
															   isOpen,
															   onClose,
															   onClaim,
															   onSell,
															   isClaiming,
															   isSelling,
														   }) => {
	if (!item) return null;

	const canClaim = item.status === "AVAILABLE";
	const canSell = item.status === "AVAILABLE" || item.status === "RECEIVED";

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-sm rounded-2xl p-6">
				<DialogHeader className="space-y-1 text-center">
					<DialogTitle className="text-lg font-semibold flex items-center justify-center gap-2">
						{item.item.isRandomNFT && <Package className="h-5 text-purple-600" />}
						{item.item.giftId && <Gift className="h-5 text-green-600" />}
						{item.item.name}
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						{item.item.isRandomNFT
							? "Этот NFT будет вручную отправлен администратором после получения."
							: item.item.giftId
								? "Этот подарок будет автоматически отправлен через Telegram."
								: "Обычный предмет будет добавлен в ваш инвентарь."}
					</DialogDescription>
				</DialogHeader>

				<div className="flex justify-center py-4">
					<div className="w-28 h-28 rounded-xl overflow-hidden bg-muted flex items-center justify-center shadow-inner">
						{item.item.imageUrl ? (
							<img
								src={item.item.imageUrl}
								alt={item.item.name}
								className="w-full h-full object-cover"
							/>
						) : (
							<span className="text-4xl">🎁</span>
						)}
					</div>
				</div>

				<div className="space-y-2 text-sm border-t border-border pt-3">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Статус:</span>
						<Badge variant="outline" className={getStatusColor(item.status)}>
							{getStatusLabel(item.status)}
						</Badge>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Цена продажи:</span>
						<span className="font-medium">💎 {item.item.price}</span>
					</div>
				</div>

				{(canClaim || canSell) && (
					<DialogFooter className="flex gap-2">
						{canClaim && (
							<Button
								onClick={() => {
									onClaim(item.id);
									onClose();
								}}
								disabled={isClaiming}
								className="flex-1"
							>
								{isClaiming ? "Получение..." : "Получить"}
							</Button>
						)}
						{canSell && (
							<Button
								variant="outline"
								onClick={() => {
									onSell(item.id);
									onClose();
								}}
								disabled={isSelling}
								className="flex-1"
							>
								{isSelling ? "Продажа..." : `Продать за 💎 ${item.item.price}`}
							</Button>
						)}
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default ItemActionDialog;