import { useLocation } from "@solidjs/router"
import { useColorMode } from "@kobalte/core"
import { cn } from "~/lib/utils"
import { ModeToggle } from "~/components/mode-toggle"
import { Show, createEffect, createSignal } from "solid-js"
import { isServer } from "solid-js/web"
import {
	isShowModifiers,
	setIsShowModifiers,
	isShowMenu,
	setIsShowMenu,
	isShowDisplay,
	setIsShowDisplay,
	panelRef
} from "~/global_state"
import { Dialog, DialogContent, DialogTrigger } from "~/registry/ui/dialog"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "~/registry/ui/tooltip"
import Tutorial from "~/components/tutorial"

export default function Topbar() {
	const [initialized, setInitialized] = createSignal(false)
	const { colorMode } = useColorMode()
	const [isDialogOpen, setIsDialogOpen] = createSignal(false)

	createEffect(() => {
		if (!isServer && !initialized()) {
			setInitialized(true)
		}
	})

	return (
		<nav class={cn("bg-zinc-800 text-foreground", colorMode() === "dark" ? "bg-slate-800" : "")}>
			<div class="flex items-center justify-between font-inter w-full">
				<ul class="flex items-center justify-between text-gray-200 text-xs w-full mr-6">
					<li class={` mx-1.5 sm:mx-6`}>
						<a href="/">Main</a>
					</li>
					<div class="flex items-center gap-1">
						<li
							class="px-2 py-1 rounded-md hover:bg-zinc-700"
							onClick={() => setIsShowMenu(!isShowMenu())}
						>
							{isShowMenu() ? (
								<div class="i-carbon:open-panel-filled-left w-5 h-5" />
							) : (
								<div class="i-carbon:open-panel-left w-5 h-5" />
							)}
						</li>
						<li class="min-w-10">
							<button
								class="px-2 py-1 rounded-md hover:bg-zinc-700  text-center text-[.65rem]"
								onClick={() => setIsShowModifiers(!isShowModifiers())}
							>
								{isShowModifiers() ? (
									<div class="i-fluent:tetris-app-24-filled w-5 h-5" />
								) : (
									<div class="i-material-symbols:grid-view w-5 h-5" />
								)}
							</button>
						</li>
						{/* 	<li class="min-w-10">
							<button
								class="px-2 py-1 rounded-md hover:bg-zinc-700  text-center text-[.65rem]"
								onClick={() => setIsShowTesting(!isShowTesting())}
							>
								{isShowTesting() ? <div class="i-mingcute:grid-2-fill w-5 h-5" /> : <div class="i-ri:apps-2-fill w-5 h-5" />}
							</button>
						</li> */}
						<li
							class="px-2 py-1 rounded-md hover:bg-zinc-700"
							onClick={() => {
								setIsShowDisplay(!isShowDisplay())
								if (panelRef()) {
									panelRef().collapse()
								}
							}}
						>
							{isShowDisplay() ? (
								<div class="i-carbon:open-panel-filled-right w-5 h-5" />
							) : (
								<div class="i-carbon:open-panel-right w-5 h-5" />
							)}
						</li>
						<Dialog
							open={isDialogOpen()}
							onOpenChange={setIsDialogOpen}
						>
							<DialogTrigger>
								<Tooltip
									openDelay={1000}
									closeDelay={0}
								>
									<TooltipTrigger
										as={Button}
										variant="ghost"
										size="icon"
										class="px-2 py-1 rounded-md hover:bg-zinc-700 ml-6"
									>
										<div class="i-fluent-mdl2:education w-6 h-6" />
									</TooltipTrigger>
									<TooltipContent>Tutorial</TooltipContent>
								</Tooltip>
							</DialogTrigger>

							<DialogContent class="w-full max-w-3xl text-foreground">
								<Tutorial />
							</DialogContent>
						</Dialog>
					</div>
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
