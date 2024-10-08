import { useLocation } from "@solidjs/router"
import { useColorMode } from "@kobalte/core"
import { cn } from "~/lib/utils"
import { ModeToggle } from "~/components/ModeToggle"
import { Show, createEffect, createSignal } from "solid-js"
import { isServer } from "solid-js/web"

export default function Nav() {
	const [initialized, setInitialized] = createSignal(false)
	const { colorMode } = useColorMode()
	const location = useLocation()
	const active = (path: string) =>
		path == location.pathname ? "border-sky-600" : "border-transparent hover:border-sky-600"

	createEffect(() => {
		if (!isServer && !initialized()) {
			setInitialized(true)
		}
	})

	return (
		<nav class={cn("bg-zinc-800", colorMode() === "dark" ? "bg-slate-800" : "")}>
			<div class="flex items-center justify-between p-3">
				<ul class="flex text-gray-200">
					<li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
						<a href="/">Home</a>
					</li>
					<li class={`border-b-2 ${active("/mainui")} mx-1.5 sm:mx-6`}>
						<a href="/mainui">Main UI</a>
					</li>
				</ul>
				<Show when={initialized()}>
					<div class="flex justify-end mr-4">
						<ModeToggle />
					</div>
				</Show>
			</div>
		</nav>
	)
}
