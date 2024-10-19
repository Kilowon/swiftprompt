import { createEffect, createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/registry/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "~/registry/ui/dialog"

import {
	addTemplateGroup,
	addTemplateSection,
	editTemplateGroup,
	updateTemplateGroupSort
} from "../helpers/actionHelpers"

import {
	selected,
	setSelectedItem,
	setIsEditingItem,
	entityItems,
	templates,
	selectedTemplateGroup,
	setSelectedTemplateGroup,
	setSelectedSection,
	selectedItem,
	selectedSectionItemEl,
	setSelectedSectionItem,
	selectedTemplateVersion,
	setSelectedTemplateVersion
} from "../global_state"

import { GroupID, ElementID, TemplateGroupID, TemplateSectionID, VersionID, TemplateFilter } from "../types/entityType"

import { EditableTemplateTitle } from "~/components/editable-template-title"
//import TemplateVersions from "~/components/TemplateVersions"

const [isCollapsedTemplate, setIsCollapsedTemplate] = createSignal(false)
const [inputValueTemplateTitle, setInputValueTemplateTitle] = createSignal("")
const [isEditingTemplateGroup, setIsEditingTemplateGroup] = createSignal({ status: "saved" })
const [isEditingTemplateSection, setIsEditingTemplateSection] = createSignal({ status: "saved" })
const [isDialogOpenTemplate, setIsDialogOpenTemplate] = createSignal(false)
const [templateFilter, setTemplateFilter] = createSignal<TemplateFilter>("collection")
const [versionFilter, setVersionFilter] = createSignal<VersionID>(0)

createEffect(() => {
	setTemplateFilter(templates.get(selectedTemplateGroup() as unknown as TemplateGroupID)?.sort as TemplateFilter)
})

createEffect(() => {
	setVersionFilter(templates.get(selectedTemplateGroup() as unknown as TemplateGroupID)?.versionCounter as VersionID)
})

const handleNewTemplateGroup = () => {
	const newTemplateGroupId = addTemplateGroup("", "collection")
	setSelectedTemplateGroup(newTemplateGroupId as unknown as TemplateGroupID)
	setIsEditingTemplateGroup({ status: "editing", id: newTemplateGroupId as unknown as ElementID, label: "" })
	setInputValueTemplateTitle("")
}

const handleUpdateTemplateGroupSort = (id: TemplateGroupID, sort: TemplateFilter) => {
	updateTemplateGroupSort(id, sort)
}

const handleIncrementVersion = () => {
	//console.log("Increment Version")
}

const handleNewTemplateSection = () => {
	if (selectedTemplateVersion() === 0) {
		//console.log("Increment Version", selectedTemplateVersion())
		setSelectedTemplateVersion(1)
		const temp = templates.get(selectedTemplateGroup()!)
		if (temp) {
			templates.set(selectedTemplateGroup()!, { ...temp, versionCounter: 1 })
		}
	}
	//console.log("Add Template Section", selectedTemplateVersion())
	const newTemplateSectionId = addTemplateSection(selectedTemplateGroup()!, "", selectedTemplateVersion()!)
	setSelectedSection(newTemplateSectionId as unknown as TemplateSectionID)
	setIsEditingTemplateSection({ status: "editing" })
}

const handleTemplateNameChange = (newName: string) => {
	editTemplateGroup(selectedTemplateGroup()!, newName, selectedTemplateVersion()!)
	setIsEditingTemplateGroup({ status: "saved" })
	setInputValueTemplateTitle("")
}

const handleFocusElement = () => {
	if (selectedItem()) {
		setSelectedSectionItem(selectedItem() as unknown as ElementID)
		if (selectedSectionItemEl()) {
			selectedSectionItemEl()?.focus()
			setIsEditingItem({ status: "saved", id: selectedItem() as unknown as ElementID, label: "" })
		}
	}
	if (!selectedItem()) {
		setSelectedItem(
			entityItems
				.get(selected() as unknown as GroupID)
				?.keys()
				.next().value as unknown as ElementID
		)
		setSelectedSectionItem(selectedItem() as unknown as ElementID)
		if (selectedSectionItemEl()) {
			selectedSectionItemEl()?.focus()
			setIsEditingItem({ status: "saved", id: selectedItem() as unknown as ElementID, label: "" })
		}
	}
}

export default function TemplateContainerMenu() {
	return (
		<Show
			when={!isCollapsedTemplate()}
			fallback={
				<div class="flex flex-col items-center justify-center h-full px-4 bg-background-secondary">
					<div class="rotate-90">System</div>
				</div>
			}
		>
			<div class="flex items-center px-2 bg-background-secondary w-full">
				<Show
					when={isEditingTemplateGroup().status === "editing"}
					fallback={
						<div
							aria-hidden="false"
							tabIndex={0}
							ondblclick={(e: MouseEvent) =>
								setIsEditingTemplateGroup({
									status: "editing"
								})
							}
							onKeyDown={(e: KeyboardEvent) => {
								if (e.key === "Enter") {
									setIsEditingTemplateGroup({
										status: "editing"
									})
								}
							}}
						>
							<h1 class="text-xs font-bold  w-full overflow-hidden text-ellipsis whitespace-nowrap">
								{templates.get(selectedTemplateGroup()!)?.name}
							</h1>
						</div>
					}
				>
					<div class="flex items-center min-w-35 mr-2 max-w-[calc(100%-2rem)] group">
						<EditableTemplateTitle
							name={templates.get(selectedTemplateGroup()!)?.name}
							inputValueTemplateTitle={inputValueTemplateTitle}
							setInputValueTemplateTitle={setInputValueTemplateTitle}
							handleTemplateNameChange={handleTemplateNameChange}
						/>
					</div>
				</Show>
				<div class="ml-auto flex items-center gap-2">
					<Show when={templateFilter() !== "preset"}>
						<span
							class="mr-1 cursor-pointer text-xs font-medium min-w-17 bg-background rounded-md px-1 py-0.5 justify-center items-center flex select-none border border-border"
							onClick={() => {
								const filters: TemplateFilter[] = [
									"collection",
									"project",
									"archived",
									"favorite",
									"image",
									"voice",
									"system",
									"user",
									"audio",
									"business",
									"marketing",
									"social",
									"email",
									"website",
									"other"
								]
								const currentIndex = filters.indexOf(templateFilter() || "collection")
								const nextFilter = filters[(currentIndex + 1) % filters.length]
								setTemplateFilter(nextFilter)
								handleUpdateTemplateGroupSort(selectedTemplateGroup() as unknown as TemplateGroupID, nextFilter)
							}}
						>
							{templateFilter() || "collection"}
						</span>
					</Show>
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant="ghost"
							size="icon"
							onClick={() => {
								handleNewTemplateGroup()
								toast(
									<div class="flex items-center gap-2">
										<div class="i-material-symbols:check-box w-4 h-4 text-success" />
										<span class="text-xs font-medium">Template Generating</span>
									</div>,
									{ duration: 6000, position: "bottom-center" }
								)
							}}
						>
							<div class="i-fluent:glance-horizontal-sparkle-32-filled w-1.25em h-1.25em"></div>
						</TooltipTrigger>
						<TooltipContent>AI Generate Template</TooltipContent>
					</Tooltip>
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant="ghost"
							size="icon"
							onClick={() => {
								handleNewTemplateGroup()
								toast(
									<div class="flex items-center gap-2">
										<div class="i-material-symbols:check-box w-4 h-4 text-success" />
										<span class="text-xs font-medium">Template added</span>
									</div>,
									{ duration: 2000, position: "bottom-center" }
								)
							}}
						>
							<div class="i-ri:apps-2-add-fill w-1.25em h-1.25em"></div>
						</TooltipTrigger>
						<TooltipContent>Add Template</TooltipContent>
					</Tooltip>
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant="ghost"
							size="icon"
							onClick={() => {
								handleNewTemplateSection()
								toast(
									<div class="flex items-center gap-2">
										<div class="i-material-symbols:check-box w-4 h-4 text-success" />
										<span class="text-xs font-medium">Section added</span>
									</div>,
									{ duration: 2000, position: "bottom-center" }
								)
							}}
						>
							<div class="i-ri:apps-2-add-line w-1.25em h-1.25em"></div>
						</TooltipTrigger>
						<TooltipContent>Add Section</TooltipContent>
					</Tooltip>
					<Dialog
						open={isDialogOpenTemplate()}
						onOpenChange={setIsDialogOpenTemplate}
					>
						<DropdownMenu placement="bottom-end">
							<DropdownMenuTrigger
								as={Button}
								variant="ghost"
								size="icon"
								//disabled={!data()}
							>
								<div class="i-mdi:dots-vertical w-1.25em h-1.25em"></div>
								<span class="sr-only">More</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem>
									<DialogTrigger>
										<div class="i-octicon:repo-deleted-16 w-1.25em h-1.25em mr-2"></div> Delete Template
									</DialogTrigger>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<div class="i-octicon:duplicate-16 w-1.25em h-1.25em mr-2"></div> Duplicate Template
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<DialogContent class="sm:max-w-[425px]">
							<DialogTitle>Are you sure you want to delete this Template?</DialogTitle>
							<DialogDescription>This action cannot be undone.</DialogDescription>
							<Button
								onClick={() => {
									toast(
										<div class="flex items-center gap-2">
											<div class="i-material-symbols:check-box w-4 h-4 text-success" />
											<span class="text-xs font-medium">Template deleted</span>
										</div>,
										{ duration: 2000, position: "bottom-center" }
									)

									setIsDialogOpenTemplate(false)
								}}
							>
								Delete
							</Button>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</Show>
	)
}
