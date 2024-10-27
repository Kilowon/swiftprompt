import { createShortcut } from "@solid-primitives/keyboard"
import { createEffect, createSignal, Show } from "solid-js"
import { isServer } from "solid-js/web"
import { cookieStorage, makePersisted } from "@solid-primitives/storage"
import { entityItems, selected, selectedTemplateGroup, setColorFooter, templates } from "~/global_state"
import { Resizable, ResizableHandle, ResizablePanel } from "~/registry/ui/resizable"
import { Separator } from "~/registry/ui/separator"
import { cn } from "~/lib/utils"
import { Navigate } from "~/components/navigate"
import ElementsContainer from "~/components/elements-container"
import { GroupContainerMenu } from "~/components/group-container-menu"
import TemplateContainerMenu from "~/components/template-container-menu"
import GroupContainerSearch from "~/components/group-container-search"
import { PromptItem, GroupID, VersionID, BadgeID } from "~/types/entityType"
import { groupsMap } from "~/helpers/actionHelpers"
import { ReactiveMap } from "@solid-primitives/map"
import TemplateVersions from "~/components/template-versions"
import TemplateContainer from "~/components/template-container"
import PromptDisplay from "~/components/prompt-display"
import TemplateModifiersContainer from "~/components/template-modifiers-container"

let body = new ReactiveMap<VersionID, string>()

body.set(1, "Body Version One")
body.set(2, "Body Version Two")

const testNavArray: PromptItem[] = [
	{
		name: "Element One",
		type: "item",
		description: "description One",
		summary: "summary One",
		body: body,
		date_created: "2024-01-01",
		date_modified: "2024-01-01",
		id: { id: "1" },
		group: { id: "1" },
		labels: [
			{ name: "Label One", id: "1" as unknown as BadgeID, icon: "i-material-symbols-light:push-pin" },
			{ name: "Label Two", id: "2" as unknown as BadgeID, icon: "i-material-symbols-light:push-pin" }
		],
		versionCounter: 1,
		selectedVersion: 1,
		order: "1",
		status: "active"
	},
	{
		name: "Element Two",
		type: "item",
		description: "description Two",
		summary: "summary Two",
		body: body,
		date_created: "2024-01-01",
		date_modified: "2024-01-01",
		id: { id: "1" },
		group: { id: "1" },
		labels: [
			{ name: "Label One", id: "1" as unknown as BadgeID, icon: "i-material-symbols-light:push-pin" },
			{ name: "Label Two", id: "2" as unknown as BadgeID, icon: "i-material-symbols-light:push-pin" }
		],
		versionCounter: 1,
		selectedVersion: 1,
		order: "2",
		status: "active"
	}
]

const [testNav, setTestNav] = createSignal<PromptItem[]>(testNavArray)

export default function Home() {
	const [isCollapsedMenu, setIsCollapsedMenu] = createSignal(false)
	const [isCollapsedGroup, setIsCollapsedGroup] = createSignal(false)
	const [isCollapsedTemplate, setIsCollapsedTemplate] = createSignal(false)
	const [isCollapsedViewer, setIsCollapsedViewer] = createSignal(false)
	const [isEditingTemplateSection, setIsEditingTemplateSection] = createSignal({ status: "saved" })
	const [initializedUserElement, setInitializedUserElement] = createSignal(false)
	const [initializedUserGroup, setInitializedUserGroup] = createSignal(false)
	const [isFullElements, setIsFullElements] = createSignal<boolean>(true)

	const [itemsList, setItemsList] = createSignal<PromptItem[]>([
		...(entityItems.get(selected() as unknown as GroupID)?.values() ?? [])
	] as PromptItem[])

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
		setItemsList([...(entityItems.get(selected() as unknown as GroupID)?.values() ?? [])] as PromptItem[])
	})

	createEffect(() => {
		if (selected() !== null && selected() !== undefined && Array.from(groupsMap().values()).length > 0) {
			setInitializedUserGroup(true)
		} else {
			setInitializedUserGroup(false)
		}

		if (
			entityItems.get(selected() as unknown as GroupID)?.values() !== null &&
			entityItems.get(selected() as unknown as GroupID)?.values() !== undefined &&
			Array.from(entityItems.get(selected() as unknown as GroupID)?.keys() ?? []).length > 0
		) {
			setInitializedUserElement(true)
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
						{/* Side Menu */}
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
							<div class="px-2 flex items-center justify-center bg-background-secondary min-h-14">
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
							</div>
							<Separator />
							<div class="h-full bg-background-secondary">
								<Navigate
									isCollapsed={isCollapsedMenu()}
									groups={Array.from(groupsMap().values()).map((group: any) => {
										return {
											title: group.name,
											...group
										}
									})}
									templates={Array.from(templates.values()).map((template: any) => {
										return {
											title: template.name,
											sections: template.sections,
											...template
										}
									})}
								/>
							</div>
						</ResizablePanel>
						<ResizableHandle withHandle />
						{/* Group + Elements */}
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
								<div class="flex flex-col h-full">
									<div class="items-center px-2 py-2 min-h-14">
										<GroupContainerMenu />
									</div>

									<Separator />
									<GroupContainerSearch
										isFullElements={isFullElements}
										setIsFullElements={setIsFullElements}
									/>
									<div class="flex-1 overflow-auto pb-10">
										<ElementsContainer
											type="all"
											sizes={sizes()}
											items={itemsList}
											initializedUserElement={initializedUserElement}
											initializedUserGroup={initializedUserGroup}
											isFullElements={isFullElements}
											setIsFullElements={setIsFullElements}
										/>
									</div>
								</div>
							</Show>
						</ResizablePanel>
						<ResizableHandle withHandle />
						{/* Templates + Sections */}
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
								<div class="flex flex-col h-full">
									<div class="items-center py-2 bg-background-secondary min-h-14">
										<div class="flex items-center gap-2">
											<TemplateContainerMenu />
										</div>
									</div>
									<Separator />
									<div class="p-4 bg-background-secondary">
										<Show
											when={selectedTemplateGroup()}
											fallback={<div class="flex justify-end items-center gap-2 h-10"></div>}
										>
											<TemplateVersions version={templates.get(selectedTemplateGroup()!)?.versionCounter ?? 0} />
										</Show>
									</div>
									<div class="bg-background overflow-auto">
										<TemplateModifiersContainer />
									</div>
									<div class="flex-1 bg-background-secondary overflow-auto pb-10">
										<TemplateContainer
											isEditingTemplateSection={isEditingTemplateSection}
											setIsEditingTemplateSection={setIsEditingTemplateSection}
											setIsFullElements={setIsFullElements}
										/>
									</div>
								</div>
							</Show>
						</ResizablePanel>
						<ResizableHandle withHandle />
						{/* Prompt + Response Display */}
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
							<div class="h-100% pb-10">
								<PromptDisplay />
							</div>
						</ResizablePanel>
					</Resizable>
				</Show>
			</div>
		</main>
	)
}
