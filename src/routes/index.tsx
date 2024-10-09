import { createShortcut } from "@solid-primitives/keyboard"
import { createEffect, createSignal, Show } from "solid-js"
import { isServer } from "solid-js/web"
import { cookieStorage, makePersisted } from "@solid-primitives/storage"
import { setColorFooter } from "~/global_state"
import { Resizable, ResizableHandle, ResizablePanel } from "~/registry/ui/resizable"
import { Separator } from "~/registry/ui/separator"
import { cn } from "~/lib/utils"
import { Tabs, TabsContent } from "~/registry/ui/tabs"
import { Dialog, DialogContent } from "~/registry/ui/dialog"
import { Button } from "~/registry/ui/button"

export default function Home() {
	const [isCollapsedMenu, setIsCollapsedMenu] = createSignal(false)
	const [isCollapsedGroup, setIsCollapsedGroup] = createSignal(false)
	const [isCollapsedTemplate, setIsCollapsedTemplate] = createSignal(false)
	const [isCollapsedViewer, setIsCollapsedViewer] = createSignal(false)

	const [isClientSide, setIsClientSide] = createSignal(false)
	const [initialized, setInitialized] = createSignal(false)
	const [sizes, setSizes] = makePersisted(createSignal<number[]>([]), {
		name: "resizable-sizes",
		storage: cookieStorage,
		storageOptions: {
			path: "/"
		}
	})

	createEffect(() => {
		if (!isServer && !initialized()) {
			setIsClientSide(true)
			if (sizes().length === 0) {
				setSizes([0.1, 0.3, 0.3, 0.3]) // Default sizes
			}
			setInitialized(true)
		}
	})

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
		<main
			class="font-inter overflow-hidden bg-background shadow h-[100vh] flex flex-col debug-screens"
			tabIndex={0}
		>
			<div class="flex flex-col flex-grow-2 h-full">
				<Show when={isClientSide()}>
					<Resizable
						sizes={sizes()}
						onSizesChange={setSizes}
						class="h-full"
					>
						{/* Menu Switcher */}
						<ResizablePanel
							initialSize={sizes()[0] ?? 0.1}
							minSize={0.1}
							maxSize={0.15}
							collapseThreshold={0.01}
							collapsible
							onCollapse={e => {
								setIsCollapsedMenu(e === 0)
							}}
							onExpand={() => {
								setIsCollapsedMenu(false)
							}}
							class={cn(isCollapsedMenu() && "min-w-[50px] transition-all duration-150 ease-in-out overflow-hidden")}
						>
							{/* <AccountSwitcher isCollapsed={isCollapsed()} /> */}
							<div class="px-2 flex items-center justify-center bg-background-secondary min-h-14">
								{/* Creating Awkward Responses Leisurely */}
								<div
									class={cn(
										"font-bold",
										isCollapsedMenu() && "font-bold text-sm pt-2.5 pb-2.5",
										!isCollapsedMenu() && "ml-3 text-sm"
									)}
								>
									{isCollapsedMenu() ? <div class="i-material-symbols:wind-power-sharp w-1.25em h-1.25em"></div> : "SwiftPrompt"}
								</div>
								<div class="text-[0.5rem] font-semibold mb-0.5 text-accent group-[[data-collapsed=false]]:ml-2 group-[[data-collapsed=true]]:ml-2">
									Beta
								</div>
								<Show when={!isCollapsedMenu()}>
									<div class="my-5"></div>
								</Show>
							</div>
							<Separator />
							<div class="h-full bg-background-secondary">
								<div class="text-xs">Menu</div>
							</div>
						</ResizablePanel>
						<ResizableHandle withHandle />
						{/* Edit Group */}
						<ResizablePanel
							initialSize={sizes()[1] ?? 0.3}
							minSize={0.15}
							collapsible
							collapseThreshold={0.01}
							onCollapse={e => {
								setIsCollapsedGroup(e === 0)
							}}
							onExpand={() => {
								setIsCollapsedGroup(false)
							}}
							class={cn(isCollapsedGroup() && "min-w-6 transition-all duration-300 ease-in-out overflow-hidden")}
						>
							<Show
								when={!isCollapsedGroup()}
								fallback={
									<div class="flex flex-col items-center justify-center h-full px-2 py-2 min-h-[400px] h-[calc(100vh-280px)]  bg-background-background">
										<div class="rotate-90 text-xs">Group</div>
									</div>
								}
							>
								<Tabs defaultValue="all">
									<div class="flex items-center px-4 py-2 min-h-14">
										<div class="text-xs">Group Menu</div>
									</div>

									<Separator />

									<TabsContent
										value="all"
										class="m-0"
									>
										<div class="text-xs">Elements</div>
									</TabsContent>
								</Tabs>
							</Show>
						</ResizablePanel>
						<ResizableHandle withHandle />
						{/* Templates */}
						<ResizablePanel
							initialSize={sizes()[2] ?? 0.3}
							minSize={0.1}
							collapsible
							collapseThreshold={0.01}
							onCollapse={e => {
								setIsCollapsedTemplate(e === 0)
							}}
							onExpand={() => {
								setIsCollapsedTemplate(false)
							}}
							class={cn(isCollapsedTemplate() && "min-w-6 transition-all duration-300 ease-in-out overflow-hidden")}
						>
							<Show
								when={!isCollapsedTemplate()}
								fallback={
									<div class="flex flex-col items-center justify-center h-full px-2 py-2 bg-background-secondary">
										<div class="rotate-90 text-xs">Templates</div>
									</div>
								}
							>
								<div class="flex items-center px-4 py-2 bg-background-secondary min-h-14">
									<div class="flex items-center gap-2 ">
										<div class="text-xs">Template Menu</div>
									</div>
								</div>
								<Separator />
								<div class="p-4 bg-background-secondary">
									<div class="text-xs">Versions</div>
								</div>

								<div class="p-4 bg-background-secondary h-100% overflow-auto">
									<div class="text-xs">Templates</div>
								</div>
							</Show>
						</ResizablePanel>
						<ResizableHandle withHandle />
						{/* Viewer Display */}
						<ResizablePanel
							initialSize={sizes()[3] ?? 0.3}
							minSize={0.3}
							maxSize={0.4}
							collapsible
							collapseThreshold={0.01}
							onCollapse={e => {
								setIsCollapsedViewer(e === 0)
							}}
							onExpand={() => {
								setIsCollapsedViewer(false)
							}}
							class={cn(isCollapsedViewer() && "min-w-10 transition-all duration-300 ease-in-out overflow-hidden")}
						>
							<div class="flex items-center px-4 py-2 min-h-14">
								<div class="text-xs">Viewer</div>
							</div>
							<Separator />
							<div>
								<div class="text-xs">Response</div>
							</div>
						</ResizablePanel>
					</Resizable>
				</Show>
			</div>
		</main>
	)
}
