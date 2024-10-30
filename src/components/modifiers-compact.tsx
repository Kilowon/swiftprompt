import { createEffect, Show, createSignal, For } from "solid-js"
import { toast } from "solid-sonner"
import { cn } from "~/lib/utils"
import {
	selectedItem,
	setSelectedItem,
	isEditingItem,
	setIsEditingItem,
	entityGroups,
	selectedTemplateGroup,
	selectedSection,
	selectedSectionItem,
	setSelectedSectionItemEl,
	setSelected,
	selectedSectionItemEl,
	selectedTemplateVersion
} from "~/global_state"
import { pinToggleItem } from "~/helpers/actionHelpers"
import { Modifier, ModifierGroupID, ModifierID } from "~/types/entityType"
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuPortal
} from "~/registry/ui/dropdown-menu"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "~/registry/ui/tooltip"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/registry/ui/select"
import { addItemToTemplateSection } from "~/helpers/actionHelpers"

interface ModifiersCompactProps {
	item: Modifier
	handleEditing: (item: Modifier, label: "title" | "summary" | "body", status: "editing" | "saved", id: string) => void
	handleUpdateAttributes: (
		item: Modifier,
		name: string,
		summary: string,
		body: string,
		modifierGroupId: ModifierGroupID
	) => void
	handleDeleteItem: (groupId: ModifierGroupID, itemId: ModifierID) => void
	handleDuplicateItem: (item: Modifier) => void
	handleMoveItem: (item: Modifier, groupId: ModifierGroupID) => void
	labelLimit: () => number
	items: Modifier[]
	sizes: number[]
	setIsFullModifiers: (value: boolean) => void
}

export default function ModifiersCompact(props: ModifiersCompactProps) {
	const [isPinned, setIsPinned] = createSignal(false)
	let el: HTMLButtonElement | undefined

	createEffect(() => {
		if (selectedSectionItem() === props.item.id) {
			setSelectedSectionItemEl(el)
		}
	})

	const groupOptions = Array.from(entityGroups.values())
		.filter((group: any) => group.id !== props.item.modifierGroupId)
		.map((group: any) => ({
			value: group.id,
			label: group.name
		}))

	const handleAddToTemplate = () => {
		addItemToTemplateSection(
			selectedTemplateGroup()!,
			selectedSection()!,
			props.item.id,
			props.item.modifierGroupId,
			selectedTemplateVersion()!
		)
	}

	const [isDebouncing, setIsDebouncing] = createSignal(false)
	const handleDebounce = () => {
		if (!isDebouncing()) {
			setIsDebouncing(true)
			handleAddToTemplate()
			setTimeout(() => {
				setIsDebouncing(false)
			}, 1000)
		}
	}

	const handleOpenItem = (itemId: ModifierID, groupId: ModifierGroupID) => {
		setSelected(groupId)
		setSelectedItem(itemId)
		props.setIsFullModifiers(true)
		selectedSectionItemEl()?.focus()
		setIsEditingItem({ status: "editing", id: itemId, label: "all" })
	}

	const placeholdersTest = ["color_fire", "hair_bever", "color", "hair", "color", "hair"]

	return (
		<div>
			<Button
				ref={el}
				variant="no_format"
				size="no_format"
				class={cn(
					"flex relative  gap-2 rounded-md border border-border p-0.5 text-left text-sm transition-all hover:bg-muted/50 cursor-default max-h-10 min-h-10",
					selectedItem() === props.item.id && "bg-muted/50 ring-1 border-accent ring-accent  transition-none"
				)}
				onClick={() => setSelectedItem(props.item.id)}
			>
				<div class="flex w-full flex-col gap-2 p-0.5">
					<div class="flex flex-col items-start justify-between w-full relative">
						{/* Title Prompts */}
						<div class="flex items-center gap-2 pr-10 group flex-grow">
							<div class="flex items-center gap-10">
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
							<Show when={selectedItem() === props.item.id}>
								<Tooltip
									openDelay={1000}
									closeDelay={0}
								>
									<TooltipTrigger
										as={Button}
										onClick={() => {
											handleOpenItem(props.item.id, props.item.modifierGroupId)
										}}
										variant="ghost"
										size="icon"
										class=" text-accent hover:text-accent-foreground max-h-8"
									>
										<div class="i-mdi:file-edit w-4 h-4" />
										<span class="sr-only">Edit Modifier</span>
									</TooltipTrigger>
									<TooltipContent>Edit Modifier</TooltipContent>
								</Tooltip>
							</Show>
							<Show when={selectedItem() === props.item.id}>
								<Tooltip
									openDelay={1000}
									closeDelay={0}
								>
									<TooltipTrigger
										as={Button}
										variant="ghost"
										size="icon"
										class="text-accent hover:text-accent-foreground max-h-8"
										onClick={() => {
											handleDebounce()
										}}
									>
										<div class="i-mdi:file-document-arrow-right w-1.25em h-1.25em"></div>
										<span class="sr-only">Add to Template</span>
									</TooltipTrigger>
									<TooltipContent>Add to Template</TooltipContent>
								</Tooltip>
							</Show>
							<Show when={selectedItem() === props.item.id}>
								<div>
									<DropdownMenu placement="bottom-end">
										<DropdownMenuTrigger
											as={Button}
											variant="ghost"
											size="icon"
											class="text-accent hover:text-accent-foreground max-h-8"
										>
											<div class="i-mdi:dots-vertical w-1.25em h-1.25em"></div>
											<span class="sr-only">More</span>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuItem onSelect={() => props.handleDeleteItem(props.item.modifierGroupId, props.item.id)}>
												<div class="i-octicon:repo-deleted-16 w-1.25em h-1.25em mr-2"></div> Delete Modifier
											</DropdownMenuItem>
										</DropdownMenuContent>
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
