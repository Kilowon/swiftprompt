import { For, Show, createSignal } from "solid-js"
import { ReactiveSet } from "@solid-primitives/set"
import { cn } from "~/lib/utils"
import { toast } from "solid-sonner"
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSub,
	DropdownMenuPortal,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuItem
} from "~/registry/ui/dropdown-menu"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "~/registry/ui/tooltip"
import { ElementID, GroupID, PromptItem, VersionID } from "~/types/entityType"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/registry/ui/select"
import { EditableItemTitle } from "./editable-item-title"
import { storeEntityMap } from "~/helpers/entityHelpers"
import {
	selectedItem,
	isEditingItem,
	setIsEditingItem,
	entityItems,
	setSelectedItem,
	setIsEditingGroup,
	entityGroups,
	templates,
	selectedTemplateVersion
} from "~/global_state"

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

	const getTemplatesNames = () => {
		const templateNames = Array.from(
			usedInSections({ id: props.item.id, group: props.item.group }).templates.values()
		).map((template: any) => {
			const name = templates.get(template)?.name
			const id = template
			return { value: id, label: name }
		})
		return templateNames
	}

	const groupOptions = Array.from(entityGroups.values())
		.filter((group: any) => group.id !== props.item.group)
		.map((group: any) => ({
			value: group.id,
			label: group.name
		}))

	// Keep an eye on this ugly thing if slowdowns occur look here first
	const usedInSections = ({ id, group }: { id: ElementID; group: GroupID }) => {
		const sections = Array.from(templates.values()).flatMap((template: any) =>
			Array.from(template.sections.get(selectedTemplateVersion()!)?.values() ?? []).flatMap((section: any) =>
				section.items?.some((item: any) => item.id === id && item.group === group)
					? [{ templateId: template.id, sectionId: section.id }]
					: []
			)
		)
		const templateList = new ReactiveSet(sections.map(section => section.templateId))
		return { sections: sections, templates: templateList }
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
											const value = Number(e?.value) || 0
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
						<Show when={false}>
							<Button
								variant="ghost"
								size="icon"
								class="group"
							>
								<div class="i-material-symbols-light:push-pin text-foreground/80 w-4 h-4 group-hover:text-accent-foreground"></div>
							</Button>
						</Show>
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
													setIsEditingGroup({ status: "saved", id: "" as unknown as ElementID, label: "" })
												}}
												variant="ghost"
												size="icon"
												class=" text-accent hover:text-accent-foreground"
											>
												<div class="i-mdi:file-edit w-4 h-4" />
												<span class="sr-only">Edit Prompt</span>
											</TooltipTrigger>
											<TooltipContent>Edit Prompt</TooltipContent>
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
										<span class="sr-only">Save Prompt</span>
									</TooltipTrigger>
									<TooltipContent>Save Prompt (Ctrl + S)</TooltipContent>
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
											setIsRevert(true)
											handleSave()
										}}
									>
										<div class="i-mdi:file-revert w-1.25em h-1.25em"></div>
										<span class="sr-only">Revert Version</span>
									</TooltipTrigger>
									<TooltipContent>Revert Version (Ctrl + R)</TooltipContent>
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
											handleSetVersion(props.item.selectedVersion, true)
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
											<DropdownMenuItem>
												<div class="i-octicon:duplicate-16 w-1.25em h-1.25em mr-2"></div>
												Duplicate Element
											</DropdownMenuItem>
											<DropdownMenuItem onSelect={() => console.log("Clear Prompt")}>
												<div class="i-icon-park-outline:clear-format w-1.25em h-1.25em mr-2"></div> Clear Prompt
											</DropdownMenuItem>
											<DropdownMenuItem>
												<div class="i-octicon:repo-deleted-16 w-1.25em h-1.25em mr-2"></div> Delete Element
											</DropdownMenuItem>
											<DropdownMenuItem
												onSelect={() => {
													toast(
														<div class="flex items-center gap-2">
															<div class="i-material-symbols:check-box w-4 h-4 text-success" />
															<span class="text-xs font-medium">{props.item.name}</span>
														</div>,
														{ duration: 2000, position: "bottom-center" }
													)
												}}
											>
												<div class={cn(" w-1.25em h-1.25em mr-2")}></div>{" "}
											</DropdownMenuItem>

											<DropdownMenuSub overlap>
												<DropdownMenuSubTrigger>
													<div class="i-solar:download-linear w-1.25em h-1.25em mr-2" />
													Move Element
												</DropdownMenuSubTrigger>
												<DropdownMenuPortal>
													<DropdownMenuSubContent>
														<Select
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
											<DropdownMenuSub overlap>
												<DropdownMenuSubTrigger>
													<div class="i-solar:download-linear w-1.25em h-1.25em mr-2" />
													Open Template
												</DropdownMenuSubTrigger>
												<DropdownMenuPortal>
													<DropdownMenuSubContent>
														<Select
															options={getTemplatesNames()}
															optionValue={"value" as any}
															optionTextValue={"label" as any}
															placeholder="Open Template..."
															itemComponent={props => <SelectItem item={props.item}>{(props.item as any).rawValue.label}</SelectItem>}
														>
															<SelectTrigger
																aria-label="Open Element Template"
																class="w-[180px]"
															>
																<SelectValue<{ value: string; label: string }>>
																	{state => state.selectedOption()?.label || "Open Template"}
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
