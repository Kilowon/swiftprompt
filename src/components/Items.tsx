import { Show, createSignal } from "solid-js"
import { cn } from "~/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "~/registry/ui/dropdown-menu"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "~/registry/ui/tooltip"

export function Items(props: any) {
	const [mouseOver, setMouseOver] = createSignal(false)
	return (
		<div>
			<Button
				variant="no_format"
				size="no_format"
				class={cn(
					"flex relative  gap-2 rounded-md border border-border p-3 text-left text-sm transition-all hover:bg-muted/50 cursor-default"
				)}
				onMouseEnter={() => setMouseOver(true)}
				onMouseLeave={() => setMouseOver(false)}
			>
				<Show when={true}>
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant="ghost"
							size="icon"
							class="absolute bottom-1 right-2 text-accent hover:text-accent-foreground"
						>
							<div class="i-mdi:file-document-arrow-right w-1.25em h-1.25em"></div>
							<span class="sr-only">Add to Template</span>
						</TooltipTrigger>
						<TooltipContent>Add to Template</TooltipContent>
					</Tooltip>
				</Show>
				<div class="flex w-full flex-col gap-2 p-0.5">
					<div class="flex flex-col items-start justify-between w-full relative">
						{/* Title Prompts */}
						<div class="flex items-center gap-2 pr-10 group flex-grow mb-2">
							<div>Title Here</div>
						</div>
					</div>
					{/* Summary Prompts */}
					<div class="items-center gap-2 pr-10">
						<div>Summary Here</div>
					</div>

					{/* Body Prompts */}
					<div>Body Here</div>
					{/* Badges */}
					<div class="min-h-5.5">
						<div>Badges Here</div>
					</div>
				</div>
				{/* Help Indicators and Edit Buttons */}
				<div class="absolute top-1 right-2">
					<div class="flex gap-1 items-center">
						<Show when={true}>
							<Button
								variant="ghost"
								size="icon"
								class="group"
							>
								<div class="i-material-symbols-light:push-pin text-foreground/80 w-4 h-4 group-hover:text-accent-foreground"></div>
							</Button>
						</Show>
						<div class="flex items-center gap-2 min-w-23 min-h-10">
							<Show when={true}>
								<div>
									<DropdownMenu placement="bottom-end">
										<DropdownMenuTrigger
											as={Button}
											variant="ghost"
											size="icon"
											class="text-accent hover:text-accent-foreground"
										>
											<div class="i-mdi:dots-vertical w-1.25em h-1.25em"></div>
											<span class="sr-only">More Options</span>
										</DropdownMenuTrigger>
										<DropdownMenuContent></DropdownMenuContent>
									</DropdownMenu>
								</div>
							</Show>
						</div>
					</div>
				</div>
			</Button>
		</div>
	)
}
