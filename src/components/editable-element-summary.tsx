import { PromptItem } from "~/types/entityType"
import { TextField, TextFieldInput, TextFieldLabel } from "~/registry/ui/text-field"

export const EditableElementSummary = (props: {
	item: PromptItem
	summary?: string
	inputValueSummary: string
	setInputValueSummary: (value: string) => void
	handleSave: () => void
}) => {
	const handleKeyDown = (e: any) => {
		if (((e.key === "s" || e.key === "S") && (e.ctrlKey || e.metaKey)) || e.key === "Enter") {
			e.preventDefault()
			e.stopPropagation()
			props.setInputValueSummary(e.target.value)
			props.handleSave()
		}
	}

	return (
		<div>
			<TextField>
				<TextFieldLabel class="text-[0.65rem]">Summary</TextFieldLabel>
				<TextFieldInput
					type="text"
					value={props.inputValueSummary}
					placeholder={` Summary...`}
					onChange={(e: any) => props.setInputValueSummary(e.target.value)}
					onKeyDown={(e: any) => handleKeyDown(e)}
					class=" w-full min-h-6 h-8 border-none outline-none text-xs bg-background px-1 py-0.5"
				>
					{props.summary || "\u200B"}
				</TextFieldInput>
			</TextField>
		</div>
	)
}
