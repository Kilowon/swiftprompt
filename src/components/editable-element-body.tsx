import { Show, Accessor } from "solid-js"
import { isEditingItem } from "../global_state"
import { Button } from "~/registry/ui/button"
import { PromptItem } from "~/types/entityType"
import { TextField, TextFieldLabel, TextFieldTextArea } from "~/registry/ui/text-field"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { cn } from "~/lib/utils"

export const EditableElementBody = (props: {
	item: PromptItem
	inputValueBody: Accessor<string>
	setInputValueBody: (value: string) => void
	body?: string
	handleSave: () => void
	setIsPrism: (value: boolean) => void
}) => {
	const handleKeyDown = (e: KeyboardEvent) => {
		if ((e.key === "s" || e.key === "S") && e.ctrlKey && e.target instanceof HTMLTextAreaElement) {
			e.preventDefault()
			props.setInputValueBody(e.target.value)
			props.handleSave()
		}
	}

	return (
		<Show when={isEditingItem().status === "editing" && isEditingItem().id === props.item.id}>
			<div class="relative mt-5">
				<TextField>
					<TextFieldLabel class="text-[0.65rem]">Text Editor</TextFieldLabel>
					<TextFieldTextArea
						class="p-4 min-h-40 max-h-60 overflow-y-auto"
						value={props.inputValueBody()}
						onChange={(e: any) => props.setInputValueBody(e.target.value)}
						onKeyDown={(e: any) => handleKeyDown(e)}
						placeholder={`Type Prompt Fragment...`}
						autoResize={true}
					/>
				</TextField>
				<div class="flex items-center justify-end gap-2 absolute top--5 right-0">
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant="ghost"
							size="icon"
							class={cn("transition-opacity duration-200 opacity-100 text-accent hover:text-accent-foreground")}
							onClick={() => {
								props.setIsPrism(true)
							}}
						>
							<div class="i-tabler:prism w-1.25em h-1.25em"></div>
							<span class="sr-only">Prism Editor</span>
						</TooltipTrigger>
						<TooltipContent>Prism Editor</TooltipContent>
					</Tooltip>
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant="ghost"
							size="icon"
							class={cn("transition-opacity duration-200 opacity-100 text-accent hover:text-accent-foreground")}
							onClick={() => {
								console.log("Generate Prompt")
							}}
						>
							<div class="i-ion:sparkles-sharp w-1.25em h-1.25em"></div>
							<span class="sr-only">AI Generate Prompt</span>
						</TooltipTrigger>
						<TooltipContent>AI Generate Prompt (Coming Soon)</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</Show>
	)
}
