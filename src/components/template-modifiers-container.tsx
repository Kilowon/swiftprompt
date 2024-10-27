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
	selectedTemplateVersion
} from "~/global_state"
import {
	ElementID,
	GlobalModifiersID,
	GroupID,
	ModifierID,
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

export default function TemplateModifiersContainer() {
	const [templateList, setTemplateList] = createSignal<{ value: string; label: string }[]>([])

	createEffect(() => {
		setTemplateList(
			[...templates.keys()].map(group => ({
				value: group.toString(),
				label: templates.get(group)?.name ?? ""
			}))
		)
	})

	const test_data = [
		{
			title: "Global Fields",
			id: "1" as unknown as GlobalModifiersID,
			items: [{ id: "1" as unknown as ModifierID, group: "1" as unknown as GroupID }] // Changed group type
		}
	]

	return (
		<div class="flex flex-col gap-2 h-full px-4 pb-4 overflow-auto scrollbar-gutter">
			<Show when={[...templates.keys()].length > 0 && selectedTemplateGroup() !== null}>
				<Show
					when={
						[...(templates.get(selectedTemplateGroup()!)?.sections.get(selectedTemplateVersion()!)?.values() ?? [])]
							.length === 0
					}
					fallback={
						<For each={test_data}>
							{(section: { title: string; id: GlobalModifiersID; items: { id: ModifierID; group: GroupID }[] }) => {
								const [mouseOverSection, setMouseOverSection] = createSignal<GlobalModifiersID | null>(null)
								const [mouseOverItem, setMouseOverItem] = createSignal<ElementID | null>(null)

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
															<div class="flex items-center gap-2">
																<div class="text-[0.8rem] font-semibold pl-2 min-h-8 flex items-center">{section.title || ""}</div>
															</div>

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
																			<DropdownMenuItem>
																				<div class="i-octicon:duplicate-16 w-1.25em h-1.25em mr-2"></div>
																				Duplicate Section
																			</DropdownMenuItem>

																			<DropdownMenuItem>
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
														<For each={test_data[0].items}>
															{(item: { id: ModifierID; group: GroupID }) => {
																const uniqueId = createUniqueId()
																const [el, setEl] = createSignal<HTMLButtonElement | undefined>()
																const [isSelected, setIsSelected] = createSignal<{ selected: "selected" | "unselected" }>({
																	selected: "unselected"
																})

																const [elementToElementMatch, setElementToElementMatch] = createSignal<boolean>(false)

																createEffect(() => {
																	setElementToElementMatch(item.id === selectedItem())
																})

																createEffect(() => {
																	if (el()) {
																		el()!.id = uniqueId
																	}
																})

																return (
																	<button
																		id={uniqueId}
																		type="button"
																		class={cn(
																			"flex flex-col items-start gap-2 rounded-lg border  border-muted/60 mx-2 text-left text-sm transition-all cursor-default",
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
																		<div class="flex w-full flex-col min-h-10 max-h-10 flex justify-center">
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
																			</div>
																		</div>
																	</button>
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
