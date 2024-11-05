import { Editor } from "solid-prism-editor"
import "solid-prism-editor/prism/languages/markdown"
import "solid-prism-editor/prism/languages/jsx"
import "solid-prism-editor/prism/languages/tsx"
import "solid-prism-editor/languages/jsx"
import "solid-prism-editor/layout.css"
import "~/Themes/theme.css"
import "solid-prism-editor/search.css"
import { cursorPosition } from "solid-prism-editor/cursor"
import { matchBrackets } from "solid-prism-editor/match-brackets"
import { highlightBracketPairs } from "solid-prism-editor/highlight-brackets"
import { indentGuides } from "solid-prism-editor/guides"
import { highlightSelectionMatches, searchWidget } from "solid-prism-editor/search"
import { highlightMatchingTags, matchTags } from "solid-prism-editor/match-tags"
import { PromptItem } from "~/types/entityType"
import { Accessor } from "solid-js"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { Button } from "~/registry/ui/button"
import { cn } from "~/lib/utils"
import { createShortcut } from "@solid-primitives/keyboard"

export const EditableElementPrism = (props: {
	item: PromptItem
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
			<div class="w-full h-full mt-11 min-h-40 max-h-100 text-[0.8rem] overflow-y-auto scrollbar-default scrollbar-gutter">
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

			<div class="flex items-center justify-end gap-2 absolute top-0 right-0">
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
							props.setIsPrism(false)
						}}
					>
						<div class="i-gala:editor w-1.25em h-1.25em"></div>
						<span class="sr-only">Text Editor</span>
					</TooltipTrigger>
					<TooltipContent>Text Editor</TooltipContent>
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
	)
}
