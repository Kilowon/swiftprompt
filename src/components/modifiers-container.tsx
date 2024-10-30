import Modifiers from "./modifiers"
import ModifiersCompact from "./modifiers-compact"
import { For, Show, createEffect, createMemo, Accessor } from "solid-js"
import { createSignal } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { ReactiveSet } from "@solid-primitives/set"
import { setIsEditingItem, searchSelectedBadges, groupBadge, selected, setIsEditingModifier } from "~/global_state"
import {
	deleteItem,
	duplicateItem,
	changeItemAttributes,
	moveItemToGroup,
	changeModifierAttributes
} from "~/helpers/actionHelpers"
import { Modifier, ModifierGroupID, ModifierID } from "~/types/entityType"
import Elements from "./elements"
import ElementsCompact from "./elements-compact"

interface ModifiersContainerProps {
	type: "all" | "unread"
	sizes: number[]
	items: Accessor<Modifier[]>
	initializedUserElement: Accessor<boolean>
	initializedUserGroup: Accessor<boolean>
	isFullModifiers: Accessor<boolean>
	setIsFullModifiers: (value: boolean) => void
}

export default function ModifiersContainer(props: ModifiersContainerProps) {
	const [isLoading, setIsLoading] = createSignal(true)

	const [labelLimit, setLabelLimit] = createSignal<number>(18)
	const [items, setItems] = createStore(props.items)

	const handleDeleteItem = (groupId: ModifierGroupID, itemId: ModifierID) => {
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

	const duplicateItemHandler = (item: Modifier) => {
		if (item.id) {
			duplicateItem(item.modifierGroupId, item.id)
		}
	}

	const moveItemToNewGroup = (item: Modifier, newGroupId: ModifierGroupID) => {
		if (item.id) {
			moveItemToGroup(item.modifierGroupId, item.id, newGroupId)
		}
	}

	const handleEditing = (
		item: Modifier,
		label: "title" | "summary" | "body",
		status: "saved" | "editing",
		id: string
	) => {
		if (item.id) {
			setIsEditingModifier({ label, status, id: id as unknown as ModifierID })
		}
	}

	const handleUpdateAttributes = (
		item: Modifier,
		name: string,
		summary: string,
		body: string,
		modifierGroupId: ModifierGroupID
	) => {
		if (item.id) {
			changeModifierAttributes(item.modifierGroupId, item.id, name, summary, body)
		}
	}

	createEffect(() => {
		if (props.items().length > 0) {
			setIsLoading(false)
		}
	})

	const filterElements = new ReactiveSet<ModifierID>()

	createEffect(() => {
		const selectedGroup = selected() as ModifierGroupID
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
	const [visibleItems, setVisibleItems] = createSignal<Modifier[]>([])

	const incrementalRender = 25

	const filteredItems = createMemo(() => {
		const items = props.items()
		const filters = Array.from(filterElements.values()).flat()
		return items.filter(item => filters.length === 0 || filters.includes(item.id)).reverse()
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

	createEffect(() => {
		console.log("items", props.items())
	})

	return (
		<div
			onScroll={handleScroll}
			onChange={handleScroll}
			class="flex flex-col gap-2 overflow-auto p-4 pt-2 h-full scrollbar-default scrollbar-gutter"
		>
			<Show
				when={true}
				fallback={
					<Show
						when={selected() !== null && selected() !== undefined && props.initializedUserGroup() === true}
						fallback={
							<div class="flex flex-col items-center justify-center h-full">
								<div class="text-2xl font-bold mb-4">No modifier group selected</div>
								<div class="text-gray-600 mb-6">Create a new modifier group to get started!</div>
							</div>
						}
					>
						<div class="flex flex-col items-center justify-center h-full">
							<div class="text-2xl font-bold mb-4">No modifiers yet</div>
							<div class="text-gray-600 mb-6">Create your first modifier to get started!</div>
						</div>
					</Show>
				}
			>
				<Show
					when={props.isFullModifiers()}
					fallback={
						<For each={props.items()}>
							{item => {
								return (
									<ModifiersCompact
										item={item}
										handleEditing={handleEditing}
										handleUpdateAttributes={handleUpdateAttributes}
										handleDeleteItem={handleDeleteItem}
										handleDuplicateItem={duplicateItemHandler}
										labelLimit={labelLimit}
										handleMoveItem={moveItemToNewGroup}
										items={items()}
										sizes={props.sizes}
										setIsFullModifiers={props.setIsFullModifiers}
									/>
								)
							}}
						</For>
					}
				>
					<For each={props.items()}>
						{item => {
							createEffect(() => {
								console.log("item DIS EN", item)
							})
							return (
								<Modifiers
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
