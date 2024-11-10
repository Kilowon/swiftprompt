import { Accessor, onMount, createEffect } from "solid-js"
import { PromptItem } from "~/types/entityType"
import { TextField, TextFieldInput } from "~/registry/ui/text-field"

export const EditableGroupTitle = (props: {
	item: PromptItem
	name?: string
	inputValueTitle: Accessor<string>
	setInputValueTitle: (value: string) => void
	handleNameChange: (value: string) => void
}) => {
	const handleKeyDown = (e: KeyboardEvent) => {
		if (((e.key === "s" || e.key === "S") && (e.ctrlKey || e.metaKey)) || e.key === "Enter") {
			e.preventDefault()
			e.stopPropagation()
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				props.setInputValueTitle(e.target.value)
				props.handleNameChange(e.target.value)
			}
		}
	}

	createEffect(() => {
		if (props.item?.name) {
			props.setInputValueTitle(props.item?.name || "")
		}
	})

	const focusElement = (el: HTMLSpanElement) => {
		onMount(() => el.focus())
	}

	let inputRef: HTMLSpanElement | undefined

	return (
		<div class="flex items-center">
			<TextField>
				<TextFieldInput
					ref={(el: HTMLSpanElement) => {
						inputRef = el
						if (el) focusElement(el)
					}}
					type="text"
					autocomplete="off"
					value={props.inputValueTitle()}
					placeholder={` Group Title...`}
					onChange={(e: any) => props.setInputValueTitle(e.target.value)}
					onKeyDown={(e: any) => handleKeyDown(e)}
					onBlur={(e: any) => {
						props.setInputValueTitle(e.target.value)
						props.handleNameChange(e.target.value)
					}}
					class="w-full min-h-6 h-8 border-none outline-none  text-xs bg-background px-1 py-0.5 text-sm font-bold capitalize"
				/>
			</TextField>
		</div>
	)
}
