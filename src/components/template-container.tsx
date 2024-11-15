import { For, createSignal, Show, createEffect, Accessor, createUniqueId, onCleanup, createMemo } from "solid-js"
import {
	createSortable,
	DragDropProvider,
	DragDropSensors,
	Draggable,
	Droppable,
	DragOverlay,
	Id,
	SortableProvider,
	useDragDropContext,
	maybeTransformStyle
} from "@thisbeyond/solid-dnd"
import { cn } from "~/lib/utils"
import {
	selectedTemplateGroup,
	templates,
	entityItems,
	setSelected,
	setSelectedItem,
	selectedSection,
	setSelectedSection,
	entityGroups,
	selectedSectionItem,
	setSelectedSectionItem,
	selectedSectionItemEl,
	setIsEditingItem,
	selectedItem,
	selectedTemplateVersion,
	activeFieldId,
	setActiveFieldId,
	setIsShowModifiers,
	hotKeyMappings
} from "~/global_state"
import {
	ElementID,
	GroupID,
	TemplateField,
	TemplateGroupID,
	TemplateSection,
	TemplateSectionID
} from "~/types/entityType"
import { Button } from "~/registry/ui/button"
import { EditableSectionTitle } from "./editable-section-title"
import {
	deleteTemplateSection,
	duplicateTemplateSection,
	editTemplateSection,
	moveTemplateSection,
	removeItemFromTemplateSection,
	closestEntity,
	onDragOver,
	onDragEnd
} from "~/helpers/actionHelpers"
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
import { Tooltip, TooltipTrigger, TooltipContent } from "~/registry/ui/tooltip"
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "~/registry/ui/select"
import TemplateSectionFields from "./template-section-fields"
import { useColorMode } from "@kobalte/core"
import { createShortcut } from "@solid-primitives/keyboard"

type ColorMode = "light" | "dark" | "warm-dark" | "system"

interface TemplateContainerProps {
	isEditingTemplateSection: Accessor<{ status: string }>
	setIsEditingTemplateSection: (value: { status: string }) => void
	setIsFullElements: (value: boolean) => void
}

