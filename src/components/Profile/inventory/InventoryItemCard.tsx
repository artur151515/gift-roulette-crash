import React from "react";
import { Badge } from "@/components/ui/badge";
import { InventoryItemDto } from "@/types/inventory.ts";
import { getStatusColor, getStatusLabel } from "./utils";

interface InventoryItemProps {
	item: InventoryItemDto;
	onItemClick: (item: InventoryItemDto) => void;
}

const InventoryItemCard: React.FC<InventoryItemProps> = ({ item, onItemClick }) => {
	return (
		<div
			className="relative bg-card/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors group overflow-hidden cursor-pointer"
			onClick={() => onItemClick(item)}
		>
			{/*{item.item.isRandomNFT && (*/}
			{/*	<div className="absolute top-2 right-[-40px] w-[120px] rotate-45 bg-purple-600 text-white text-[10px] font-bold py-1 text-center shadow-md">*/}
			{/*		NFT*/}
			{/*	</div>*/}
			{/*)}*/}

			<div className="flex items-center justify-center mb-2">
				<Badge
					variant="outline"
					className={`text-xs ${getStatusColor(item.status)}`}
				>
					{getStatusLabel(item.status)}
				</Badge>
			</div>

			{/*<div className="aspect-square rounded-lg bg-primary/10 flex items-center justify-center text-2xl mb-2">*/}
			<div className="aspect-square rounded-lg flex items-center justify-center text-2xl mb-2">
				{item.item.imageUrl ? (
					<img
						src={item.item.imageUrl}
						alt={item.item.name}
						className="w-full h-full object-cover rounded-lg"
					/>
				) : (
					"🎁"
				)}
			</div>

			<div className="text-center space-y-1">
				<p className="text-xs font-medium line-clamp-1 text-foreground mt-3 mb-2">
					{item.item.name}
				</p>
				<div className="flex items-center justify-center gap-1">
					<Badge variant="outline" className="text-xs">
						💎{item.item.price}
					</Badge>
				</div>
			</div>
		</div>
	);
};

export default InventoryItemCard;