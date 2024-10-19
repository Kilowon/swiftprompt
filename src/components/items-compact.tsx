import { PromptItem } from "~/types/entityType"
import { Button } from "~/registry/ui/button"
import { cn } from "~/lib/utils"

interface ItemsCompactProps {
	item: PromptItem
}

function ItemsCompact(props: ItemsCompactProps) {
	return (
		<div>
			<Button
				variant="no_format"
				size="no_format"
				class={cn(
					"flex relative  gap-2 rounded-md border border-border p-0.5 text-left text-sm transition-all hover:bg-muted/50 cursor-default max-h-10 min-h-10"
				)}
			>
				<div class="flex w-full flex-col gap-2 p-0.5">
					<div class="flex flex-col items-start justify-between w-full relative">
						{/* Title Prompts */}
						<div class="flex items-center gap-2 pr-10 group flex-grow">
							<div class="flex items-center gap-2">
								<div
									class={cn(
										"text-[0.6rem] font-semibold text-foreground/80 pl-3",
										!props.item?.name ? "text-foreground/80" : ""
									)}
								>
									{props.item?.name || "Add Title"}
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* Help Indicators and Edit Buttons */}
				<div class="">
					<div class="flex gap-1 items-center">
						<div class="flex items-center gap-2 min-w-23 min-h-10">
							<div>Buttons</div>
						</div>
					</div>
				</div>
			</Button>
		</div>
	)
}

export default ItemsCompact
