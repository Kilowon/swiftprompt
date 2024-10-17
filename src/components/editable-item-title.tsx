import { Accessor, onMount } from "solid-js"
import { PromptItem } from "~/types/entityType"
import { TextField, TextFieldInput, TextFieldLabel } from "~/registry/ui/text-field"

export const EditableItemTitle = (props: {
	item: PromptItem
	name?: string
	inputValueTitle: Accessor<string>
	setInputValueTitle: (value: string) => void
	handleSave: () => void
}) => {
	const handleKeyDown = (e: any) => {
		if (((e.key === "s" || e.key === "S") && (e.ctrlKey || e.metaKey)) || e.key === "Enter") {
			e.preventDefault()
			e.stopPropagation()
			props.setInputValueTitle(e.target.value)
			props.handleSave()
		}
	}

	const focusElement = (el: HTMLSpanElement) => {
		onMount(() => el.focus())
	}

	let inputRef: HTMLSpanElement | undefined

	return (
		<div>
			<TextField>
				<TextFieldLabel class="text-[0.65rem]">Title</TextFieldLabel>
				<TextFieldInput
					ref={(el: HTMLSpanElement) => {
						inputRef = el
						if (el) focusElement(el)
					}}
					type="text"
					value={props.inputValueTitle()}
					onChange={(e: any) => props.setInputValueTitle(e.target.value)}
					onKeyDown={(e: any) => handleKeyDown(e)}
					placeholder={` Title...`}
					class="w-full min-h-6 h-8 border-none outline-none  text-xs bg-background px-1 py-0.5"
				>
					{props.name || "\u200B"}
				</TextFieldInput>
			</TextField>
		</div>
	)
}
