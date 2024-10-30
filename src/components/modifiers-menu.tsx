import { createEffect, createSignal, Show, onMount, Accessor } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/registry/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "~/registry/ui/dialog"
import { nameChangeModifierGroup, addModifier, updateModifierGroupSort } from "../helpers/actionHelpers"
import { initializeEntityMap } from "../helpers/entityHelpers"
import { addModifierGroup, groupsMap, deleteModifierGroup } from "../helpers/actionHelpers"

import {
	isEditingModifierGroup,
	isEditingModifier,
	setIsEditingModifier,
	entityModifierGroups,
	entityModifiers,
	selectedModifierGroup,
	setIsEditingModifierGroup,
	setSelectedModifierGroup,
	setSelectedModifier
} from "../global_state"

import { Filter, ModifierGroupID, ModifierID, Modifier } from "../types/entityType"

import { EditableModifierGroupTitle } from "~/components/editable-modifier-group-title"

interface ModifiersMenuProps {
	isFullModifiers: Accessor<boolean>
	setIsFullModifiers: (value: boolean) => void
}

export default function ModifiersMenu(props: ModifiersMenuProps) {
	const [isCollapsedGroup, setIsCollapsedGroup] = createSignal(false)
	const [itemsList, setItemsList] = createSignal<Modifier[]>([
		...(entityModifiers.get(selectedModifierGroup() as unknown as ModifierGroupID)?.values() ?? [])
	] as Modifier[])

	const [initializedUserGroup, setInitializedUserGroup] = createSignal(false)
	const [initializedUserElement, setInitializedUserElement] = createSignal(false)
	const [inputValueTitle, setInputValueTitle] = createSignal("")
	const [isDialogOpenGroup, setIsDialogOpenGroup] = createSignal(false)
	const [isDialogOpenAIElement, setIsDialogOpenAIElement] = createSignal(false)
	const [groupModifierFilter, setGroupModifierFilter] = createSignal<Filter>("collection")
	const [isFullModifiers, setIsFullModifiers] = createSignal(true)

	createEffect(() => {
		setItemsList([
			...(entityModifiers.get(selectedModifierGroup() as unknown as ModifierGroupID)?.values() ?? [])
		] as Modifier[])
	})

	createEffect(() => {
		setGroupModifierFilter(
			entityModifierGroups.get(selectedModifierGroup() as unknown as ModifierGroupID)?.sort as Filter
		)
	})

	const handleEdit = (e: MouseEvent, id: string) => {
		e.stopPropagation()
		setIsEditingModifierGroup({ status: "editing", id: id as unknown as ModifierID, label: "" })
	}

	const handleNameChange = (newName: string) => {
		nameChangeModifierGroup(selectedModifierGroup()!, newName)
		setIsEditingModifierGroup({ status: "saved", id: selectedModifierGroup() as unknown as ModifierID, label: "" })
	}

	const handleNewGroup = () => {
		const newGroupId = addModifierGroup("", "collection")
		setSelectedModifierGroup(newGroupId as unknown as ModifierGroupID)
		setIsEditingModifierGroup({ status: "editing", id: newGroupId as unknown as ModifierID, label: "" })
		setInputValueTitle("")
	}

	const handleUpdateGroupSort = (id: ModifierGroupID, sort: Filter) => {
		updateModifierGroupSort(id, sort)
	}

	const handleNewElement = () => {
		const selectedGroupId = selectedModifierGroup() as ModifierGroupID | undefined
		let newItemId = addModifier(
			"",
			(entityModifierGroups.get(selectedModifierGroup() as unknown as ModifierGroupID)?.id as ModifierGroupID) ?? "",
			"",
			""
		)
		const columnEl = document.getElementById(
			entityModifierGroups.get(selectedModifierGroup() as unknown as ModifierGroupID)?.id.toString() ?? ""
		)
		if (columnEl) {
			columnEl.scrollTop = columnEl.scrollHeight
		}
		setSelectedModifier(newItemId as unknown as ModifierID)
		setIsEditingModifier({ status: "editing", id: newItemId as unknown as ModifierID, label: "all" })
	}

	const handleDeleteGroup = () => {
		deleteModifierGroup(selectedModifierGroup()!)
	}

	onMount(() => {
		initializeEntityMap()
		/* setSelected(groupIds()[0] as unknown as GroupID)
		if (selected() !== null && selected() !== undefined) {
			setInitializedUserGroup(true)
		} */
	})

	createEffect(() => {
		if (
			selectedModifierGroup() !== null &&
			selectedModifierGroup() !== undefined &&
			Array.from(entityModifierGroups.values()).length > 0
		) {
			setInitializedUserGroup(true)
		} else {
			setInitializedUserGroup(false)
		}

		if (
			entityModifiers.get(selectedModifierGroup() as unknown as ModifierGroupID)?.values() !== null &&
			entityModifiers.get(selectedModifierGroup() as unknown as ModifierGroupID)?.values() !== undefined &&
			Array.from(entityModifiers.get(selectedModifierGroup() as unknown as ModifierGroupID)?.keys() ?? []).length > 0
		) {
			setInitializedUserElement(true)
		}
	})

	return (
		<Show
			when={!isCollapsedGroup()}
			fallback={
				<div class="flex flex-col items-center justify-center h-full  min-h-[400px] h-[calc(100vh-280px)]  bg-background-background">
					<div class="rotate-90">Group</div>
				</div>
			}
		>
			<div class="flex items-center ml-auto ">
				<Show when={selectedModifierGroup()}>
					<div class="flex items-center  ">
						<Show
							when={isEditingModifierGroup().status === "editing"}
							fallback={
								<div
									aria-hidden="false"
									tabIndex={0}
									ondblclick={(e: MouseEvent) => handleEdit(e, selectedModifierGroup() as unknown as string)}
									onClick={(e: MouseEvent) => handleEdit(e, selectedModifierGroup() as unknown as string)}
									class="flex items-center min-w-40 group"
								>
									<div class="i-fluent:tetris-app-24-filled w-5 h-5 mr-2 text-accent" />
									<h1 class="text-[0.8rem] font-bold mt-1.5 mb-1.5 capitalize truncate max-w-60">
										{entityModifierGroups.get(selectedModifierGroup() as unknown as ModifierGroupID)?.name}
									</h1>
								</div>
							}
						>
							<EditableModifierGroupTitle
								inputValueTitle={inputValueTitle}
								setInputValueTitle={setInputValueTitle}
								item={entityModifierGroups.get(selectedModifierGroup() as unknown as ModifierGroupID) as unknown as Modifier}
								name={entityModifierGroups.get(selectedModifierGroup() as unknown as ModifierGroupID)?.name}
								handleNameChange={handleNameChange}
							/>
						</Show>
					</div>
				</Show>

				<div class="ml-auto flex items-center gap-2">
					<Show when={groupModifierFilter() !== "preset"}>
						<span
							class="mr-1 cursor-pointer text-xs font-medium min-w-17 bg-background-secondary rounded-md px-1 py-0.5 justify-center items-center flex select-none border border-border"
							onClick={() => {
								const filters: Filter[] = [
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
								const currentIndex = filters.indexOf(groupModifierFilter() || "collection")
								const nextFilter = filters[(currentIndex + 1) % filters.length]
								setGroupModifierFilter(nextFilter)
								handleUpdateGroupSort(selectedModifierGroup() as unknown as ModifierGroupID, nextFilter)
							}}
						>
							{groupModifierFilter() || "collection"}
						</span>
					</Show>

					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant={initializedUserGroup() === false ? "initializing" : "ghost"}
							size="icon"
							onClick={() => {
								handleNewGroup()
								toast(
									<div class="flex items-center gap-2">
										<div class="i-material-symbols:check-box w-4 h-4 text-success" />
										<span class="text-xs font-medium">Modifier Group added</span>
									</div>,
									{ duration: 2000, position: "bottom-center" }
								)
							}}
						>
							<div class="i-fluent:tetris-app-24-filled w-1.25em h-1.25em"></div>
						</TooltipTrigger>
						<TooltipContent>
							<div class="flex flex-col items-center">
								<div>Add Modifier Group</div>
								<div class="text-xs">(Ctrl + Shift + G)</div>
							</div>
						</TooltipContent>
					</Tooltip>
					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							variant={initializedUserElement() === false && initializedUserGroup() === true ? "initializing" : "ghost"}
							size="icon"
							onClick={() => {
								handleNewElement()
								toast(
									<div class="flex items-center gap-2">
										<div class="i-material-symbols:check-box w-4 h-4 text-success" />
										<span class="text-xs font-medium">Modifier added</span>
									</div>,
									{ duration: 2000, position: "bottom-center" }
								)
							}}
						>
							<div class="i-fluent:tetris-app-24-regular w-1.25em h-1.25em"></div>
						</TooltipTrigger>
						<TooltipContent>
							<div class="flex flex-col items-center">
								<div>Add Modifiers</div>
								<div class="text-xs">(Ctrl + Shift + E)</div>
							</div>
						</TooltipContent>
					</Tooltip>
					<Dialog
						open={isDialogOpenGroup()}
						onOpenChange={setIsDialogOpenGroup}
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
										<div class="i-octicon:repo-deleted-16 w-1.25em h-1.25em mr-2"></div> Delete Modifier Group
									</DialogTrigger>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<DialogContent class="sm:max-w-[425px]">
							<DialogTitle>Are you sure you want to delete this Modifier Group?</DialogTitle>
							<DialogDescription>This action cannot be undone.</DialogDescription>
							<Button
								onClick={() => {
									toast(
										<div class="flex items-center gap-2">
											<div class="i-material-symbols:check-box w-4 h-4 text-success" />
											<span class="text-xs font-medium">Modifier Group deleted</span>
										</div>,
										{ duration: 2000, position: "bottom-center" }
									)
									handleDeleteGroup()
									setIsDialogOpenGroup(false)
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
