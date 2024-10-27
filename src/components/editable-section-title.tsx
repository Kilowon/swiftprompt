import { Accessor, onMount } from "solid-js"
import { TextField, TextFieldInput } from "~/registry/ui/text-field"
import { Button } from "~/registry/ui/button"

export const EditableSectionTitle = (props: {
	name?: string
	inputValueSectionTitle: Accessor<string>
	setInputValueSectionTitle: (value: string) => void
	handleSectionNameChange: (value: string) => void
}) => {
	const handleKeyDown = (e: KeyboardEvent) => {
		if (((e.key === "s" || e.key === "S") && (e.ctrlKey || e.metaKey)) || e.key === "Enter") {
			e.preventDefault()
			e.stopPropagation()
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				console.log("Enter Key Pressed")
				props.setInputValueSectionTitle(e.target.value)
				props.handleSectionNameChange(e.target.value)
			}
		}
	}

	const focusElement = (el: HTMLSpanElement) => {
		onMount(() => el.focus())
	}

	let inputRef: HTMLSpanElement | undefined

	return (
		<div class="flex items-center  ml-2 min-h-12">
			<TextField>
				<TextFieldInput
					ref={(el: HTMLSpanElement) => {
						inputRef = el
						if (el) focusElement(el)
					}}
					type="text"
					value={props.name}
					placeholder={` Section Title...`}
					onChange={(e: any) => props.setInputValueSectionTitle(e.target.value)}
					onKeyDown={(e: any) => handleKeyDown(e)}
					onBlur={(e: any) => {
						props.setInputValueSectionTitle(e.target.value)
						props.handleSectionNameChange(e.target.value)
					}}
					class="w-full h-8 border-none outline-none  text-[0.8rem] bg-background px-1 py-0.5  font-bold capitalize"
				></TextFieldInput>
			</TextField>
			<Button
				class="flex items-center ml-2 "
				variant="ghost"
				size="icon"
				onClick={(e: any) => {
					props.setInputValueSectionTitle(e.target.value)
					props.handleSectionNameChange(e.target.value)
				}}
			>
				<div class="i-solar:pen-new-square-linear w-4 h-4" />
			</Button>
		</div>
	)
}
