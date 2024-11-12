import { createEffect, createSignal, Show, onMount, onCleanup } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/registry/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "~/registry/ui/dialog"
import { nameChangeGroup, addItem, deleteGroup, updateGroupSort } from "../helpers/actionHelpers"
import { initializeEntityMap } from "../helpers/entityHelpers"
import { addGroup, groupsMap, duplicateGroup } from "../helpers/actionHelpers"

import {
	selected,
	setSelected,
	setSelectedItem,
	setIsEditingItem,
	setIsEditingGroup,
	isEditingGroup,
	entityItems,
	entityGroups,
	hotKeyMappings
} from "../global_state"

import { PromptItem, GroupID, ElementID, Filter } from "../types/entityType"

import { EditableGroupTitle } from "~/components/editable-group-title"
import { createShortcut } from "@solid-primitives/keyboard"

interface GroupContainerMenuProps {}

export function GroupContainerMenu(props: GroupContainerMenuProps) {
	const [isCollapsedGroup, setIsCollapsedGroup] = createSignal(false)
	const [itemsList, setItemsList] = createSignal<PromptItem[]>([
		...(entityItems.get(selected() as unknown as GroupID)?.values() ?? [])
	] as PromptItem[])

	const [initializedUserGroup, setInitializedUserGroup] = createSignal(false)
	const [initializedUserElement, setInitializedUserElement] = createSignal(false)
	const [inputValueTitle, setInputValueTitle] = createSignal("")
	const [isDialogOpenGroup, setIsDialogOpenGroup] = createSignal(false)
	const [isDialogOpenAIElement, setIsDialogOpenAIElement] = createSignal(false)
	const [groupFilter, setGroupFilter] = createSignal<Filter>("collection")
	const [isFullElements, setIsFullElements] = createSignal(true)

	createEffect(() => {
		setItemsList([...(entityItems.get(selected() as unknown as GroupID)?.values() ?? [])] as PromptItem[])
	})

	createEffect(() => {
		setGroupFilter(entityGroups.get(selected() as unknown as GroupID)?.sort as Filter)
	})

	const handleEdit = (e: MouseEvent, id: string) => {
		e.stopPropagation()
		setIsEditingGroup({ status: "editing", id: id as unknown as ElementID, label: "" })
	}

	const handleNameChange = (newName: string) => {
		nameChangeGroup(selected()!, newName)
		setIsEditingGroup({ status: "saved", id: selected() as unknown as ElementID, label: "" })
	}

	const handleNewGroup = () => {
		const newGroupId = addGroup("", "collection")
		setSelected(newGroupId as unknown as GroupID)
		setIsEditingGroup({ status: "editing", id: newGroupId as unknown as ElementID, label: "" })
		setInputValueTitle("")
	}

	const handleUpdateGroupSort = (id: GroupID, sort: Filter) => {
		updateGroupSort(id, sort)
	}

	const handleNewElement = () => {
		const selectedGroupId = selected() as GroupID | undefined
		let newItemId = addItem(
			"",
			(groupsMap().get(selected() as unknown as GroupID)?.id as GroupID) ?? "",
			[],
			[],
			"",
			0,
			0,
			""
		)
		const columnEl = document.getElementById(
			groupsMap()
				.get(selectedGroupId as unknown as GroupID)
				?.id.toString() ?? ""
		)
		if (columnEl) {
			columnEl.scrollTop = columnEl.scrollHeight
		}
		setSelectedItem(newItemId as unknown as ElementID)
		setIsEditingItem({ status: "editing", id: newItemId as unknown as ElementID, label: "all" })
	}

	const handleDeleteGroup = () => {
		deleteGroup(selected()!)
	}

	const handleDuplicateGroup = () => {
		duplicateGroup(selected()!)
	}

	onMount(() => {
		initializeEntityMap()
		/* setSelected(groupIds()[0] as unknown as GroupID)
		if (selected() !== null && selected() !== undefined) {
			setInitializedUserGroup(true)
		} */
	})

	createEffect(() => {
		if (selected() !== null && selected() !== undefined && Array.from(groupsMap().values()).length > 0) {
			setInitializedUserGroup(true)
		} else {
			setInitializedUserGroup(false)
		}

		if (
			entityItems.get(selected() as unknown as GroupID)?.values() !== null &&
			entityItems.get(selected() as unknown as GroupID)?.values() !== undefined &&
			Array.from(entityItems.get(selected() as unknown as GroupID)?.keys() ?? []).length > 0
		) {
			setInitializedUserElement(true)
		}
	})

	// Add Element
	createShortcut(
		hotKeyMappings().AddElement,
		() => {
			handleNewElement()
		},
		{
			preventDefault: true
		}
	)

	// Add Group
	createShortcut(
		hotKeyMappings().AddGroup,
		() => {
			handleNewGroup()
		},
		{
			preventDefault: true
		}
	)

	// Delete Group
	createShortcut(
		hotKeyMappings().DeleteGroup,
		() => {
			handleDeleteGroup()
		},
		{
			preventDefault: true
		}
	)

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
				<Show when={selected()}>
					<div class="flex items-center  ">
						<Show
							when={isEditingGroup().status === "editing"}
							fallback={
								<div
									aria-hidden="false"
									tabIndex={0}
									ondblclick={(e: MouseEvent) => handleEdit(e, selected() as unknown as string)}
									onClick={(e: MouseEvent) => handleEdit(e, selected() as unknown as string)}
									class="flex items-center min-w-40 group"
								>
									<div class="i-material-symbols:grid-view w-5 h-5 mr-2 text-accent" />
									<h1 class="text-[0.8rem] font-bold mt-1.5 mb-1.5 capitalize truncate max-w-60">
										{groupsMap().get(selected() as unknown as GroupID)?.name}
									</h1>
								</div>
							}
						>
							<EditableGroupTitle
								inputValueTitle={inputValueTitle}
								setInputValueTitle={setInputValueTitle}
								item={groupsMap().get(selected() as unknown as GroupID) as unknown as PromptItem}
								name={groupsMap().get(selected() as unknown as GroupID)?.name}
								handleNameChange={handleNameChange}
							/>
						</Show>
					</div>
				</Show>

				<div class="ml-auto flex items-center gap-2">
					<Show when={groupFilter() !== "preset"}>
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
								const currentIndex = filters.indexOf(groupFilter() || "collection")
								const nextFilter = filters[(currentIndex + 1) % filters.length]
								setGroupFilter(nextFilter)
								handleUpdateGroupSort(selected() as unknown as GroupID, nextFilter)
							}}
						>
							{groupFilter() || "collection"}
						</span>
					</Show>
					<Dialog
						open={isDialogOpenAIElement()}
						//open={true}
						onOpenChange={setIsDialogOpenAIElement}
					>
						<DialogTrigger>
							<Tooltip
								openDelay={1000}
								closeDelay={0}
							>
								<TooltipTrigger
									as={Button}
									variant="ghost"
									size="icon"
									onClick={() => {
										console.log("AI Element Generation")
									}}
								>
									<div class="i-fluent:glance-horizontal-sparkle-32-filled w-1.25em h-1.25em"></div>
								</TooltipTrigger>
								<TooltipContent>AI Element Generation</TooltipContent>
							</Tooltip>
						</DialogTrigger>

						<DialogContent class="sm:max-w-[425px] text-foreground">
							<div class="flex flex-col items-center gap-2">
								<div>AI Element Generation</div>
								<div class="i-hugeicons:coming-soon-01 w-15 h-15"></div>
							</div>
						</DialogContent>
					</Dialog>
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
										<span class="text-xs font-medium">Group added</span>
									</div>,
									{ duration: 2000, position: "bottom-center" }
								)
							}}
						>
							<div class="i-ri:function-add-fill w-1.25em h-1.25em"></div>
						</TooltipTrigger>
						<TooltipContent>
							<div class="flex flex-col items-center">
								<div>Add Group</div>
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
							}}
						>
							<div class="i-ri:function-add-line w-1.25em h-1.25em"></div>
						</TooltipTrigger>
						<TooltipContent>
							<div class="flex flex-col items-center">
								<div>Add Element</div>
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
										<div class="i-octicon:repo-deleted-16 w-1.25em h-1.25em mr-2"></div> Delete Group
									</DialogTrigger>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										handleDuplicateGroup()
										toast(
											<div class="flex items-center gap-2">
												<div class="i-material-symbols:check-box w-4 h-4 text-success" />
												<span class="text-xs font-medium">
													{groupsMap().get(selected() as unknown as GroupID)?.name} duplicated
												</span>
											</div>,
											{ duration: 2000, position: "bottom-center" }
										)
									}}
								>
									<div class="i-octicon:duplicate-16 w-1.25em h-1.25em mr-2"></div> Duplicate Group
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<DialogContent class="sm:max-w-[425px] text-foreground">
							<DialogTitle>Are you sure you want to delete this group?</DialogTitle>
							<DialogDescription>This action cannot be undone.</DialogDescription>
							<Button
								onClick={() => {
									toast(
										<div class="flex items-center gap-2">
											<div class="i-material-symbols:check-box w-4 h-4 text-success" />
											<span class="text-xs font-medium">Group deleted</span>
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
