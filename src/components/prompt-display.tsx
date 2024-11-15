import { Show, createSignal, createEffect, createMemo } from "solid-js"
import { Button } from "~/registry/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/registry/ui/dropdown-menu"
import { Separator } from "~/registry/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { templates, selectedTemplateGroup, entityItems, selectedTemplateVersion, entityModifiers } from "~/global_state"
import { writeClipboard } from "@solid-primitives/clipboard"
import { toast } from "solid-sonner"
import { Editor } from "solid-prism-editor"
import "solid-prism-editor/prism/languages/markdown"
import "solid-prism-editor/prism/languages/jsx"
import "solid-prism-editor/prism/languages/tsx"
import "solid-prism-editor/languages/jsx"
import "solid-prism-editor/layout.css"
import "solid-prism-editor/copy-button.css"
import "~/Themes/theme.css"
import "solid-prism-editor/search.css"
import { cursorPosition } from "solid-prism-editor/cursor"
import { matchBrackets } from "solid-prism-editor/match-brackets"
import { highlightBracketPairs } from "solid-prism-editor/highlight-brackets"
import { indentGuides } from "solid-prism-editor/guides"
import { highlightSelectionMatches, searchWidget } from "solid-prism-editor/search"
import { highlightMatchingTags, matchTags } from "solid-prism-editor/match-tags"
import { copyButton } from "solid-prism-editor/copy-button"
import { defaultCommands, editHistory } from "solid-prism-editor/commands"

import { PromptItem, TemplateField, TemplateSection } from "~/types/entityType"

