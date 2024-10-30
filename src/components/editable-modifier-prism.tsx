import { Editor } from "solid-prism-editor"
import { basicSetup } from "solid-prism-editor/setups"
import "solid-prism-editor/prism/languages/markdown"
import "solid-prism-editor/prism/languages/jsx"
import "solid-prism-editor/prism/languages/tsx"
import "solid-prism-editor/languages/jsx"
import "solid-prism-editor/layout.css"
//import "solid-prism-editor/themes/github-dark.css"
import "~/Themes/theme.css"
import "solid-prism-editor/search.css"
import { cursorPosition } from "solid-prism-editor/cursor"
import { matchBrackets } from "solid-prism-editor/match-brackets"
import { highlightBracketPairs } from "solid-prism-editor/highlight-brackets"
import { indentGuides } from "solid-prism-editor/guides"
import { highlightSelectionMatches, searchWidget } from "solid-prism-editor/search"
import { highlightMatchingTags, matchTags } from "solid-prism-editor/match-tags"
import { Modifier } from "~/types/entityType"
import { Accessor } from "solid-js"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { Button } from "~/registry/ui/button"
import { cn } from "~/lib/utils"
import { TextField, TextFieldLabel } from "~/registry/ui/text-field"
import { createShortcut } from "@solid-primitives/keyboard"

export const EditableModifierPrism = (props: {
	item: Modifier
	inputValueBody: Accessor<string>
	setInputValueBody: (value: string) => void
	body?: string
	handleSave: () => void
	setIsPrism: (value: boolean) => void
	setPrismValue: (value: string) => void
}) => {
	createShortcut(
		["Control", "S"],
		() => {
			props.handleSave()
		},
		{
			preventDefault: true
		}
	)

	return (
		<div class="w-full h-full  relative">
			<span class="text-[0.65rem] absolute top-5 left-0">Prism Editor</span>
			<div class="w-full h-full mt-11 min-h-40 max-h-60 overflow-y-auto scrollbar-default scrollbar-gutter">
				<Editor
					wordWrap={true}
					readOnly={false}
					lineNumbers={true}
					language="markdown"
					value={props.inputValueBody()}
					onUpdate={props.setPrismValue}
					extensions={[
						matchBrackets(),
						highlightBracketPairs(),
						indentGuides(),
						highlightSelectionMatches(),
						searchWidget(),
						highlightMatchingTags(),
						matchTags(),
						cursorPosition()
					]}
				/>
			</div>
		</div>
	)
}
