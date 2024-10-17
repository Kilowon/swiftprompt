import { createSignal, Show, onMount } from "solid-js"
import { storeEntityMap } from "../helpers/entityHelpers"
import { isEditingItem, setIsEditingItem } from "../global_state"
import { Button } from "~/registry/ui/button"
import { changeItemAttributes } from "../helpers/actionHelpers"
import { ElementID, GroupID, PromptItem } from "~/types/entityType"
import { TextField, TextFieldTextArea } from "~/registry/ui/text-field"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { cn } from "~/lib/utils"

export const EditableItemText = (props: {
	id: ElementID
	groupId: GroupID
	item: PromptItem
	name?: string
	badgeName?: string
	summary?: string
	body?: string
	type: "badge" | "title" | "summary" | "body"
	isEditingBadge?: boolean
	index?: number
	setIsEditingBadge?: (isEditingBadge: boolean) => void
	onBadgeChange?: (newLabel: string) => void
	onChange?: (item: PromptItem, name: string, summary: string, body: string) => void
}) => {
	let inputRef: HTMLSpanElement | undefined

	const [inputValue, setInputValue] = createSignal(props.body || "")

	const focusElement = (el: HTMLSpanElement) => {
		onMount(() => el.focus())
	}

	const handleBlur = (e: FocusEvent) => {
		const newText = (e.target as HTMLElement).textContent || ""

		const { label } = isEditingItem()
		let updatedItem = { ...props.item }

		switch (label) {
			case "title":
				updatedItem.name = newText
				props.onChange?.(updatedItem, newText, updatedItem.summary, updatedItem.body)
				break
			case "summary":
				updatedItem.summary = newText
				props.onChange?.(updatedItem, updatedItem.name, newText, updatedItem.body)
				break
			case "body":
				updatedItem.body = newText
				props.onChange?.(updatedItem, updatedItem.name, updatedItem.summary, newText)
				break
			default:
				// If label doesn't match any case, keep the item unchanged
				break
		}
		setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
		storeEntityMap()
		props.setIsEditingBadge?.(false)
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		if (
			((e.key === "s" || e.key === "S") && e.ctrlKey) ||
			(e.key === "Enter" && isEditingItem().label === "badge") ||
			(e.key === "Enter" && isEditingItem().label === "title") ||
			(e.key === "Enter" && isEditingItem().label === "summary")
		) {
			e.preventDefault() // Prevent default browser save action
			;(e.target as HTMLElement).blur()
			if (isEditingItem().label === "body") {
				handleBlur({ target: { textContent: inputValue() } } as unknown as FocusEvent)
				setIsEditingItem({ status: "saved", id: props.id, label: "" })
				storeEntityMap()
			}
		}
	}

	return (
		<Show when={isEditingItem().status === "editing" && isEditingItem().id === props.id}>
			<Show when={isEditingItem().label === "title"}>
				<div>
					<span
						ref={el => {
							inputRef = el
							if (el) focusElement(el)
						}}
						contentEditable={true}
						onBlur={e => handleBlur(e)}
						onKeyDown={e => handleKeyDown(e)}
						class="min-w-0 w-full min-h-10 border-none outline-none text-sm font-bold mt-1.5 mb-1.5 capitalize text-center"
					>
						{props.name || "\u200B"}
					</span>
				</div>

				<div
					class="flex items-center"
					onClick={e => handleBlur(e)}
				>
					<div class="i-mdi:comment-check-outline w-1.25em h-1.25em ml-2 text-muted-foreground hover:text-primary cursor-pointer opacity-100 transition-opacity duration-200 ease-in-out" />
				</div>
			</Show>
			<Show when={isEditingItem().label === "summary"}>
				<div>
					<span
						ref={el => {
							inputRef = el
							if (el) focusElement(el)
						}}
						contentEditable={true}
						onBlur={e => handleBlur(e)}
						onKeyDown={e => handleKeyDown(e)}
						class="min-w-0 w-full min-h-10 border-none outline-none text-xs font-medium mt-1.5 mb-1.5 text-center"
					>
						{props.summary || "\u200B"}
					</span>
				</div>
				<div
					class="flex items-center"
					onClick={e => handleBlur(e)}
				>
					<div class="i-mdi:comment-check-outline w-1.25em h-1.25em ml-2 text-muted-foreground hover:text-primary cursor-pointer opacity-100 transition-opacity duration-200 ease-in-out" />
				</div>
			</Show>
			<Show when={isEditingItem().label === "body"}>
				<div>
					<div class="flex items-center justify-end gap-2">
						<Tooltip
							openDelay={1000}
							closeDelay={0}
						>
							<TooltipTrigger
								as={Button}
								variant="outline_only"
								size="icon"
								class={cn("transition-opacity duration-200 opacity-100")}
								onClick={() => {
									console.log("Generate Prompt")
								}}
							>
								<div class="i-fluent:bot-sparkle-20-filled w-1.25em h-1.25em"></div>
								<span class="sr-only">AI Generate Prompt</span>
							</TooltipTrigger>
							<TooltipContent>AI Generate Prompt (Coming Soon)</TooltipContent>
						</Tooltip>
						<Tooltip
							openDelay={1000}
							closeDelay={0}
						>
							<TooltipTrigger
								as={Button}
								variant="outline_only"
								size="icon"
								class={cn("transition-opacity duration-200 opacity-100")}
								onClick={() => {
									handleBlur({ target: { textContent: inputValue() } } as unknown as FocusEvent)
									setIsEditingItem({ status: "saved", id: props.id, label: "" })
									storeEntityMap()
								}}
							>
								<div class="i-material-symbols:file-save w-1.25em h-1.25em"></div>
								<span class="sr-only">Save Prompt</span>
							</TooltipTrigger>
							<TooltipContent>Save Prompt (Ctrl + S)</TooltipContent>
						</Tooltip>
					</div>
					<TextField>
						<TextFieldTextArea
							ref={el => {
								inputRef = el
								if (el) focusElement(el)
							}}
							class="p-4"
							value={inputValue()}
							onChange={(e: any) => setInputValue(e.target.value)}
							onKeyDown={(e: any) => handleKeyDown(e)}
							placeholder={`Type Prompt Fragment...`}
							autoResize={true}
						/>
					</TextField>
				</div>

				<div
					class="flex items-center ml-auto"
					onClick={e => handleBlur(e)}
				>
					<div class="i-material-symbols-light:data-check w-1.0em h-1.0em ml-2 text-muted-foreground hover:text-primary cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out" />
				</div>
			</Show>
		</Show>
	)
}
