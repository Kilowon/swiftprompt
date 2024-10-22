import { Accessor } from "solid-js"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { Button } from "~/registry/ui/button"
import { SelectSearch } from "~/components/select-search"

interface GroupContainerSearchProps {
	setIsFullElements: (value: boolean) => void
	isFullElements: Accessor<boolean>
}

function GroupContainerSearch(props: GroupContainerSearchProps) {
	return (
		<div class="p-4">
			<div class="flex items-start justify-between">
				<SelectSearch />

				<div class="flex items-center gap-2">
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							onClick={() => props.setIsFullElements(!props.isFullElements())}
							variant="ghost"
							size="icon"
							class="h-9 ml-1"
						>
							{props.isFullElements() ? (
								<div class="i-mdi:view-list w-1.25em h-1.25em "></div>
							) : (
								<div class="i-mdi:view-grid-outline w-1.25em h-1.25em"></div>
							)}
						</TooltipTrigger>
						<TooltipContent>{props.isFullElements() ? "Toggle List Elements" : "Toggle Grid Elements"}</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</div>
	)
}

export default GroupContainerSearch
