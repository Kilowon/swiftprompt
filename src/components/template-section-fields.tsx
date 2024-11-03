import { createUniqueId, createSignal, For, Show } from "solid-js"
import { cn } from "~/lib/utils"
import { ModifierGroupID, ModifierID, TemplateField, TemplateFieldID } from "~/types/entityType"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { Button } from "~/registry/ui/button"
import { selectedTemplateField, setSelectedTemplateField, entityModifiers } from "~/global_state"

interface TemplateSectionFieldsProps {
	fields: TemplateField[] | undefined
}

export default function TemplateSectionFields(props: TemplateSectionFieldsProps) {
	const uniqueId = createUniqueId()
	const [el, setEl] = createSignal<HTMLButtonElement | undefined>()
	const [isSelected, setIsSelected] = createSignal<{ selected: "selected" | "unselected" }>({
		selected: "unselected"
	})
	const [selectedField, setSelectedField] = createSignal<TemplateFieldID | null>(null)
	const [mouseOverField, setMouseOverField] = createSignal<TemplateFieldID | null>(null)

	return (
		<For each={props.fields}>
			{field => {
				return (
					<button
						id={uniqueId}
						type="button"
						class={cn(
							"w-97% flex flex-col items-start gap-2 rounded-lg",
							"border-l-4 border border-l-accent border-accent/10",
							"ml-2 text-left text-sm transition-all",
							"hover:animate-pulse hover:shadow-md",
							"cursor-default backdrop-blur-sm",
							mouseOverField() === field.templateFieldId && "bg-accent/5 border-accent/30",
							selectedField() === field.templateFieldId && [
								"bg-accent/10",
								"border-accent/40",
								"shadow-inner",
								"shadow-accent/5"
							]
						)}
						ref={setEl}
						onClick={() => {
							setSelectedTemplateField(field.templateFieldId || null)
							setSelectedField(field.templateFieldId || null)
						}}
						onMouseEnter={() => setMouseOverField(field.templateFieldId || null)}
						onMouseLeave={() => setMouseOverField(null)}
					>
						<div class="w-full flex flex-col min-h-10 max-h-10 justify-center px-3 py-1">
							<div class="flex items-center justify-between w-full">
								<div class="flex ml-2 gap-2">
									<div class={cn("text-foreground/40 text-[0.65rem] bg-accent/5 rounded-md px-1 flex items-center gap-1")}>
										<span class="opacity-50">Field:</span>
										{field.name}
									</div>
									<Show when={field.modifierId !== ""}>
										<div class="text-foreground/40 text-[0.65rem] bg-accent/5 rounded-md px-1 flex items-center gap-1">
											<span class="opacity-50">Modifier:</span>
											{entityModifiers.get(field.modifierGroupId as ModifierGroupID)?.get(field.modifierId as ModifierID)?.name}
										</div>
									</Show>
								</div>
								<div class={cn("ml-auto text-[0.65rem] text-foreground/40 flex items-center mr-1")}>
									<Show when={field.modifierId === ""}>
										<div class="i-mdi:checkbox-blank-circle text-warning w-1em h-1em mr-1"></div>
									</Show>

									<div class="text-foreground/40 text-[0.65rem] bg-accent/5 rounded-md px-1 flex items-center gap-1">
										<span class="opacity-50">Field Type:</span>
										{field.type}
									</div>
								</div>
								<Show
									when={selectedField() === field.templateFieldId}
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
												onClick={() => {}}
												variant="ghost"
												size="icon"
												class=" text-accent hover:text-accent-foreground max-h-8"
											>
												<div class="i-mdi:file-eye w-1.25em h-1.25em"></div>

												<span class="sr-only">View Element</span>
											</TooltipTrigger>
											<TooltipContent>View Modifier</TooltipContent>
										</Tooltip>

										<Show when={true}>
											<Tooltip
												openDelay={1000}
												closeDelay={0}
											>
												<TooltipTrigger
													as={Button}
													onClick={() => {}}
													variant="ghost"
													size="icon"
													class=" text-accent hover:text-accent-foreground max-h-8"
												>
													<div class="i-mdi:file-document-remove w-1.25em h-1.25em" />

													<span class="sr-only">Remove from Template</span>
												</TooltipTrigger>
												<TooltipContent>Remove Modifier</TooltipContent>
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
	)
}
