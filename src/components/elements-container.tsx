import { Accessor, For, Show } from "solid-js"
import Elements from "./elements"
import { PromptItem } from "~/types/entityType"
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

export default function ElementsContainer(props: ElementsContainerProps) {
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
									<Elements item={item} />
								</div>
							</Show>
						)
					}}
				</For>
			</Show>
		</div>
	)
}
