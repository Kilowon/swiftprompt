import { For, Show } from "solid-js"

export function ItemContainer() {
	const testNavArray = [
		{
			title: "Element One",
			id: "1"
		}
	]

	return (
		<div class="flex min-h-[400px] h-[calc(100vh-280px)] flex-col gap-2 overflow-auto p-4 pt-2 scrollbar-default scrollbar-gutter">
			<Show when={true}>
				<For each={testNavArray}>
					{item => {
						return (
							<div>
								<span>{item.title}</span>
							</div>
						)
					}}
				</For>
			</Show>
		</div>
	)
}
