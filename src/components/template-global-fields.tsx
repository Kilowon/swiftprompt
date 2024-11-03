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
	entityModifiers
} from "~/global_state"
import {
	ElementID,
	GlobalModifiersID,
	GroupID,
	ModifierID,
	TemplateGroupID,
	TemplateSection,
	TemplateSectionID,
	TemplateField,
	Item
} from "~/types/entityType"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "~/registry/ui/tooltip"
import { ReactiveSet } from "@solid-primitives/set"

export default function TemplateGlobalFields() {
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

	const uniqueGlobalFields = () => {
		const templateGroup = templates.get(selectedTemplateGroup()!)
		const sections = templateGroup?.sections.get(selectedTemplateVersion()!)

		if (!sections) return new ReactiveSet()

		return [...sections.values()].reduce((acc, section) => {
			section.items?.forEach((item: Item) => {
				item.fields?.forEach((field: TemplateField) => {
					if (field.type === "global") {
						acc.add(field)
					}
				})
			})
			return acc
		}, new ReactiveSet())
	}

	createEffect(() => {
		console.log("uniqueGlobalFields", uniqueGlobalFields())
	})

	return (
		<div class="flex flex-col gap-2 h-full px-4 pb-4 overflow-auto scrollbar-gutter">
			<Show when={uniqueGlobalFields().size > 0}>
				<For each={test_data}>
					{(section: { title: string; id: GlobalModifiersID; items: { id: ModifierID; group: GroupID }[] }) => {
						const [mouseOverSection, setMouseOverSection] = createSignal<GlobalModifiersID | null>(null)
						const [mouseOverItem, setMouseOverItem] = createSignal<ElementID | null>(null)
						const [isFieldsSelected, setIsFieldsSelected] = createSignal<boolean>(false)
						return (
							<Button
								variant="no_format"
								size="no_format"
								class={cn(
									"flex flex-col items-start justify-start gap-2 border border-muted/60 text-left text-sm transition-all mt-2 cursor-default",
									mouseOverSection() === section.id &&
										selectedSection() !== section.id &&
										"bg-background-secondary border-accent/60 ring-accent  transition-none ",
									selectedSection() === section.id && "bg-background-secondary ring-1 border-accent ring-accent  transition-none"
								)}
								onClick={() => setSelectedSection(section.id)}
								onMouseEnter={() => setMouseOverSection(section.id)}
								onMouseLeave={() => setMouseOverSection(null)}
							>
								<div class="flex w-full flex-col gap-1 mx-1 my-1">
									<div>
										<div class="flex flex-col items-center gap-1 mx-1">
											<div class="w-full">
												<div class="flex items-center">
													<div class="flex items-center gap-2">
														<div class="text-[0.6rem] font-semibold pl-2 min-h-8 flex items-center">{section.title}</div>
													</div>

													<div class="ml-auto">
														<Show when={true}>
															<div
																onclick={() => {
																	setIsFieldsSelected(!isFieldsSelected())
																}}
																class={cn(
																	"items-center justify-center text-[0.6rem] text-foreground/40 flex items-center mr-2 ml-2 px-1 rounded-0.75 bg-accent/15 hover:cursor-pointer hover:text-primary-foreground hover:bg-primary",
																	isFieldsSelected() && "text-primary-foreground bg-primary"
																	//!isFieldsSelected() && " bg-error text-error-foreground"
																	//!isFieldsSelected() && " text-warning bg-warning/15"
																	//!isFieldsSelected() && " bg-success text-success-foreground"
																)}
															>
																Fields
															</div>
														</Show>
													</div>
												</div>
											</div>
											<Show when={isFieldsSelected()}>
												<hr class="w-full border-muted/60 " />
												<div class="flex flex-col gap-1 w-full overflow-auto min-h-8">
													<For
														each={[...uniqueGlobalFields()].filter(
															(field, index, self) => index === self.findIndex(f => f.name === field.name)
														)}
													>
														{(item: TemplateField) => {
															const uniqueId = createUniqueId()
															const [el, setEl] = createSignal<HTMLButtonElement | undefined>()
															const [isSelected, setIsSelected] = createSignal<{ selected: "selected" | "unselected" }>({
																selected: "unselected"
															})

															const [elementToElementMatch, setElementToElementMatch] = createSignal<boolean>(false)

															createEffect(() => {
																setElementToElementMatch(item.templateFieldId === selectedItem())
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
																		mouseOverItem() === item.templateFieldId && "bg-background/50 border-accent/25  transition-none",
																		selectedSectionItem() === item.templateFieldId &&
																			selectedSection() === section.id &&
																			"bg-background/50 border-accent/25   transition-none rounded-md"
																	)}
																	ref={setEl}
																	onClick={() => {
																		setSelectedSectionItem(item.templateFieldId as ElementID)

																		if (el()?.id === uniqueId) {
																			setIsSelected({ selected: "selected" })
																		}
																	}}
																	onMouseEnter={() => setMouseOverItem(item.templateFieldId as ElementID)}
																	onMouseLeave={() => setMouseOverItem(null)}
																>
																	<div class="flex w-full flex-col min-h-10 max-h-10 flex justify-center">
																		<div class="flex items-center justify-between w-full">
																			<div class="flex">
																				<div
																					class={cn(
																						"font-semibold text-[0.6rem] ml-2 capitalize truncate",
																						elementToElementMatch() && "text-success"
																					)}
																				>
																					{item.name}
																				</div>
																			</div>
																			<div class={cn("ml-auto text-[0.6rem] text-foreground/40 flex items-center mr-1")}>
																				<Show when={elementToElementMatch()}>
																					<div class="i-mdi:checkbox-blank-circle text-success w-1em h-1em mr-1"></div>
																				</Show>
																				<div class="truncate mr-2">{item.type}</div>
																			</div>
																			<Show
																				when={
																					isSelected().selected === "selected" &&
																					selectedSectionItem() === item.templateFieldId &&
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
																						<TooltipContent>View Modifier</TooltipContent>
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
																							<TooltipContent>Remove from Fields</TooltipContent>
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
											</Show>
										</div>
									</div>
								</div>
							</Button>
						)
					}}
				</For>
			</Show>
		</div>
	)
}
