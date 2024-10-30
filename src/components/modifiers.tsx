import { createEffect, Show, createSignal, createMemo } from "solid-js"
import { toast } from "solid-sonner"
import { cn } from "~/lib/utils"
import {
	selectedItem,
	setSelectedItem,
	isEditingItem,
	setIsEditingItem,
	setIsEditingGroup,
	entityGroups,
	entityItems,
	selectedTemplateGroup,
	selectedSection,
	selectedSectionItem,
	setSelectedSectionItemEl,
	selectedTemplateVersion
} from "~/global_state"
import { ElementID, Modifier, ModifierGroupID, ModifierID, VersionID } from "~/types/entityType"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "~/registry/ui/dropdown-menu"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "~/registry/ui/tooltip"
import { EditableModifierTitle } from "./editable-modifier-title"
import { EditableModifierSummary } from "./editable-modifier-summary"
import { EditableModifierPrism } from "./editable-modifier-prism"
import { storeEntityMap } from "~/helpers/entityHelpers"
import { addItemToTemplateSection } from "~/helpers/actionHelpers"

interface ModifiersProps {
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
}

export default function Modifiers(props: ModifiersProps) {
	const [inputValueTitle, setInputValueTitle] = createSignal(props.item.name || "")
	const [inputValueSummary, setInputValueSummary] = createSignal(props.item.summary || "")
	const [inputValueBodyPrism, setInputValueBodyPrism] = createSignal(props.item.modifier)
	const [isPrism, setIsPrism] = createSignal(true)
	const [prismValue, setPrismValue] = createSignal("")
	let el: HTMLButtonElement | undefined

	createEffect(() => {
		if (selectedSectionItem() === props.item.id) {
			setSelectedSectionItemEl(el)
		}
	})

	const handleSave = () => {
		const body = prismValue()
		props.handleUpdateAttributes(props.item, inputValueTitle(), inputValueSummary(), body, props.item.modifierGroupId)
		setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
	}

	const handleAddToTemplate = () => {
		if (selectedSection() === null) {
			toast("Please select a section to add the item to", { duration: 5000, position: "bottom-center" })
			return
		}
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

	const contentPreview = createMemo(() => {
		const body = props.item.modifier || ""
		const wordCount = body.trim() ? body.split(/\s+/).length : 0
		return { wordCount }
	})

	const estimateTokens = (wordCount: number): number => {
		return Math.ceil(wordCount * 1.33)
	}

	createEffect(() => {
		console.log("wordCount", estimateTokens(contentPreview().wordCount))
	})

	return (
		<div>
			<Button
				ref={el}
				variant="no_format"
				size="no_format"
				class={cn(
					"flex relative  gap-2 rounded-md border border-border p-3 text-left text-sm transition-all hover:bg-muted/50 cursor-default",
					selectedItem() === props.item.id && "bg-muted/50 ring-1 border-accent ring-accent  transition-none"
				)}
				onClick={() => setSelectedItem(props.item.id)}
			>
				<Show when={selectedItem() === props.item.id}>
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant="ghost"
							size="icon"
							class="absolute bottom-1 right-2 text-accent hover:text-accent-foreground"
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
				<div class="flex w-full flex-col gap-2 p-0.5">
					<div class="flex flex-col items-start justify-between w-full relative">
						{/* Title Prompts */}
						<div class="flex items-center gap-2 pr-10 group flex-grow mb-2">
							<Show
								when={isEditingItem().id === props.item.id && isEditingItem().status === "editing"}
								fallback={
									<div class="flex items-center gap-1">
										<div class="i-material-symbols:view-column-outline-sharp w-4 h-4 text-accent"></div>
										<div class={cn("text-sm font-semibold text-foreground/80", !props.item?.name ? "text-foreground/80" : "")}>
											{props.item?.name || "Add Title"}
										</div>
									</div>
								}
							>
								<EditableModifierTitle
									inputValueTitle={inputValueTitle}
									setInputValueTitle={setInputValueTitle}
									item={props.item}
									name={props.item.name}
									handleSave={handleSave}
								/>
							</Show>
						</div>
					</div>
					{/* Summary Prompts */}
					<div class="items-center gap-2 pr-10">
						<Show
							when={isEditingItem().id === props.item.id && isEditingItem().status === "editing"}
							fallback={
								<div class="flex items-center gap-2">
									<div class={cn("text-xs text-foreground/60", !props.item?.summary ? "text-foreground/60" : "")}>
										{props.item?.summary || "Add summary"}
									</div>
								</div>
							}
						>
							<EditableModifierSummary
								item={props.item}
								summary={props.item.summary}
								inputValueSummary={inputValueSummary()}
								setInputValueSummary={setInputValueSummary}
								handleSave={handleSave}
							/>
						</Show>
					</div>

					{/* Body Prompts */}
					<Show
						when={isEditingItem().id === props.item.id && isEditingItem().status === "editing"}
						fallback={
							<div class="text-xs w-full">
								<div class="flex flex-col w-full gap-1">
									<div class="flex justify-between min-h-5">
										<div class="text-foreground/60 text-xs flex items-center gap-4">
											<div class="flex items-center gap-1 text-[.6rem]">
												<span>{`${estimateTokens(contentPreview().wordCount)}`}</span>
												<span class="text-[.6rem] mr-2">tokens</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						}
					>
						<Show when={isPrism()}>
							<EditableModifierPrism
								item={props.item}
								inputValueBody={inputValueBodyPrism}
								setInputValueBody={setInputValueBodyPrism}
								setPrismValue={setPrismValue}
								body={props.item.modifier}
								handleSave={handleSave}
								setIsPrism={setIsPrism}
							/>
						</Show>
					</Show>
				</div>
				{/* Help Indicators and Edit Buttons */}
				<div class="absolute top-1 right-2">
					<div class="flex gap-1 items-center">
						<div class="flex items-center gap-2 min-w-23 min-h-10">
							<Show
								when={
									isEditingItem().status === "editing" && isEditingItem().id === props.item.id && isEditingItem().label === "all"
								}
								fallback={
									<Show when={selectedItem() === props.item.id}>
										<Tooltip
											openDelay={1000}
											closeDelay={0}
										>
											<TooltipTrigger
												as={Button}
												onClick={() => {
													setIsEditingItem({ status: "editing", id: props.item.id, label: "all" })
													setIsEditingGroup({ status: "saved", id: "" as unknown as ModifierGroupID, label: "" })
												}}
												variant="ghost"
												size="icon"
												class=" text-accent hover:text-accent-foreground"
											>
												<div class="i-mdi:file-edit w-4 h-4" />
												<span class="sr-only">Edit Modifier</span>
											</TooltipTrigger>
											<TooltipContent>Edit Modifier</TooltipContent>
										</Tooltip>
									</Show>
								}
							>
								<Tooltip
									openDelay={1000}
									closeDelay={0}
								>
									<TooltipTrigger
										as={Button}
										variant="ghost"
										size="icon"
										class=" text-accent hover:text-accent-foreground"
										onClick={() => handleSave()}
									>
										<div class="i-material-symbols:file-save w-1.25em h-1.25em"></div>
										<span class="sr-only">Save Modifier</span>
									</TooltipTrigger>
									<TooltipContent>Save Modifier (Ctrl + S)</TooltipContent>
								</Tooltip>

								<Tooltip
									openDelay={1000}
									closeDelay={0}
								>
									<TooltipTrigger
										as={Button}
										variant="ghost"
										size="icon"
										class=" text-accent hover:text-accent-foreground"
										onClick={() => {
											setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
										}}
									>
										<div class="i-ph:file-x-fill w-1.25em h-1.25em"></div>
										<span class="sr-only">Exit Edit</span>
									</TooltipTrigger>
									<TooltipContent>Exit Edit (Ctrl + E)</TooltipContent>
								</Tooltip>
							</Show>
							<Show when={selectedItem() === props.item.id}>
								<div>
									<DropdownMenu placement="bottom-end">
										<DropdownMenuTrigger
											as={Button}
											variant="ghost"
											size="icon"
											class="text-accent hover:text-accent-foreground"
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
