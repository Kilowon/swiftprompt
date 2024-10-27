import { Accessor, onMount } from "solid-js"
import { TextField, TextFieldInput } from "~/registry/ui/text-field"

export const EditableTemplateTitle = (props: {
	name?: string
	inputValueTemplateTitle: Accessor<string>
	setInputValueTemplateTitle: (value: string) => void
	handleTemplateNameChange: (value: string) => void
}) => {
	const handleKeyDown = (e: KeyboardEvent) => {
		if (((e.key === "s" || e.key === "S") && (e.ctrlKey || e.metaKey)) || e.key === "Enter") {
			e.preventDefault()
			e.stopPropagation()
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				props.setInputValueTemplateTitle(e.target.value)
				props.handleTemplateNameChange(e.target.value)
			}
		}
	}

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
					value={props.name}
					placeholder={` Template Title...`}
					onChange={(e: any) => props.setInputValueTemplateTitle(e.target.value)}
					onKeyDown={(e: any) => handleKeyDown(e)}
					onBlur={(e: any) => {
						props.setInputValueTemplateTitle(e.target.value)
						props.handleTemplateNameChange(e.target.value)
					}}
					class="w-full min-h-6 h-8 border-none outline-none text-[0.8rem]   bg-background px-1 py-0.5  font-bold capitalize"
				/>
			</TextField>
		</div>
	)
}
