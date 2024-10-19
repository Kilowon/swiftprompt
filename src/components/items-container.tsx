import { Accessor, For, Show } from "solid-js"
import { Items } from "./Items"
import { PromptItem } from "~/types/entityType"

interface ItemContainerProps {
	type: "all" | "unread"
	sizes: number[]
	items: Accessor<PromptItem[]>
	initializedUserElement: Accessor<boolean>
	initializedUserGroup: Accessor<boolean>
	isFullElements: Accessor<boolean>
	setIsFullElements: (value: boolean) => void
}

export function ItemContainer(props: ItemContainerProps) {
	return (
		<div class="flex min-h-[400px] h-[calc(100vh-280px)] flex-col gap-2 overflow-auto p-4 pt-2 scrollbar-default scrollbar-gutter">
			<Show
				when={props.isFullElements() === true}
				fallback={<div>List View</div>}
			>
				<For each={props.items()}>
					{item => {
						return (
							<div>
								<Items item={item} />
							</div>
						)
					}}
				</For>
			</Show>
		</div>
	)
}
