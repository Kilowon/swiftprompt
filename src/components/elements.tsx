import { createEffect, Show, createSignal, For, createMemo } from "solid-js"
import { toast } from "solid-sonner"
import { cn } from "~/lib/utils"
import { Badge } from "~/registry/ui/badge"
import {
	selectedItem,
	setSelectedItem,
	isEditingItem,
	setIsEditingItem,
	setIsEditingGroup,
	entityGroups,
	searchSelectedBadges,
	setSearchSelectedBadges,
	entityItems,
	selectedTemplateGroup,
	selectedSection,
	templates,
	badge,
	selectedSectionItem,
	setSelectedSectionItemEl,
	setSelectedTemplateGroup,
	setSelectedSection,
	selectedTemplateVersion
} from "~/global_state"
import { pinToggleItem, updateBadge, updateItemFieldsInTemplateSection } from "~/helpers/actionHelpers"
import { Badge as BadgeType } from "~/types/badgeType"
import {
	PromptItem,
	GroupID,
	ElementID,
	BadgeID,
	VersionID,
	TemplateGroupID,
	TemplateGroup,
	TemplateField,
	TemplateFieldID,
	ModifierID
} from "~/types/entityType"
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
import { EditableElementTitle } from "./editable-element-title"
import { EditableElementSummary } from "./editable-element-summary"
import { EditableElementBody } from "./editable-element-body"
import { EditableElementPrism } from "./editable-element-prism"
import { createTimeAgo } from "@solid-primitives/date"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/registry/ui/select"
import ElementsBadge from "./elements-badge"
import ElementsBadgeIcon from "./elements-badge-icon"
import { storeEntityMap } from "~/helpers/entityHelpers"
import { addItemToTemplateSection } from "~/helpers/actionHelpers"
import { Progress, ProgressValueLabel } from "~/registry/ui/progress"
import { ReactiveSet } from "@solid-primitives/set"
import { createVisibilityObserver } from "@solid-primitives/intersection-observer"