export default function PromptDisplay() {
	const [tokenCount, setTokenCount] = createSignal(0)
	const [screenWriter, setScreenWriter] = createSignal<string | "">("")
	const [promptWriter, setPromptWriter] = createSignal<string | "">("")
	const [systemMode, setSystemMode] = createSignal(false)

	const contentCounter = createMemo(() => {
		const body = screenWriter()
		const wordCount = body.trim() ? body.split(/\s+/).filter(word => word !== "").length : 0
		return { wordCount }
	})

	const estimateTokens = (wordCount: number): number => {
		return Math.ceil(wordCount * 1.33)
	}

	const handleSaveSystemPrompt = () => {
		if (!screenWriter()) {
			toast("No content to save", { duration: 2000, position: "bottom-center" })
			return
		}
		const content = promptWriter() === "" ? screenWriter() : promptWriter()
		const templateGroup = templates.get(selectedTemplateGroup()!)
		const templateName = templateGroup?.name
		const version = selectedTemplateVersion()
		const metadata = `---\nversion: ${version}\n---\n\n`
		const contentWithMetadata = metadata + content
		const blob = new Blob([contentWithMetadata], { type: "text/markdown;charset=utf-8" })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = `${templateName}_v${version}.md`
		link.click()
		URL.revokeObjectURL(url)
		toast(
			<div class="flex items-center gap-2">
				<div class="i-material-symbols:check-box w-4 h-4 text-success" />
				<span class="text-xs font-medium">System Prompt saved!</span>
			</div>,
			{ duration: 2000, position: "bottom-center" }
		)
	}

	function replaceDelimiters(inputString: string, values: any) {
		return inputString.replace(/\$?{{(.*?)}}/g, (match: string, p1: string) => {
			const key = p1.trim()
			const lowerKey = key.toLowerCase()
			return values[lowerKey] || values[key] || match
		})
	}

	createEffect(() => {
		const totalTokens = estimateTokens(contentCounter().wordCount)
		setTokenCount(totalTokens)
	})

	createEffect(() => {
		const templateGroup = templates.get(selectedTemplateGroup()!)
		if (!templateGroup) {
			setScreenWriter("")
			return
		}
		const sections = templateGroup.sections.get(selectedTemplateVersion()!)
		if (!sections) return

		const content = Array.from(sections.values())
			.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
			.flatMap((section: any) => [
				`${section.name}`,
				...(section.items?.map((item: PromptItem) => {
					const versionCounter = entityItems.get(item.group)?.get(item.id)?.versionCounter ?? 0
					const body = entityItems.get(item.group)?.get(item.id)?.body?.get(versionCounter) ?? ""
					const fields =
						section.items
							.find((i: TemplateSection) => i.id === item.id)
							?.fields.reduce((acc: Record<string, string>, field: TemplateField) => {
								const modifier =
									field.modifierGroupId && field.modifierId
										? entityModifiers.get(field.modifierGroupId)?.get(field.modifierId)?.modifier
										: ""
								return {
									...acc,
									[field.name]: modifier || ""
								}
							}, {}) ?? {}

					const replacedContent = replaceDelimiters(body, fields)
					return replacedContent
				}) ?? [])
			])
			.join("\n\n")

		setScreenWriter(content)
	})
	const handleCopyToClipboard = () => {
		writeClipboard(promptWriter() === "" ? screenWriter() : promptWriter())
	}

	return (
		<div class="flex h-full flex-col">
			<div class="flex items-center p-2 space-x-2 justify-between">
				<div class="text-xs text-muted-foreground  font-bold ml-3">Tokens: {tokenCount()}</div>

				<div class="flex items-center space-x-2">
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant="ghost"
							size="icon"
							onClick={() => {
								handleCopyToClipboard()
								toast(
									<div class="flex items-center gap-2">
										<div class="i-material-symbols:check-box w-4 h-4 text-success" />
										<span class="text-xs font-medium">Prompt copied to clipboard!</span>
									</div>,
									{ duration: 2000, position: "bottom-center" }
								)
							}}
						>
							<div class="i-mdi:clipboard-arrow-down w-1.25em h-1.25em"></div>
						</TooltipTrigger>
						<TooltipContent>System Prompt to Clipboard</TooltipContent>
					</Tooltip>
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant="ghost"
							size="icon"
							onClick={handleSaveSystemPrompt}
						>
							<div class="i-bxs:file-md w-1.25em h-1.25em"></div>
						</TooltipTrigger>
						<TooltipContent>Save System Prompt as Markdown File</TooltipContent>
					</Tooltip>
					<DropdownMenu placement="bottom-end">
						<DropdownMenuTrigger
							as={Button}
							variant="ghost"
							size="icon"
						>
							<div class="i-mdi:dots-vertical w-1.25em h-1.25em"></div>
							<span class="sr-only">More</span>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>Mark as unread</DropdownMenuItem>
							<DropdownMenuItem>Star thread</DropdownMenuItem>
							<DropdownMenuItem>Add label</DropdownMenuItem>
							<DropdownMenuItem>Mute thread</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<Separator />

			<div class="flex flex-1 flex-col h-100% overflow-y-auto">
				<Show
					when={screenWriter()}
					fallback={
						<div class="flex-1 flex items-center justify-center">
							<div class="text-center">
								<div class="i-mdi:file-document-outline w-12 h-12 mx-auto mb-4 text-muted-foreground"></div>
								<p class="text-sm text-muted-foreground">Select a template to view content</p>
								<span class="text-xs text-muted-foreground">Ctrl + Shift + V to view hotkeys .</span>
							</div>
						</div>
					}
				>
					<div class="whitespace-pre-wrap p-4 text-[0.8rem] text-muted-foreground h-100% overflow-y-auto scrollbar-default scrollbar-gutter">
						<Show
							when={systemMode()}
							fallback={
								<Editor
									wordWrap={true}
									readOnly={false}
									lineNumbers={true}
									language={"markdown"}
									value={screenWriter()}
									onUpdate={(e, editor) => {
										setPromptWriter(e)
									}}
									extensions={[
										searchWidget(),
										cursorPosition(),
										matchBrackets(),
										highlightBracketPairs(),
										indentGuides(),
										highlightSelectionMatches(),
										highlightMatchingTags(),
										matchTags(),
										copyButton(),
										defaultCommands(),
										editHistory()
									]}
								/>
							}
						>
							<div>User</div>
						</Show>
					</div>
				</Show>
			</div>
		</div>
	)
}
