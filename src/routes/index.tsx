import { createShortcut } from "@solid-primitives/keyboard"
import { setColorFooter } from "~/global_state"

export default function Home() {
	// Toggle Color Footer
	createShortcut(
		["Control", "Shift", "C"],
		() => {
			setColorFooter(prev => !prev)
		},
		{
			preventDefault: true
		}
	)

	return (
		<main class="text-center mx-auto text-gray-700 p-4">
			<div>Clear</div>
		</main>
	)
}
