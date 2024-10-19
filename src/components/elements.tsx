import { For, Show, createSignal } from "solid-js"
import { cn } from "~/lib/utils"
import { toast } from "solid-sonner"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "~/registry/ui/dropdown-menu"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "~/registry/ui/tooltip"
import { ElementID, PromptItem, VersionID } from "~/types/entityType"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/registry/ui/select"
import { EditableItemTitle } from "./editable-item-title"
import { storeEntityMap } from "~/helpers/entityHelpers"
import { selectedItem, isEditingItem, setIsEditingItem, entityItems, setSelectedItem } from "~/global_state"

interface ItemsProps {
	item: PromptItem
	handleUpdateAttributes: (
		item: PromptItem,
		name: string,
		summary: string,
		body: string,
		version: VersionID,
		versionCounter: VersionID,
		updatedBody: boolean
	) => void
}

export default function Elements(props: ItemsProps) {
	const [mouseOver, setMouseOver] = createSignal(false)
	const [inputValueTitle, setInputValueTitle] = createSignal(props.item.name || "")
	const [isRevert, setIsRevert] = createSignal(false)
	const [inputValueSummary, setInputValueSummary] = createSignal(props.item.summary || "")
	const [inputValueBody, setInputValueBody] = createSignal(props.item.body.get(props.item.selectedVersion) || "")
	const [inputValueBodyPrism, setInputValueBodyPrism] = createSignal(
		props.item.body.get(props.item.selectedVersion) || ""
	)
	const [isPrism, setIsPrism] = createSignal(true)
	const [prismValue, setPrismValue] = createSignal("")
	let el: HTMLButtonElement | undefined

	const handleSave = () => {
		const body = isPrism() ? prismValue() : inputValueBody()
		let version = props.item.versionCounter
		const isDiff: boolean = body !== props.item.body.get(props.item.selectedVersion)
		const isTitleDiff: boolean = inputValueTitle() !== props.item.name
		const isSummaryDiff: boolean = inputValueSummary() !== props.item.summary
		const revert: boolean = isRevert()

		if (revert && props.item.selectedVersion === version) {
			setIsRevert(false)
			toast("Selected Version is the same as the current version", {
				duration: 5000,
				position: "bottom-center"
			})
			return
		}
		if (revert && props.item.selectedVersion !== version) {
			version = props.item.versionCounter + 1
			const body = props.item.body.get(props.item.selectedVersion) || ""
			props.handleUpdateAttributes(props.item, inputValueTitle(), inputValueSummary(), body, version, version, true)
			storeEntityMap()
			setIsRevert(false)
			setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
			toast("Reverted to Previous Version - " + props.item.selectedVersion + " to new version - " + version, {
				duration: 5000,
				position: "bottom-center"
			})
			return
		} else if ((isTitleDiff || isSummaryDiff) && !isDiff) {
			version = props.item.versionCounter
			props.handleUpdateAttributes(props.item, inputValueTitle(), inputValueSummary(), body, version, version, false)
			storeEntityMap()
			setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
			toast(isTitleDiff ? "Title Saved" : "Summary Saved", { duration: 2000, position: "bottom-center" })
			return
		} else if (isDiff) {
			version = props.item.versionCounter + 1
			props.handleUpdateAttributes(props.item, inputValueTitle(), inputValueSummary(), body, version, version, true)
			storeEntityMap()
			setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
			toast("Saved to new version - " + version, { duration: 2000, position: "bottom-center" })
			return
		} else {
			toast("No Changes to Save", { duration: 5000, position: "bottom-center" })
			return
		}
	}

	const handleSetVersion = (version: VersionID, exit: boolean) => {
		const items = entityItems.get(props.item.group)
		if (items) {
			const existingItem = items.get(props.item.id)
			if (existingItem) {
				if (exit) {
					setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
					items.set(props.item.id, {
						...existingItem,
						selectedVersion: items.get(props.item.id)?.versionCounter || 0
					})
				} else {
					items.set(props.item.id, {
						...existingItem,
						selectedVersion: version
					})
				}
			}
			storeEntityMap()
		}
	}

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
							<Show
								when={isEditingItem().id === props.item.id && isEditingItem().status === "editing"}
								fallback={
									<div class="text-xs font-medium bg-background rounded-md px-2 py-0.5 justify-center items-center flex select-none ">
										<div class="text-[.5rem] mr-0.25 mt-0.5">v</div>
										<div>{props.item.selectedVersion}</div>
									</div>
								}
							>
								<div class="flex items-center gap-2 mt-5">
									<Select
										onChange={e => {
											const value = e?.value ?? ""
											handleSetVersion(value, false)
										}}
										options={Array.from(props.item.body.keys()).map(key => ({
											value: key,
											label: key
										}))}
										optionValue={"value" as any}
										optionTextValue={"label" as any}
										optionDisabled={"disabled" as any}
										itemComponent={props => (
											<SelectItem
												class="text-xs font-medium bg-background rounded-md px-2 py-0.5 justify-center items-center flex select-none w-5"
												item={props.item}
											>
												<div class="flex items-center">
													<div class="text-[.5rem] mr-0.25 mt-0.5">v</div>
													<span class="text-xs">{(props.item as any).rawValue.label}</span>
												</div>
											</SelectItem>
										)}
										placeholder={props.item.selectedVersion}
										class="text-xs font-medium bg-background rounded-md px-2 py-0.5 justify-center items-center flex select-none w-7 h-6"
									>
										<SelectTrigger class="flex items-center justify-center">
											<div class="text-[.5rem] mr-0.25 mt-0.5">v</div>
											<SelectValue<{ value: number; label: string }>>{state => state.selectedOption()?.label}</SelectValue>
										</SelectTrigger>
										<SelectContent />
									</Select>
								</div>
							</Show>
							<Show
								when={isEditingItem().id === props.item.id && isEditingItem().status === "editing"}
								fallback={
									<div class="flex items-center gap-2">
										<div class={cn("text-sm font-semibold text-foreground/80", !props.item?.name ? "text-foreground/80" : "")}>
											{props.item?.name || "Add Title"}
										</div>
									</div>
								}
							>
								<EditableItemTitle
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
						<div>{props.item.description}</div>
					</div>

					{/* Body Prompts */}
					<div>{props.item.body.get(props.item.selectedVersion)}</div>
					{/* Badges */}
					<div class="min-h-5.5">
						<For each={props.item.labels}>
							{label => {
								return <div>{label.name}</div>
							}}
						</For>
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
