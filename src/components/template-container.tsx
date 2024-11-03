import { For, createSignal, Show, createEffect, Accessor, createUniqueId } from "solid-js"
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
	setActiveFieldId
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
	removeItemFromTemplateSection
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
interface TemplateContainerProps {
	isEditingTemplateSection: Accessor<{ status: string }>
	setIsEditingTemplateSection: (value: { status: string }) => void
	setIsFullElements: (value: boolean) => void
}

export default function TemplateContainer(props: TemplateContainerProps) {
	const [templateList, setTemplateList] = createSignal<{ value: string; label: string }[]>([])

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
		setSelected(groupId)
		setSelectedItem(itemId)
		props.setIsFullElements(true)
		selectedSectionItemEl()?.focus()
		setIsEditingItem({ status: "editing", id: itemId, label: "all" })
	}

	const handleViewItem = (itemId: ElementID, groupId: GroupID) => {
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

	return (
		<div class="flex flex-col gap-2 h-full px-4 overflow-auto scrollbar-gutter">
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
					when={
						[...(templates.get(selectedTemplateGroup()!)?.sections.get(selectedTemplateVersion()!)?.values() ?? [])]
							.length === 0
					}
					fallback={
						<For
							each={[...(templates.get(selectedTemplateGroup()!)?.sections.get(selectedTemplateVersion()!)?.values() ?? [])]}
						>
							{(section: TemplateSection) => {
								const [mouseOverSection, setMouseOverSection] = createSignal<TemplateSectionID | null>(null)
								const [mouseOverItem, setMouseOverItem] = createSignal<ElementID | null>(null)
								const [sectionName, setSectionName] = createSignal("")

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
															<div class="flex items-center bg-background/50 rounded-md p-1 ml-1 mr-1 cursor-pointer">
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
																	Number(templates.get(selectedTemplateGroup()!)?.versionCounter) === Number(selectedTemplateVersion())
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
																				<DropdownMenuSubTrigger>
																					<div class="i-solar:download-linear w-1.25em h-1.25em mr-2" />
																					Move Section
																				</DropdownMenuSubTrigger>
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
																			id={uniqueId}
																			type="button"
																			class={cn(
																				"w-98% flex flex-col items-start gap-2 rounded-lg border border-muted/60 ml-2 text-left text-sm transition-all cursor-default",
																				mouseOverItem() === item.id && "bg-background/50 border-accent/25  transition-none",
																				selectedSectionItem() === item.id &&
																					selectedSection() === section.id &&
																					"bg-background/50 border-accent/25   transition-none rounded-md"
																			)}
																			ref={setEl}
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
																					<div class="flex items-center bg-background/50 rounded-md p-1 mx-2 cursor-pointer">
																						<div class="i-material-symbols-light:drag-indicator w-1.25em h-1.25em"></div>
																					</div>
																					<div class="flex">
																						<div
																							class={cn(
																								"font-semibold text-[0.6rem] capitalize truncate ",
																								elementToElementMatch() && "text-success"
																							)}
																						>
																							{entityItems.get(item.group)?.get(item.id)?.name}
																						</div>
																					</div>
																					<div class={cn("ml-auto text-[0.6rem] text-foreground/40 flex items-center mr-1")}>
																						<Show when={elementToElementMatch()}>
																							<div class="i-mdi:checkbox-blank-circle text-success w-1em h-1em mr-1"></div>
																						</Show>

																						<div class="truncate mr-2">{entityGroups.get(item.group)?.name}</div>
																					</div>
																					<Show
																						when={
																							isSelected().selected === "selected" &&
																							selectedSectionItem() === item.id &&
																							selectedSection() === section.id
																						}
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
																									"items-center justify-center text-[0.6rem] text-foreground/40 flex items-center mr-2 ml-2 px-1 rounded-0.75 hover:cursor-pointer",
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
																			<div class="w-full text-[0.6rem] text-foreground/40 space-y-0.25 flex flex-col items-center">
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
					}
				>
					<div class="flex flex-col items-center justify-center h-full">
						<div class="text-2xl font-bold mb-4">No sections yet</div>
						<div class="text-gray-600 mb-6">Create your first section to get started!</div>
					</div>
				</Show>
			</Show>
		</div>
	)
}