interface ElementsProps {
	item: PromptItem
	handleEditing: (item: PromptItem, label: "title" | "summary" | "body", status: "editing" | "saved", id: string) => void
	handleUpdateAttributes: (
		item: PromptItem,
		name: string,
		summary: string,
		body: string,
		fields: TemplateField[],
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
}

export default function Elements(props: ElementsProps) {
	const [mouseOver, setMouseOver] = createSignal(false)
	const [isNew, setIsNew] = createSignal(false)
	const [isModified, setIsModified] = createSignal(false)
	const [isPinned, setIsPinned] = createSignal(false)
	const [isBadgeSelectEdit, setIsBadgeSelectEdit] = createSignal(false)
	const [selectedIconValues, setSelectedIconValues] = createSignal<any[]>([])
	const [inputValueTitle, setInputValueTitle] = createSignal(props.item.name || "")
	const [inputValueSummary, setInputValueSummary] = createSignal(props.item.summary || "")
	const [inputValueBody, setInputValueBody] = createSignal(props.item.body.get(props.item.selectedVersion) || "")
	const [inputValueBodyPrism, setInputValueBodyPrism] = createSignal(
		props.item.body.get(props.item.selectedVersion) || ""
	)
	const [isPrism, setIsPrism] = createSignal(true)
	const [prismValue, setPrismValue] = createSignal("")
	const [isRevert, setIsRevert] = createSignal(false)
	let el: HTMLButtonElement | undefined
	let progressRef: HTMLDivElement | undefined
	const useVisibilityObserver = createVisibilityObserver({
		threshold: 0.1,
		rootMargin: "50px" // Preload a bit before element comes into view
	})
	const isVisible = useVisibilityObserver(() => progressRef)

	createEffect(() => {
		setInputValueBody(props.item.body.get(props.item.selectedVersion) || "")
		setInputValueBodyPrism(props.item.body.get(props.item.selectedVersion) || "")
	})

	createEffect(() => {
		if (selectedSectionItem() === props.item.id) {
			setSelectedSectionItemEl(el)
		}
	})

	const selectBadge = (index: number, option: { name: string; id: BadgeID }) => {
		if (!searchSelectedBadges().some(badge => badge.name === option.name)) {
			setSearchSelectedBadges(prev => [...prev, { ...option }])
		} else {
			setSearchSelectedBadges(prev => prev.filter(badge => badge.name !== option.name))
		}
	}

	const groupOptions = Array.from(entityGroups.values())
		.filter((group: any) => group.id !== props.item.group)
		.map((group: any) => ({
			value: group.id,
			label: group.name
		}))

	createEffect(() => {
		if (selectedItem() === props.item.id) {
			setMouseOver(true)
		} else {
			setMouseOver(false)
		}
	})

	const [timeAgoCreated, { difference: createdDifference }] = createTimeAgo(() => props.item.date_created, {
		interval: 600000 // Update every 10 minutes
	})

	createEffect(() => {
		if (-createdDifference() <= 3600000) {
			// 1 hour in milliseconds
			// 2 days in milliseconds
			setIsNew(true)
		} else {
			setIsNew(false)
		}
	})

	const [timeAgoModified, { difference: modifiedDifference }] = createTimeAgo(() => props.item.date_modified, {
		interval: 30000 // Update every 30 seconds
	})

	createEffect(() => {
		if (props.item.date_modified === props.item.date_created) return
		if (-modifiedDifference() <= 120000) {
			// 1 minute in milliseconds
			setIsModified(true)
		} else {
			setIsModified(false)
		}
	})

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

	const handleUpdateBadge = (badgeId: BadgeID, icon: string, name: string) => {
		updateBadge(badgeId, icon, name)
		setSelectedIconValues(prev => prev.map(item => (item.id === badgeId ? { ...item, icon } : item)))
	}

	const handleNewGroup = (groupId: any) => {
		props.handleMoveItem(props.item, groupId.value)
	}

	const handleSave = () => {
		const body = isPrism() ? prismValue() : inputValueBody()
		let version = props.item.versionCounter
		const isDiff: boolean = body !== props.item.body.get(props.item.selectedVersion)
		const isTitleDiff: boolean = inputValueTitle() !== props.item.name
		const isSummaryDiff: boolean = inputValueSummary() !== props.item.summary
		const revert: boolean = isRevert()
		const newFields = fieldsData() as unknown as TemplateField[]
		const isFieldsDiff: boolean = JSON.stringify(props.item.fields || []) !== JSON.stringify(newFields)

		// Update fields in all templates using this element
		const sections = usedInSections({ id: props.item.id, group: props.item.group }).sections
		sections.forEach(section => {
			updateItemFieldsInTemplateSection(
				section.templateId,
				section.sectionId,
				props.item.id,
				newFields,
				selectedTemplateVersion()!
			)
		})

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
			props.handleUpdateAttributes(
				props.item,
				inputValueTitle(),
				inputValueSummary(),
				body,
				newFields,
				version,
				version,
				true
			)
			storeEntityMap()
			setIsRevert(false)
			setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
			toast("Reverted to Previous Version: " + props.item.selectedVersion + " to new version: " + version, {
				duration: 5000,
				position: "bottom-center"
			})
			return
		}

		if ((isTitleDiff || isSummaryDiff) && !isDiff && !isFieldsDiff) {
			version = props.item.versionCounter
			props.handleUpdateAttributes(
				props.item,
				inputValueTitle(),
				inputValueSummary(),
				body,
				newFields,
				version,
				version,
				false
			)
			storeEntityMap()
			setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
			toast(isTitleDiff ? "Title Saved" : "Summary Saved", { duration: 2000, position: "bottom-center" })
			return
		}

		if (isDiff || isFieldsDiff) {
			version = props.item.versionCounter + 1
			props.handleUpdateAttributes(
				props.item,
				inputValueTitle(),
				inputValueSummary(),
				body,
				newFields,
				version,
				version,
				true
			)
			storeEntityMap()
			setIsEditingItem({ status: "saved", id: "" as unknown as ElementID, label: "" })
			toast("Saved to new version: " + version, { duration: 2000, position: "bottom-center" })
			return
		}

		toast("No Changes to Save", { duration: 5000, position: "bottom-center" })
		return
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
			props.item.group,
			selectedTemplateVersion()!,
			fieldsData()
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

	const handleOpenTemplate = (templateId: { value: TemplateGroupID; label: string }) => {
		setSelectedTemplateGroup(templateId.value)
		setSelectedSection(null)
	}

	const extractFields = (text: string, existingFields: TemplateField[] = []): TemplateField[] => {
		if (!text) return []
		const fieldPattern = /(\$?)\{\{([^{}]+?)(?:\}\}|\}|$)/g
		const matches = [...text.matchAll(fieldPattern)]

		return Array.from(
			new Set(
				matches.map(match => {
					const name = match[2].trim()
					// Find existing field with same name to preserve its ID
					const existingField = existingFields.find(f => f.name === name)

					return {
						name,
						// Use existing ID if available, otherwise create new one
						templateFieldId: existingField?.templateFieldId || (crypto.randomUUID() as unknown as TemplateFieldID),
						type: match[1] === "$" ? "global" : "local",
						modifierId: existingField?.modifierId || "",
						order: existingField?.order || ""
					}
				})
			)
		)
	}

