import { createEffect, Show, createSignal, createMemo } from "solid-js"
import { toast } from "solid-sonner"
import { cn } from "~/lib/utils"
import {
	isEditingItem,
	setIsEditingItem,
	setIsEditingGroup,
	selectedTemplateGroup,
	selectedSection,
	selectedSectionItem,
	setSelectedSectionItemEl,
	selectedTemplateVersion,
	selectedTemplateField,
	selectedModifier,
	setSelectedModifier
} from "~/global_state"
import { ElementID, Modifier, ModifierGroupID, ModifierID } from "~/types/entityType"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "~/registry/ui/dropdown-menu"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "~/registry/ui/tooltip"
import { EditableModifierTitle } from "./editable-modifier-title"
import { EditableModifierSummary } from "./editable-modifier-summary"
import { EditableModifierPrism } from "./editable-modifier-prism"
import { addModifierToField } from "~/helpers/actionHelpers"

interface ModifiersProps {
	modifier: Modifier
	handleEditing: (
		modifier: Modifier,
		label: "title" | "summary" | "body",
		status: "editing" | "saved",
		id: string
	) => void
	handleUpdateAttributes: (
		modifier: Modifier,
		name: string,
		summary: string,
		body: string,
		modifierGroupId: ModifierGroupID
	) => void
	handleDeleteItem: (groupId: ModifierGroupID, itemId: ModifierID) => void
	handleDuplicateItem: (item: Modifier) => void
	handleMoveItem: (item: Modifier, groupId: ModifierGroupID) => void
	labelLimit: () => number
	modifiers: Modifier[]
	sizes: number[]
}

export default function Modifiers(props: ModifiersProps) {
	const [inputValueTitle, setInputValueTitle] = createSignal(props.modifier.name || "")
	const [inputValueSummary, setInputValueSummary] = createSignal(props.modifier.summary || "")
	const [inputValueBodyPrism, setInputValueBodyPrism] = createSignal(props.modifier.modifier)
	const [isPrism, setIsPrism] = createSignal(true)
	const [prismValue, setPrismValue] = createSignal("")
	let el: HTMLButtonElement | undefined

	createEffect(() => {
		if (selectedSectionItem() === props.modifier.id) {
			setSelectedSectionItemEl(el)
		}
	})

	const handleSave = () => {
		const body = prismValue()
		props.handleUpdateAttributes(
			props.modifier,
			inputValueTitle(),
			inputValueSummary(),
			body,
			props.modifier.modifierGroupId
		)
		setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
	}

	const handleAddToField = () => {
		if (selectedSection() === null) {
			toast("Please select a field to add the modifier to", { duration: 5000, position: "bottom-center" })
			return
		}
		addModifierToField(
			selectedTemplateGroup()!,
			selectedSection()!,
			selectedSectionItem()!,
			props.modifier.id,
			props.modifier.modifierGroupId,
			selectedTemplateField()!,
			selectedTemplateVersion()!
		)
	}

	const [isDebouncing, setIsDebouncing] = createSignal(false)
	const handleDebounce = () => {
		if (!isDebouncing()) {
			setIsDebouncing(true)
			handleAddToField()
			setTimeout(() => {
				setIsDebouncing(false)
			}, 1000)
		}
	}

	const contentPreview = createMemo(() => {
		const body = props.modifier.modifier || ""
		const wordCount = body.trim() ? body.split(/\s+/).length : 0
		return { wordCount }
	})

	const estimateTokens = (wordCount: number): number => {
		return Math.ceil(wordCount * 1.33)
	}

	return (
		<div>
			<Button
				ref={el}
				variant="no_format"
				size="no_format"
				class={cn(
					"flex relative  gap-2 rounded-md border border-border p-3 text-left text-sm transition-all hover:bg-muted/30 hover:border-accent/60 cursor-default",
					selectedModifier() === props.modifier.id && "bg-muted/30 ring-1 border-accent ring-accent  transition-none"
				)}
				onClick={() => setSelectedModifier(props.modifier.id)}
			>
				<Show when={selectedModifier() === props.modifier.id}>
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
							<div class="i-material-symbols:arrow-split w-1.25em h-1.25em"></div>
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
								when={isEditingItem().id === props.modifier.id && isEditingItem().status === "editing"}
								fallback={
									<div class="flex items-center gap-1">
										<div class="i-fluent:tetris-app-24-regular w-5 h-5 text-accent"></div>
										<div
											class={cn(
												"text-[0.8rem] font-semibold text-foreground/80",
												!props.modifier?.name ? "text-foreground/80" : ""
											)}
										>
											{props.modifier?.name || "Add Title"}
										</div>
									</div>
								}
							>
								<EditableModifierTitle
									inputValueTitle={inputValueTitle}
									setInputValueTitle={setInputValueTitle}
									item={props.modifier}
									name={props.modifier.name}
									handleSave={handleSave}
								/>
							</Show>
						</div>
					</div>
					{/* Summary Prompts */}
					<div class="items-center gap-2 pr-10">
						<Show
							when={isEditingItem().id === props.modifier.id && isEditingItem().status === "editing"}
							fallback={
								<div class="flex items-center gap-2">
									<div class={cn("text-xs text-foreground/60", !props.modifier?.summary ? "text-foreground/60" : "")}>
										{props.modifier?.summary || "Add summary"}
									</div>
								</div>
							}
						>
							<EditableModifierSummary
								item={props.modifier}
								summary={props.modifier.summary}
								inputValueSummary={inputValueSummary()}
								setInputValueSummary={setInputValueSummary}
								handleSave={handleSave}
							/>
						</Show>
					</div>

					{/* Body Prompts */}
					<Show when={isEditingItem().id === props.modifier.id && isEditingItem().status === "editing"}>
						<Show when={isPrism()}>
							<EditableModifierPrism
								item={props.modifier}
								inputValueBody={inputValueBodyPrism}
								setInputValueBody={setInputValueBodyPrism}
								setPrismValue={setPrismValue}
								body={props.modifier.modifier}
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
							<Show when={selectedModifier() !== props.modifier.id}>
								<div class="flex items-center justify-center border border-border gap-1.5 px-2 py-1 rounded-md bg-muted/30">
									<div class="i-lucide:hash text-[0.8rem] text-foreground/50" />
									<div class="flex items-baseline gap-1">
										<span class="text-[0.7rem] font-medium">{estimateTokens(contentPreview().wordCount)}</span>
										<span class="text-[0.65rem] text-foreground/50">tokens</span>
									</div>
								</div>
							</Show>
							<Show
								when={
									isEditingItem().status === "editing" &&
									isEditingItem().id === props.modifier.id &&
									isEditingItem().label === "all"
								}
								fallback={
									<Show when={selectedModifier() === props.modifier.id}>
										<Tooltip
											openDelay={1000}
											closeDelay={0}
										>
											<TooltipTrigger
												as={Button}
												onClick={() => {
													setIsEditingItem({ status: "editing", id: props.modifier.id, label: "all" })
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
									<TooltipContent>Save Modifier</TooltipContent>
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
									<TooltipContent>Exit Edit</TooltipContent>
								</Tooltip>
							</Show>
							<Show when={selectedModifier() === props.modifier.id}>
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
											<DropdownMenuItem onSelect={() => props.handleDeleteItem(props.modifier.modifierGroupId, props.modifier.id)}>
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