export default function TemplateContainer(props: TemplateContainerProps) {
	const [templateList, setTemplateList] = createSignal<{ value: string; label: string }[]>([])
	const { setColorMode, colorMode } = useColorMode()
	const [dragDropState, dragDropFns] = useDragDropContext() || [null, null]

	createEffect(() => {
		setTemplateList(
			[...templates.keys()].map(group => ({
				value: group.toString(),
				label: templates.get(group)?.name ?? ""
			}))
		)
	})

	const groupOptions = [...entityGroups.keys()].map(group => ({
		value: group,
		label: entityGroups.get(group)?.name
	}))

	const handleOpenItem = (itemId: ElementID, groupId: GroupID) => {
		setIsShowModifiers(false)
		setSelected(groupId)
		setSelectedItem(itemId)
		props.setIsFullElements(true)
		selectedSectionItemEl()?.focus()
		setIsEditingItem({ status: "editing", id: itemId, label: "all" })
	}

	const handleViewItem = (itemId: ElementID, groupId: GroupID) => {
		setIsShowModifiers(false)
		setSelected(groupId)
		setSelectedItem(itemId)
		selectedSectionItemEl()?.focus()
		setIsEditingItem({ status: "saved", id: itemId, label: "" })
	}

	const handleDeleteSection = (sectionId: TemplateSectionID) => {
		deleteTemplateSection(selectedTemplateGroup()!, sectionId, selectedTemplateVersion()!)
	}

	const handleDuplicateSection = (sectionId: TemplateSectionID) => {
		duplicateTemplateSection(selectedTemplateGroup()!, sectionId, selectedTemplateVersion()!)
	}

	const handleRemoveItemFromSection = (sectionId: TemplateSectionID, itemId: ElementID) => {
		removeItemFromTemplateSection(selectedTemplateGroup()!, sectionId, itemId, selectedTemplateVersion()!)
	}

	const handleMoveSection = (e: { value: string; label: string }) => {
		moveTemplateSection(selectedTemplateGroup()!, selectedSection()!, e.value as unknown as TemplateGroupID)
	}

	// Delete Template Section
	createShortcut(
		hotKeyMappings().DeleteTemplateSection,
		() => {
			handleDeleteSection(selectedSection()!)
		},
		{
			preventDefault: true
		}
	)

	const currentTemplateData = createMemo(() => ({
		group: templates.get(selectedTemplateGroup()!),
		version: selectedTemplateVersion()!,
		sectionsMap: templates.get(selectedTemplateGroup()!)?.sections.get(selectedTemplateVersion()!)
	}))

	const sections = createMemo(() => {
		const { sectionsMap } = currentTemplateData()
		return [...(sectionsMap?.values() ?? [])].sort((a, b) => a.order - b.order)
	})

	const sectionIds = createMemo(() => sections().map(section => section.id as unknown as Id))

	const [dragActive, setDragActive] = createSignal(false)

	const onDragOverHandler = (e: any) => {
		setDragActive(true)
		onDragOver(e)
	}

	const onDragEndHandler = (e: any) => {
		onDragEnd(e)
		setDragActive(false)
	}

	onCleanup(() => {
		setDragActive(false)
	})

	return (
		<div
			class="flex flex-col gap-2 h-full px-4 overflow-auto scrollbar-default scrollbar-gutter"
			style={{
				"scrollbar-width": "auto",
				"-ms-overflow-style": "auto"
			}}
		>
			<DragDropProvider
				onDragOver={onDragOverHandler}
				onDragEnd={onDragEndHandler}
				collisionDetector={closestEntity}
			>
				<DragDropSensors />
				<Show
					when={[...templates.keys()].length > 0 && selectedTemplateGroup() !== null}
					fallback={
						<div class="flex flex-col items-center justify-center mt-3 h-full mb-11">
							<div class="text-2xl font-bold mb-4">No template selected</div>
							<div class="text-gray-600 mb-6">Create a new template to get started!</div>
						</div>
					}
				>
					<Show
						when={sections().length === 0}
						fallback={
							<div class="mb-40 min-h-[200px]">
								<SortableProvider ids={sectionIds()}>
									<For
										each={sections()}
										fallback={<div>Loading...</div>}
									>
										{(section: TemplateSection) => {
											const [mouseOverSection, setMouseOverSection] = createSignal<TemplateSectionID | null>(null)
											const [mouseOverItem, setMouseOverItem] = createSignal<ElementID | null>(null)
											const [sectionName, setSectionName] = createSignal("")
											const sortable = createSortable(section.id as unknown as Id, { type: "section" })

											const handleSectionNameChange = (value: string) => {
												editTemplateSection(
													selectedTemplateGroup()!,
													section.id,
													sectionName(),
													section.order,
													selectedTemplateVersion()!
												)
												props.setIsEditingTemplateSection({ status: "saved" })
											}
											const handleEditSection = () => {
												props.setIsEditingTemplateSection({ status: "editing" })
											}

											return (
												<Button
													ref={sortable.ref}
													style={maybeTransformStyle(sortable.transform)}
													classList={{ "opacity-25": sortable.isActiveDraggable }}
													variant="no_format"
													size="no_format"
													class={cn(
														"flex flex-col items-start justify-start gap-2 border border-muted/60 text-left text-sm transition-all mt-2 cursor-default",
														mouseOverSection() === section.id &&
															selectedSection() !== section.id &&
															"bg-background-secondary border-accent/60 ring-accent  transition-none ",
														selectedSection() === section.id &&
															"bg-background-secondary ring-1 border-accent ring-accent  transition-none"
													)}
													onClick={() => setSelectedSection(section.id)}
													onMouseEnter={() => setMouseOverSection(section.id)}
													onMouseLeave={() => setMouseOverSection(null)}
												>
													<div class="flex w-full flex-col gap-1 mb-1">
														<div>
															<div class="flex flex-col items-center gap-1 mx-1">
																<div class="w-full">
																	<div class="flex items-center">
																		<div
																			class="flex items-center bg-background/50 rounded-md p-1 ml-1 mr-1 cursor-pointer"
																			{...sortable.dragActivators}
																		>
																			<div class="i-material-symbols-light:drag-indicator w-1.25em h-1.25em"></div>
																		</div>
																		<Show
																			when={props.isEditingTemplateSection().status === "editing" && selectedSection() === section.id}
																			fallback={
																				<div class="flex items-center">
																					<div class="i-ri:apps-2-line w-5 h-5 ml-2 text-accent" />
																					<div class="text-[0.8rem] font-semibold pl-2 min-h-12 flex items-center">{section.name || ""}</div>
																					<Show
																						when={
																							selectedSection() === section.id &&
																							Number(templates.get(selectedTemplateGroup()!)?.versionCounter) ===
																								Number(selectedTemplateVersion())
																						}
																					>
																						<Button
																							variant="ghost"
																							size="icon"
																							onClick={handleEditSection}
																						>
																							<div
																								class={cn(
																									"i-material-symbols:edit-square-outline opacity-0 text-accent",
																									selectedSection() === section.id && "opacity-100 transition-opacity duration-300"
																								)}
																							/>
																						</Button>
																					</Show>
																				</div>
																			}
																		>
																			<EditableSectionTitle
																				name={section.name}
																				inputValueSectionTitle={sectionName}
																				setInputValueSectionTitle={setSectionName}
																				handleSectionNameChange={handleSectionNameChange}
																			/>
																		</Show>
																		<Show
																			when={
																				selectedSection() === section.id &&
																				Number(templates.get(selectedTemplateGroup()!)?.versionCounter) ===
																					Number(selectedTemplateVersion())
																			}
																		>
																			<div class="ml-auto">
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
																						<DropdownMenuItem onSelect={() => handleDuplicateSection(section.id)}>
																							<div class="i-octicon:duplicate-16 w-1.25em h-1.25em mr-2"></div>
																							Duplicate Section
																						</DropdownMenuItem>

																						<DropdownMenuItem onSelect={() => handleDeleteSection(section.id)}>
																							<div class="i-octicon:repo-deleted-16 w-1.25em h-1.25em mr-2"></div> Delete Section
																						</DropdownMenuItem>
																						<DropdownMenuSub overlap>
																							<DropdownMenuPortal>
																								<DropdownMenuSubContent>
																									<Select
																										onChange={(e: any) => handleMoveSection(e)}
																										options={templateList()}
																										optionValue={"value" as any}
																										optionTextValue={"label" as any}
																										placeholder="Move to Template..."
																										itemComponent={props => (
																											<SelectItem item={props.item}>{(props.item as any).rawValue.label}</SelectItem>
																										)}
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
																	<hr class="w-full border-muted/60 " />
																</div>
																<div class="flex flex-col gap-1 w-full overflow-auto min-h-8">
																	<For each={section.items}>
																		{(item: { id: ElementID; group: GroupID; fields?: TemplateField[] }) => {
																			const uniqueId = createUniqueId()
																			const [el, setEl] = createSignal<HTMLButtonElement | undefined>()
																			const [isSelected, setIsSelected] = createSignal<{ selected: "selected" | "unselected" }>({
																				selected: "unselected"
																			})

																			const [elementToElementMatch, setElementToElementMatch] = createSignal<boolean>(false)
																			const [isFieldsSelected, setIsFieldsSelected] = createSignal<boolean>(false)
																			const sortable = createSortable(`${section.id}-${item.id}` as unknown as Id, {
																				type: "item",
																				sectionId: section.id,
																				group: item.group
																			})
																			createEffect(() => {
																				setElementToElementMatch(item.id === selectedItem())
																			})

																			createEffect(() => {
																				if (el()) {
																					el()!.id = uniqueId
																				}
																			})

																			return (
																				<div class="w-full">
																					<button
																						ref={sortable.ref}
																						style={maybeTransformStyle(sortable.transform)}
																						classList={{ "opacity-25": sortable.isActiveDraggable }}
																						id={uniqueId}
																						type="button"
																						class={cn(
																							"w-98% flex flex-col items-start gap-2 rounded-lg border border-muted/60 ml-2 text-left text-sm transition-all cursor-default",
																							mouseOverItem() === item.id && "bg-background/50 border-accent/25  transition-none",
																							mouseOverItem() === item.id &&
																								colorMode() === "light" &&
																								"bg-background border-accent/25  transition-none",

																							selectedSectionItem() === item.id &&
																								selectedSection() === section.id &&
																								"bg-background/50 border-accent/25   transition-none rounded-md",
																							selectedSectionItem() === item.id &&
																								selectedSection() === section.id &&
																								colorMode() === "light" &&
																								"bg-background border-accent/25   transition-none rounded-md"
																						)}
																						onClick={() => {
																							setSelectedSectionItem(item.id)

																							if (el()?.id === uniqueId) {
																								setIsSelected({ selected: "selected" })
																							}
																						}}
																						onMouseEnter={() => setMouseOverItem(item.id)}
																						onMouseLeave={() => setMouseOverItem(null)}
																					>
																						<div class="w-full flex flex-col min-h-10 max-h-10 justify-center">
																							<div class="flex items-center justify-between w-full">
																								<div
																									class="flex items-center bg-background/50 rounded-md p-1 mx-2 cursor-pointer"
																									{...sortable.dragActivators}
																								>
																									<div class="i-material-symbols-light:drag-indicator w-1.25em h-1.25em"></div>
																								</div>
																								<div class="flex">
																									<div
																										class={cn(
																											"font-semibold text-[0.65rem] capitalize truncate ",
																											elementToElementMatch() && "text-success"
																										)}
																									>
																										{entityItems.get(item.group)?.get(item.id)?.name}
																									</div>
																								</div>
																								<div class={cn("ml-auto text-[0.65rem] text-foreground/40 flex items-center mr-1")}>
																									<Show when={elementToElementMatch()}>
																										<div class="i-mdi:checkbox-blank-circle text-success w-1em h-1em mr-1"></div>
																									</Show>

																									<div class="truncate mr-2">{entityGroups.get(item.group)?.name}</div>
																								</div>
																								<Show
																									when={selectedSectionItem() === item.id && selectedSection() === section.id}
																									fallback={<div></div>}
																								>
																									<div class="w-px h-4 bg-foreground/20 mx-1" />
																									<div class="flex items-center text-accent gap-2">
																										<Tooltip
																											openDelay={1000}
																											closeDelay={0}
																										>
																											<TooltipTrigger
																												as={Button}
																												onClick={() => handleViewItem(item.id, item.group)}
																												variant="ghost"
																												size="icon"
																												class=" text-accent hover:text-accent-foreground max-h-8"
																											>
																												<div class="i-mdi:file-eye w-1.25em h-1.25em"></div>

																												<span class="sr-only">View Element</span>
																											</TooltipTrigger>
																											<TooltipContent>View Element</TooltipContent>
																										</Tooltip>
																										<Tooltip
																											openDelay={1000}
																											closeDelay={0}
																										>
																											<TooltipTrigger
																												as={Button}
																												onClick={() => handleOpenItem(item.id, item.group)}
																												variant="ghost"
																												size="icon"
																												class=" text-accent hover:text-accent-foreground max-h-8"
																											>
																												<div class="i-mdi:file-edit w-1.25em h-1.25em" />

																												<span class="sr-only">Edit Element</span>
																											</TooltipTrigger>
																											<TooltipContent>Edit Element</TooltipContent>
																										</Tooltip>
																										<Show
																											when={
																												Number(templates.get(selectedTemplateGroup()!)?.versionCounter) ===
																												Number(selectedTemplateVersion())
																											}
																										>
																											<Tooltip
																												openDelay={1000}
																												closeDelay={0}
																											>
																												<TooltipTrigger
																													as={Button}
																													onClick={() => handleRemoveItemFromSection(section.id, item.id)}
																													variant="ghost"
																													size="icon"
																													class=" text-accent hover:text-accent-foreground max-h-8"
																												>
																													<div class="i-mdi:file-document-remove w-1.25em h-1.25em" />

																													<span class="sr-only">Remove from Template</span>
																												</TooltipTrigger>
																												<TooltipContent>Remove from Template</TooltipContent>
																											</Tooltip>
																										</Show>
																									</div>
																								</Show>
																								<div class="min-w-13">
																									<Show when={item.fields && item.fields.length > 0}>
																										<div
																											onclick={e => {
																												setActiveFieldId(current => (current === item.id ? null : item.id))
																											}}
																											class={cn(
																												"items-center justify-center text-[0.65rem] text-foreground/40 flex items-center mr-2 ml-2 px-1 rounded-0.75 hover:cursor-pointer",
																												activeFieldId() === item.id && "text-primary-foreground bg-primary",
																												item.fields?.some(field => field.modifierId === "")
																													? "text-warning bg-warning/15 hover:bg-warning hover:text-warning-foreground"
																													: "bg-accent/15 hover:text-primary-foreground hover:bg-primary"
																											)}
																										>
																											Fields
																										</div>
																									</Show>
																								</div>
																							</div>
																						</div>
																					</button>
																					<Show when={activeFieldId() === item.id && selectedSection() === section.id}>
																						<div class="w-full text-[0.65rem] text-foreground/40 space-y-0.25 flex flex-col items-center">
																							<TemplateSectionFields fields={item.fields!} />
																						</div>
																					</Show>
																				</div>
																			)
																		}}
																	</For>
																</div>
															</div>
														</div>
													</div>
												</Button>
											)
										}}
									</For>
								</SortableProvider>
							</div>
						}
					>
						<div class="flex flex-col items-center justify-center h-full">
							<div class="text-2xl font-bold mb-4">No sections yet</div>
							<div class="text-gray-600 mb-6">Create your first section to get started!</div>
						</div>
					</Show>
				</Show>
				<DragOverlay>
					{draggable => {
						if (!draggable?.id) return null

						// Extract section ID and item ID from the composite ID
						const extractIds = (id: string) => {
							const parts = id.match(/.{8}-.{4}-.{4}-.{4}-.{12}/g) || []
							return {
								sectionId: parts[0] as unknown as TemplateSectionID,
								itemId: parts[1] as unknown as ElementID
							}
						}

						if (draggable.data.type === "section") {
							const section = sections().find(s => s.id === draggable.id)
							if (section) {
								return (
									<div class="flex items-center gap-2 bg-background/95 border border-accent/60 rounded-md p-2 shadow-lg">
										<div class="flex items-center bg-background/50 rounded-md p-1 mx-2 cursor-pointer">
											<div class="i-material-symbols-light:drag-indicator w-1.25em h-1.25em"></div>
										</div>
										<div class="i-ri:apps-2-line w-5 h-5 text-accent" />
										<span class="text-sm font-medium">{section.name}</span>
									</div>
								)
							}
						} else {
							// For section items
							const { sectionId, itemId } = extractIds(draggable.id as string)
							const section = templates.get(selectedTemplateGroup()!)?.sections.get(selectedTemplateVersion()!)?.get(sectionId)
							const item = section?.items.find(item => item.id === itemId)

							if (item) {
								return (
									<div class="flex items-center gap-2 bg-background/95 border border-accent/60 rounded-md p-2 shadow-lg">
										<div class="flex items-center bg-background/50 rounded-md p-1 mx-2 cursor-pointer">
											<div class="i-material-symbols-light:drag-indicator w-1.25em h-1.25em"></div>
										</div>
										<span class="text-sm font-medium">{entityItems.get(item.group)?.get(item.id)?.name}</span>
									</div>
								)
							}
						}
						return null
					}}
				</DragOverlay>
			</DragDropProvider>
		</div>
	)
}