	const fieldsData = createMemo(() => {
		const currentBody =
			isEditingItem().id === props.item.id && isEditingItem().status === "editing"
				? isPrism()
					? prismValue()
					: inputValueBody()
				: props.item.body.get(props.item.selectedVersion) || ""

		// Pass existing fields to extractFields
		const existingFields = props.item.fields || []
		const fields = extractFields(currentBody, existingFields)

		return fields
	})

	const getBadgeValuesFromBadgeID = (badgeId: BadgeID) => {
		const badges = badge.get(badgeId)
		if (!badges) return
		return {
			id: badges.id,
			name: badges.name,
			icon: badges.icon
		}
	}

	const initialValue = () => {
		const item = entityItems.get(props.item.group)?.get(props.item.id)
		return (item?.labels || []).map(label => getBadgeValuesFromBadgeID(label.id))
	}

	createEffect(() => {
		setSelectedIconValues(initialValue())
	})

	const contentPreview = createMemo(() => {
		const body = props.item?.body.get(props.item.selectedVersion) || ""
		const wordCount = body.trim() ? body.split(/\s+/).length : 0
		return { wordCount }
	})

	const estimateTokens = (wordCount: number): number => {
		return Math.ceil(wordCount * 1.33)
	}

	const usedInSections = ({ id, group }: { id: ElementID; group: GroupID }) => {
		const sections = createMemo(() =>
			[...templates.values()].flatMap((template: TemplateGroup) => {
				const version = template.sections.get(selectedTemplateVersion()!)
				return version
					? [...version.values()]
							.filter(section => section.items?.some((item: PromptItem) => item.id === id && item.group === group))
							.map(section => ({
								templateId: template.id,
								sectionId: section.id
							}))
					: []
			})
		)

		return {
			sections: sections(),
			templates: new ReactiveSet(sections().map(s => s.templateId))
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

	return (
		<div>
			<Button
				ref={el}
				variant="no_format"
				size="no_format"
				class={cn(
					"flex relative  gap-2 rounded-md border border-border p-3 text-left text-sm transition-all hover:bg-muted/30 hover:border-accent/60 cursor-default",
					selectedItem() === props.item.id && "bg-muted/30 ring-1 border-accent ring-accent  transition-none"
				)}
				onClick={() => setSelectedItem(props.item.id)}
				onMouseEnter={() => setMouseOver(true)}
				onMouseLeave={() => setMouseOver(false)}
			>
				<Show when={selectedItem() === props.item.id && isBadgeSelectEdit() === false}>
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
								when={isEditingItem().id === props.item.id && isEditingItem().status === "editing"}
								fallback={
									<div class="text-[0.65rem] font-medium bg-background rounded-md px-2 py-0.5 justify-center items-center flex select-none ">
										<div class="text-[0.65rem] mr-0.25 ">v</div>
										<div>{props.item.selectedVersion}</div>
									</div>
								}
							>
								<div class="flex items-center gap-2 mt-5">
									<Select
										onChange={e => {
											const value = e?.value ?? ""
											handleSetVersion(Number(value), false)
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
									<div class="flex items-center gap-1">
										<div class="i-material-symbols:grid-view-outline w-5 h-5 text-accent" />
										<div
											class={cn("text-[0.8rem] font-semibold text-foreground/80", !props.item?.name ? "text-foreground/80" : "")}
										>
											{props.item?.name || "Add Title"}
										</div>
									</div>
								}
							>
								<EditableElementTitle
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
					<div class="items-center gap-2 w-full">
						<Show
							when={isEditingItem().id === props.item.id && isEditingItem().status === "editing"}
							fallback={
								<div class="flex items-center gap-2 w-full">
									<div class="flex items-center gap-2 w-full">
										<div
											class={cn(
												"text-[0.65rem] w-full border border-border/50 bg-border/10 rounded-md px-2 py-1",
												!props.item?.summary ? "text-foreground/30" : "text-foreground/50"
											)}
										>
											{props.item?.summary || "Add summary"}
										</div>
									</div>
								</div>
							}
						>
							<EditableElementSummary
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
							<div
								ref={progressRef}
								class="text-xs w-full"
							>
								<Show when={isVisible()}>
									<Show when={fieldsData().length > 0}>
										<div class="text-foreground/70 text-[0.65rem] border border-border bg-accent/10 rounded-md px-2 flex items-center gap-1.5 h-8 mb-2">
											<span class="opacity-60">Fields :</span>
											<div class="flex gap-1 items-center">
												<For each={fieldsData().slice(0, 3)}>
													{field => (
														<div
															class={cn(
																"px-1.5 rounded-sm",
																"bg-background/50 border border-border rounded-sm",
																field.type === "global" && "text-primary/80"
															)}
														>
															{field.name}
														</div>
													)}
												</For>
											</div>
											<Show when={fieldsData().length > 3}>
												<div class="opacity-70">+{fieldsData().length - 3}</div>
											</Show>
										</div>
									</Show>
									<div class="flex flex-col w-full gap-1">
										<div class="grid grid-cols-3 gap-2 min-h-5">
											<div class="flex items-center justify-center border border-border gap-1.5 px-2 py-1 rounded-md bg-muted/30">
												<div class="i-lucide:hash text-[0.8rem] text-foreground/50" />
												<div class="flex items-baseline gap-1">
													<span class="text-[0.7rem] font-medium">{estimateTokens(contentPreview().wordCount)}</span>
													<span class="text-[0.65rem] text-foreground/50">tokens</span>
												</div>
											</div>

											<div class="flex items-center justify-center border border-border gap-1.5 px-2 py-1 rounded-md bg-muted/30">
												<div class="i-lucide:layout-template text-[0.8rem] text-foreground/50" />
												<div class="flex items-baseline gap-1">
													<span class="text-[0.7rem] font-medium">
														{usedInSections({ id: props.item.id, group: props.item.group }).sections.length}
													</span>
													<span class="text-[0.65rem] text-foreground/50">sections</span>
												</div>
											</div>

											<div class="flex items-center justify-center border border-border gap-1.5 px-2 py-1 rounded-md bg-muted/30">
												<div class="i-lucide:folder-template text-[0.8rem] text-foreground/50" />
												<div class="flex items-baseline gap-1">
													<span class="text-[0.7rem] font-medium">
														{Array.from(usedInSections({ id: props.item.id, group: props.item.group }).templates.values()).length}
													</span>
													<span class="text-[0.65rem] text-foreground/50">templates</span>
												</div>
											</div>
										</div>
									</div>
								</Show>
							</div>
						}
					>
						<Show
							when={isPrism()}
							fallback={
								<EditableElementBody
									inputValueBody={inputValueBody}
									setInputValueBody={setInputValueBody}
									item={props.item}
									body={props.item.body.get(props.item.selectedVersion)}
									handleSave={handleSave}
									setIsPrism={setIsPrism}
								/>
							}
						>
							<EditableElementPrism
								item={props.item}
								inputValueBody={inputValueBodyPrism}
								setInputValueBody={setInputValueBodyPrism}
								setPrismValue={setPrismValue}
								body={props.item.body.get(props.item.selectedVersion)}
								handleSave={handleSave}
								setIsPrism={setIsPrism}
							/>
						</Show>
					</Show>
					{/* Badges */}
					<div class="min-h-5.5">
						<Show
							when={isBadgeSelectEdit()}
							fallback={
								<div>
									<Show when={selectedIconValues().length === 0 && selectedItem() === props.item.id}>
										<div class="flex items-center  gap-2">
											<Tooltip
												openDelay={1000}
												closeDelay={0}
											>
												<TooltipTrigger
													as={Button}
													variant="badge"
													size="badge"
													onClick={() => setIsBadgeSelectEdit(true)}
													class={cn("transition-opacity duration-200 opacity-100 py-0.75 px-2.5 ")}
												>
													<div class="i-material-symbols:add w-1em h-1em"></div>
												</TooltipTrigger>
												<TooltipContent>Add Badge</TooltipContent>
											</Tooltip>
										</div>
									</Show>
									<Show when={selectedIconValues().length > 0}>
										<div class="flex gap-1 text-[0.65rem] items-center flex-wrap ">
											<Show
												when={selectedItem() === props.item.id}
												fallback={
													<For each={selectedIconValues()}>
														{(option, index) => {
															const [iconSelection, setIconSelection] = createSignal<{ icon: string; name: string }>(option)

															createEffect(() => {
																setIconSelection(option)
															})

															return (
																<div
																	onClick={() => selectBadge(index(), option)}
																	class="group relative cursor-pointer overflow-hidden py-0 border border-transparent rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
																>
																	<Badge
																		variant={
																			searchSelectedBadges().some((badge: BadgeType) => badge.name === option.name) ? "default" : "outline"
																		}
																		class="group relative text-[0.65rem] cursor-pointer overflow-hidden py-0"
																	>
																		{(option as any).name || ""}

																		<ElementsBadgeIcon
																			itemId={props.item.id}
																			iconSelection={iconSelection}
																			isBadgeHover={false}
																			badgeId={option.id}
																			handleUpdateBadge={handleUpdateBadge}
																		/>
																	</Badge>
																</div>
															)
														}}
													</For>
												}
											>
												<For each={selectedIconValues()}>
													{(option, index) => {
														const [iconSelection, setIconSelection] = createSignal<{ icon: string; name: string }>(option)

														createEffect(() => {
															setIconSelection(option)
														})

														return (
															<button
																onClick={() => selectBadge(index(), option)}
																class="group relative cursor-pointer overflow-hidden py-0 border border-transparent rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
															>
																<Badge
																	variant={
																		searchSelectedBadges().some((badge: BadgeType) => badge.name === option.name) ? "default" : "outline"
																	}
																	class="group relative cursor-pointer overflow-hidden py-0"
																>
																	{(option as any).name || ""}

																	<ElementsBadgeIcon
																		itemId={props.item.id}
																		iconSelection={iconSelection}
																		isBadgeHover={false}
																		badgeId={option.id}
																		handleUpdateBadge={handleUpdateBadge}
																	/>
																</Badge>
															</button>
														)
													}}
												</For>
											</Show>
											<Show when={selectedItem() === props.item.id}>
												<div class={cn("flex items-center  gap-2", selectedItem() === props.item.id && "opacity-100")}>
													<Tooltip
														openDelay={1000}
														closeDelay={0}
													>
														<TooltipTrigger
															as={Button}
															variant="badge"
															size="badge"
															class={cn("py-0.75 px-2.5")}
															onClick={() => setIsBadgeSelectEdit(true)}
														>
															<div class="i-material-symbols:add w-1em h-1em"></div>
															<span class="sr-only">AI Generate Prompt</span>
														</TooltipTrigger>
														<TooltipContent>Add Badge</TooltipContent>
													</Tooltip>
												</div>
											</Show>
										</div>
									</Show>
								</div>
							}
						>
							<ElementsBadge
								item={props.item}
								isBadgeSelectEdit={isBadgeSelectEdit()}
								setIsBadgeSelectEdit={setIsBadgeSelectEdit}
								selectedValues={selectedIconValues}
								setSelectedValues={setSelectedIconValues}
								body={props.item.body.get(props.item.selectedVersion)}
							/>
						</Show>
					</div>
				</div>
				{/* Help Indicators and Edit Buttons */}
				<div class="absolute top-1 right-2">
					<div class="flex gap-1 items-center">
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
						</Show>{" "}
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
											<DropdownMenuSub overlap>
												<DropdownMenuSubTrigger>
													<div class="i-solar:download-linear w-1.25em h-1.25em mr-2" />
													Open Template
												</DropdownMenuSubTrigger>
												<DropdownMenuPortal>
													<DropdownMenuSubContent>
														<Select
															onChange={(e: any) => handleOpenTemplate(e)}
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
