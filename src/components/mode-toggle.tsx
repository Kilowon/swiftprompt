import { useColorMode } from "@kobalte/core"
import { Show } from "solid-js"
import { Button } from "~/registry/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/registry/ui/dropdown-menu"

type ColorMode = "light" | "dark" | "warm-dark" | "system"
type ConfigColorMode = "light" | "dark" | "warm-dark" | "system"

export function ModeToggle() {
	const { setColorMode, colorMode } = useColorMode()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				as={Button<"button">}
				variant="ghost"
				size="icon"
				class="w-9 px-0 "
			>
				<Show when={colorMode() === "light"}>
					<div class="i-material-symbols:light-mode-outline-rounded size-6 text-zinc-200"></div>
				</Show>
				<Show when={(colorMode() as ColorMode) === "dark" || (colorMode() as ColorMode) === "warm-dark"}>
					<div class="i-material-symbols:dark-mode-outline-rounded size-6"></div>
				</Show>
				<span class="sr-only">Toggle theme</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onSelect={() => setColorMode("light")}>
					<div class="i-material-symbols:light-mode-outline-rounded size-4 mr-2"></div>
					<span>Light</span>
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => setColorMode("dark")}>
					<div class="i-mingcute:snow-line size-4 mr-2"></div>
					<span>CoolDark</span>
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => setColorMode("warm-dark" as unknown as import("@kobalte/core").ConfigColorMode)}>
					<div class="i-mingcute:fire-line size-4 mr-2"></div>
					<span>Warm Dark</span>
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => setColorMode("system")}>
					<div class="i-material-symbols:chrome-reader-mode-outline size-4 mr-2"></div>
					<span>System</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
