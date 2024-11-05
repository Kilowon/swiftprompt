import { createUniqueId, createSignal, For, Show } from "solid-js"
import { cn } from "~/lib/utils"
import { ModifierGroupID, ModifierID, TemplateField, TemplateFieldID } from "~/types/entityType"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { setSelectedTemplateField, entityModifiers } from "~/global_state"

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
							<div class="flex items-center justify-between w-full gap-2 truncate">
								{/* Field Name - 1/3 width */}
								<div class="flex-1 bg-accent/5 rounded-md px-2 py-1">
									<div class="text-[0.65rem] flex items-center gap-1">
										<span class="font-mono">Field:</span>
										<span class="font-medium text-foreground/70">{field.name}</span>
									</div>
								</div>

								{/* Modifier - 1/3 width */}

								<div class="flex-1 bg-accent/5 rounded-md px-2 py-1">
									<div class="text-[0.65rem] flex items-center gap-1">
										<span class="font-mono">Modifier:</span>
										<Show when={field.modifierId === ""}>
											<Tooltip>
												<TooltipTrigger>
													<div class="i-mdi:alert-decagram-outline text-warning/80 w-4 h-4 animate-pulse" />
												</TooltipTrigger>
												<TooltipContent>No modifier selected</TooltipContent>
											</Tooltip>
										</Show>
										<span class="font-medium text-foreground/70">
											{entityModifiers.get(field.modifierGroupId as ModifierGroupID)?.get(field.modifierId as ModifierID)?.name}
										</span>
									</div>
								</div>

								{/* Field Type - 1/3 width */}
								<div class="flex-1 bg-accent/5 rounded-md px-2 py-1">
									<div class="text-[0.65rem] flex items-center gap-1">
										<span class="font-mono">Field Type:</span>
										<span class="font-medium text-foreground/70">{field.type}</span>
									</div>
								</div>
							</div>
						</div>
					</button>
				)
			}}
		</For>
	)
}
