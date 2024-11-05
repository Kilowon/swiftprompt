import { For, Show, createEffect, createMemo, Accessor, onCleanup } from "solid-js"
import { createSignal } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { ReactiveSet } from "@solid-primitives/set"
import {
	setIsEditingItem,
	searchSelectedBadges,
	groupBadge,
	selected,
	selectedItem,
	setSelectedItem,
	hotKeyMappings,
	selectedSectionItemEl,
	setSelectedSectionItem,
	entityItems
} from "~/global_state"
import { deleteItem, duplicateItem, changeItemAttributes, moveItemToGroup } from "~/helpers/actionHelpers"
import { PromptItem, ElementID, GroupID, VersionID, TemplateField } from "~/types/entityType"
import Elements from "./elements"
import ElementsCompact from "./elements-compact"
import { createShortcut } from "@solid-primitives/keyboard"

interface ElementsContainerProps {
	type: "all" | "unread"
	sizes: number[]
	items: Accessor<PromptItem[]>
	initializedUserElement: Accessor<boolean>
	initializedUserGroup: Accessor<boolean>
	isFullElements: Accessor<boolean>
	setIsFullElements: (value: boolean) => void
}

export default function ElementsContainer(props: ElementsContainerProps) {
	const [isLoading, setIsLoading] = createSignal(true)

	const [labelLimit, setLabelLimit] = createSignal<number>(18)
	const [items, setItems] = createStore(props.items)

	const handleDeleteItem = (groupId: GroupID, itemId: ElementID) => {
		setItems(
			produce(items => {
				const index = items().findIndex(item => item.id === itemId)
				if (index !== -1) {
					items().splice(index, 1)
				}
			})
		)
		deleteItem(groupId, itemId)
	}

	const duplicateItemHandler = (item: PromptItem) => {
		if (item.id) {
			duplicateItem(item.group, item.id)
		}
	}

	const moveItemToNewGroup = (item: PromptItem, newGroupId: GroupID) => {
		if (item.id) {
			moveItemToGroup(item.group, item.id, newGroupId)
		}
	}

	const handleEditing = (
		item: PromptItem,
		label: "title" | "summary" | "body",
		status: "saved" | "editing",
		id: string
	) => {
		if (item.id) {
			setIsEditingItem({ label, status, id: id as unknown as ElementID })
		}
	}

	const handleUpdateAttributes = (
		item: PromptItem,
		name: string,
		summary: string,
		body: string,
		fields: TemplateField[],
		version: VersionID,
		versionCounter: VersionID,
		updatedBody: boolean
	) => {
		if (item.id) {
			changeItemAttributes(item.group, item.id, name, summary, body, fields, version, versionCounter, updatedBody)
		}
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

	createEffect(() => {
		if (props.items().length > 0) {
			setIsLoading(false)
		}
	})

	const filterElements = new ReactiveSet<ElementID>()

	createEffect(() => {
		const selectedGroup = selected() as GroupID
		const selectedBadges = searchSelectedBadges()

		filterElements.clear()
		setVisibleCount(500) ///////Here

		selectedBadges.forEach(badge => {
			const groupBadges = groupBadge.get(selectedGroup)
			groupBadges?.get(badge.id)?.forEach(id => {
				filterElements.add(id)
			})
		})
	})

	const [visibleCount, setVisibleCount] = createSignal(0)
	const [visibleItems, setVisibleItems] = createSignal<PromptItem[]>([])

	const incrementalRender = 25

	const filteredItems = createMemo(() => {
		const items = props.items()
		const filters = Array.from(filterElements.values()).flat()
		return items.filter(item => !item.pinned && (filters.length === 0 || filters.includes(item.id))).reverse()
	})

	createEffect(() => {
		setVisibleItems(filteredItems().slice(0, visibleCount()))
	})
	const handleScroll = (e: Event) => {
		const target = e.target as HTMLDivElement
		if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
			setVisibleCount(prev => Math.min(prev + incrementalRender, filteredItems().length))
		}
	}

	const handleDeleteElement = () => {
		deleteItem(selected()!, selectedItem()!)
		setSelectedItem(null)
	}
	// Delete Element
	createShortcut(
		hotKeyMappings().DeleteElement,
		() => {
			handleDeleteElement()
		},
		{
			preventDefault: true
		}
	)

	// Focus Element
	createShortcut(
		hotKeyMappings().FocusElement,
		() => {
			//console.log("Focus Element")
			handleFocusElement()
		},
		{
			preventDefault: true
		}
	)

	return (
		<div
			onScroll={handleScroll}
			onChange={handleScroll}
			class="flex flex-col gap-2 overflow-auto p-4 pt-2 h-full scrollbar-default scrollbar-gutter"
		>
			<Show when={!isLoading()}>
				<Show
					when={props.isFullElements() === true}
					fallback={
						<For
							each={props
								.items()
								.filter(item => item.pinned)
								.reverse()}
						>
							{item => {
								return (
									<ElementsCompact
										item={item}
										handleEditing={handleEditing}
										handleUpdateAttributes={handleUpdateAttributes}
										handleDeleteItem={handleDeleteItem}
										handleDuplicateItem={duplicateItemHandler}
										labelLimit={labelLimit}
										handleMoveItem={moveItemToNewGroup}
										items={items()}
										sizes={props.sizes}
										setIsFullElements={props.setIsFullElements}
									/>
								)
							}}
						</For>
					}
				>
					<For
						each={props
							.items()
							.filter(item => item.pinned)
							.reverse()}
					>
						{item => {
							return (
								<Elements
									item={item}
									handleEditing={handleEditing}
									handleUpdateAttributes={handleUpdateAttributes}
									handleDeleteItem={handleDeleteItem}
									handleDuplicateItem={duplicateItemHandler}
									labelLimit={labelLimit}
									handleMoveItem={moveItemToNewGroup}
									items={items()}
									sizes={props.sizes}
								/>
							)
						}}
					</For>
				</Show>
			</Show>
			<Show
				when={!isLoading() && visibleItems().length > 0 && props.initializedUserElement() === true}
				fallback={
					<Show
						when={selected() !== null && selected() !== undefined && props.initializedUserGroup() === true}
						fallback={
							<div class="flex flex-col items-center justify-center h-full">
								<div class="text-2xl font-bold mb-4">No group selected</div>
								<div class="text-gray-600 mb-6">Create a new group to get started!</div>
							</div>
						}
					>
						<div class="flex flex-col items-center justify-center h-full">
							<div class="text-2xl font-bold mb-4">No items yet</div>
							<div class="text-gray-600 mb-6">Create your first item to get started!</div>
						</div>
					</Show>
				}
			>
				<Show
					when={props.isFullElements() === true}
					fallback={
						<For each={visibleItems()}>
							{item => {
								return (
									<ElementsCompact
										item={item}
										handleEditing={handleEditing}
										handleUpdateAttributes={handleUpdateAttributes}
										handleDeleteItem={handleDeleteItem}
										handleDuplicateItem={duplicateItemHandler}
										labelLimit={labelLimit}
										handleMoveItem={moveItemToNewGroup}
										items={items()}
										sizes={props.sizes}
										setIsFullElements={props.setIsFullElements}
									/>
								)
							}}
						</For>
					}
				>
					<For each={visibleItems()}>
						{item => {
							return (
								<Elements
									item={item}
									handleEditing={handleEditing}
									handleUpdateAttributes={handleUpdateAttributes}
									handleDeleteItem={handleDeleteItem}
									handleDuplicateItem={duplicateItemHandler}
									labelLimit={labelLimit}
									handleMoveItem={moveItemToNewGroup}
									items={items()}
									sizes={props.sizes}
								/>
							)
						}}
					</For>
				</Show>
			</Show>
		</div>
	)
}
