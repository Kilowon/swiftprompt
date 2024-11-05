import { For, Show } from "solid-js"
import { cn } from "~/lib/utils"
import { hotKeyFooter, hotKeyMappings, setHotKeyMappings } from "~/global_state"

export function HotKeyFooter() {
	const handleKeyChange = (action: string, e: KeyboardEvent) => {
		e.preventDefault()

		if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt") {
			const keys: string[] = []
			if (e.ctrlKey) keys.push("Control")
			if (e.shiftKey) keys.push("Shift")
			if (e.altKey) keys.push("Alt")
			keys.push(e.key.toUpperCase())

			setHotKeyMappings(prev => ({
				...prev,
				[action]: keys
			}))
		}
	}

	return (
		<Show when={hotKeyFooter()}>
			<div class="bg-background-secondary w-full p-4 fixed bottom-0 left-0 right-0">
				<div class="grid grid-cols-4 gap-4">
					<For each={Object.entries(hotKeyMappings())}>
						{([action, keys]) => (
							<div class="border border-accent rounded-md p-2">
								<span class="text-xs text-accent">{action}</span>
								<button class="w-full text-left p-1 hover:bg-accent/10 rounded focus:outline-none focus:ring-2 ring-accent">
									{keys.join(" + ")}
								</button>
							</div>
						)}
					</For>
				</div>
			</div>
		</Show>
	)
}
