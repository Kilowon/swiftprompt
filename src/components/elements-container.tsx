import { Accessor, createSignal, For, Show } from "solid-js"
import { createStore, produce } from "solid-js/store"
import Elements from "./elements"
import { setIsEditingItem, searchSelectedBadges, groupBadge, selected } from "~/global_state"
import { changeItemAttributes, deleteItem, duplicateItem, moveItemToGroup } from "~/helpers/actionHelpers"
import { ElementID, GroupID, PromptItem, VersionID } from "~/types/entityType"
import ItemsCompact from "./elements-compact"

interface ElementsContainerProps {
	type: "all" | "unread"
	sizes: number[]
	items: Accessor<PromptItem[]>
	initializedUserElement: Accessor<boolean>
	initializedUserGroup: Accessor<boolean>
	isFullElements: Accessor<boolean>
	setIsFullElements: (value: boolean) => void
}

const handleUpdateAttributes = (
	item: PromptItem,
	name: string,
	summary: string,
	body: string,
	version: VersionID,
	versionCounter: VersionID,
	updatedBody: boolean
) => {
	if (item.id) {
		changeItemAttributes(item.group, item.id, name, summary, body, version, versionCounter, updatedBody)
	}
}

export default function ElementsContainer(props: ElementsContainerProps) {
	const handleDeleteItem = (groupId: GroupID, itemId: ElementID) => {
		const [isLoading, setIsLoading] = createSignal(true)
		const [items, setItems] = createStore(props.items)

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

	return (
		<div class="flex min-h-[400px] h-[calc(100vh-280px)] flex-col gap-2 overflow-auto p-4 pt-2 scrollbar-default scrollbar-gutter">
			<Show when={props.items()}>
				<For each={props.items()}>
					{item => {
						return (
							<Show
								when={props.isFullElements() === true}
								fallback={<ItemsCompact item={item} />}
							>
								<div>
									<Elements
										item={item}
										handleUpdateAttributes={handleUpdateAttributes}
										handleDeleteItem={handleDeleteItem}
										handleDuplicateItem={duplicateItemHandler}
										handleMoveItem={moveItemToNewGroup}
										handleEditing={handleEditing}
										labelLimit={() => 18}
										items={props.items()}
										sizes={props.sizes}
									/>
								</div>
							</Show>
						)
					}}
				</For>
			</Show>
		</div>
	)
}
