import { createEffect, Show, createSignal, For, createMemo } from "solid-js"
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
import { PromptItem, GroupID, ElementID, VersionID } from "~/types/entityType"
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

interface ElementsCompactProps {
	item: PromptItem
	handleEditing: (item: PromptItem, label: "title" | "summary" | "body", status: "editing" | "saved", id: string) => void
	handleUpdateAttributes: (
		item: PromptItem,
		name: string,
		summary: string,
		body: string,
		version: VersionID,
		versionCounter: VersionID,
		updatedBody: boolean
	) => void
	handleDeleteItem: (groupId: GroupID, itemId: ElementID) => void
	handleDuplicateItem: (item: PromptItem) => void
	handleMoveItem: (item: PromptItem, groupId: GroupID) => void
	labelLimit: () => number
	items: PromptItem[]
	sizes: number[]
	setIsFullElements: (value: boolean) => void
}

function ElementsCompact(props: ElementsCompactProps) {
	const [isPinned, setIsPinned] = createSignal(false)
	let el: HTMLButtonElement | undefined

	createEffect(() => {
		if (selectedSectionItem() === props.item.id) {
			setSelectedSectionItemEl(el)
		}
	})

	const groupOptions = Array.from(entityGroups.values())
		.filter((group: any) => group.id !== props.item.group)
		.map((group: any) => ({
			value: group.id,
			label: group.name
		}))

	createEffect(() => {
		if (props.item.pinned) {
			setIsPinned(true)
		} else {
			setIsPinned(false)
		}
	})

	const handlePinToggle = () => {
		pinToggleItem(props.item.group, props.item.id)
		setIsPinned(props.item.pinned || false)
	}

	const handleNewGroup = (groupId: any) => {
		props.handleMoveItem(props.item, groupId.value)
	}

	const handleAddToTemplate = () => {
		addItemToTemplateSection(
			selectedTemplateGroup()!,
			selectedSection()!,
			props.item.id,
			props.item.group,
			selectedTemplateVersion()!,
			props.item.fields || []
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

	const handleOpenItem = (itemId: ElementID, groupId: GroupID) => {
		setSelected(groupId)
		setSelectedItem(itemId)
		props.setIsFullElements(true)
		selectedSectionItemEl()?.focus()
		setIsEditingItem({ status: "editing", id: itemId, label: "all" })
	}

	const extractFields = (text: string): string[] => {
		const fieldPattern = /\{\{([^}]+)\}\}/g
		return [...new Set([...text.matchAll(fieldPattern)].map(match => match[1].trim()))]
	}

	const fieldsData = createMemo(() => {
		const currentBody = props.item.body.get(props.item.selectedVersion) || ""
		const fields = extractFields(currentBody)
		return fields
	})

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
							<Show when={isPinned() && props.sizes[1] > 0.2 && isEditingItem().status === "saved"}>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => {
										handlePinToggle()
										toast(
											<div class="flex items-center gap-2">
												<div class="i-material-symbols:check-box w-4 h-4 text-success" />
												<span class="text-xs font-medium">
													{props.item.name} {isPinned() ? "Unpinned" : "Pinned"}
												</span>
											</div>,
											{ duration: 2000, position: "bottom-center" }
										)
									}}
									class="group"
								>
									<div class="i-material-symbols-light:push-pin text-foreground/80 w-4 h-4 group-hover:text-accent-foreground"></div>
								</Button>
							</Show>
							<Show when={fieldsData().length > 0 && selectedItem() !== props.item.id}>
								<div class="flex gap-1 text-foreground/60 text-[.6rem] items-center min-w-50 pr-3">
									Fields:
									<For each={fieldsData().slice(0, 3)}>
										{field => (
											<div class="lowercase text-[.6rem] bg-background-secondary font-700 rounded-sm px-0.65 py-0.10">{field}</div>
										)}
									</For>
									<Show when={fieldsData().length > 3}>
										<div class="text-[.6rem] bg-background-secondary font-700 rounded-sm px-0.65 py-0.10">
											+{fieldsData().length - 3}
										</div>
									</Show>
								</div>
							</Show>
							<Show when={selectedItem() === props.item.id}>
								<Tooltip
									openDelay={1000}
									closeDelay={0}
								>
									<TooltipTrigger
										as={Button}
										onClick={() => {
											handleOpenItem(props.item.id, props.item.group)
										}}
										variant="ghost"
										size="icon"
										class=" text-accent hover:text-accent-foreground max-h-8"
									>
										<div class="i-mdi:file-edit w-4 h-4" />
										<span class="sr-only">Edit Prompt</span>
									</TooltipTrigger>
									<TooltipContent>Edit Prompt</TooltipContent>
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
											<DropdownMenuItem onSelect={() => props.handleDuplicateItem(props.item)}>
												<div class="i-octicon:duplicate-16 w-1.25em h-1.25em mr-2"></div>
												Duplicate Element
											</DropdownMenuItem>
											<DropdownMenuItem onSelect={() => console.log("Clear Prompt")}>
												<div class="i-icon-park-outline:clear-format w-1.25em h-1.25em mr-2"></div> Clear Prompt
											</DropdownMenuItem>
											<DropdownMenuItem onSelect={() => props.handleDeleteItem(props.item.group, props.item.id)}>
												<div class="i-octicon:repo-deleted-16 w-1.25em h-1.25em mr-2"></div> Delete Element
											</DropdownMenuItem>
											<DropdownMenuItem
												onSelect={() => {
													handlePinToggle()

													toast(
														<div class="flex items-center gap-2">
															<div class="i-material-symbols:check-box w-4 h-4 text-success" />
															<span class="text-xs font-medium">
																{props.item.name} {isPinned() ? "Unpinned" : "Pinned"}
															</span>
														</div>,
														{ duration: 2000, position: "bottom-center" }
													)
												}}
											>
												<div
													class={cn(
														" w-1.25em h-1.25em mr-2",
														isPinned() && "i-material-symbols-light:toggle-on w-5 h-5",
														!isPinned() && "i-material-symbols-light:toggle-off-outline w-5 h-5"
													)}
												></div>{" "}
												<Show when={isPinned()}>Unpin Element</Show>
												<Show when={!isPinned()}>Pin Element</Show>
											</DropdownMenuItem>

											<DropdownMenuSub overlap>
												<DropdownMenuSubTrigger>
													<div class="i-solar:download-linear w-1.25em h-1.25em mr-2" />
													Move Element
												</DropdownMenuSubTrigger>
												<DropdownMenuPortal>
													<DropdownMenuSubContent>
														<Select
															onChange={(e: any) => handleNewGroup(e)}
															options={groupOptions}
															optionValue={"value" as any}
															optionTextValue={"label" as any}
															placeholder="Move to Group..."
															itemComponent={props => <SelectItem item={props.item}>{(props.item as any).rawValue.label}</SelectItem>}
														>
															<SelectTrigger
																aria-label="Group"
																class="w-[180px]"
															>
																<SelectValue<{ value: string; label: string }>>
																	{state => state.selectedOption()?.label || "Move to Group..."}
																</SelectValue>
															</SelectTrigger>
															<SelectContent />
														</Select>
													</DropdownMenuSubContent>
												</DropdownMenuPortal>
											</DropdownMenuSub>
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

export default ElementsCompact
