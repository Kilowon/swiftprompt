import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "~/registry/ui/tooltip"

export default function ModifiersContainerSearch(props: {
	isFullModifiers: boolean
	setIsFullModifiers: (value: boolean) => void
}) {
	return (
		<div class="flex my-4 w-full justify-end">
			<Tooltip
				openDelay={1000}
				closeDelay={0}
			>
				<TooltipTrigger
					as={Button}
					onClick={() => props.setIsFullModifiers(!props.isFullModifiers)}
					variant="ghost"
					size="icon"
					class="h-9 mr-4"
				>
					{props.isFullModifiers ? (
						<div class="i-mdi:view-list w-1.25em h-1.25em "></div>
					) : (
						<div class="i-mdi:view-grid-outline w-1.25em h-1.25em"></div>
					)}
				</TooltipTrigger>
				<TooltipContent>{props.isFullModifiers ? "Toggle List Modifiers" : "Toggle Grid Modifiers"}</TooltipContent>
			</Tooltip>
		</div>
	)
}
