import { For, Show, createSignal, createEffect } from "solid-js"
import { cn } from "~/lib/utils"
import { buttonVariants } from "~/registry/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import {
	selected,
	setSelected,
	selectedTemplateGroup,
	setSelectedTemplateGroup,
	setSelectedSection,
	entityItems,
	templates,
	selectedTemplateVersion,
	setSelectedTemplateVersion,
	setSelectedModifierGroup,
	selectedModifierGroup,
	entityModifiers
} from "~/global_state"
import {
	Group,
	GroupID,
	TemplateGroupID,
	Filter,
	VersionID,
	TemplateSectionID,
	TemplateSection,
	TemplateFilter,
	ModifierGroupID
} from "~/types/entityType"
import { ReactiveMap } from "@solid-primitives/map"

interface NavProps {
	isCollapsed: boolean
	groups: {
		title: string
		label: string
		sort: Filter
		id: GroupID
	}[]
	templates: {
		title: string
		label: string
		sort: TemplateFilter
		id: TemplateGroupID
		versionCounter: VersionID
		sections: ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>
	}[]
	modifiers: {
		title: string
		label: string
		sort: Filter
		id: TemplateGroupID
		versionCounter: VersionID
		sections: ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>
	}[]
}

interface Selected {
	id: GroupID
}

export function Navigate(props: NavProps) {
	const [templateFilter, setTemplateFilter] = createSignal<TemplateFilter>("all")
	const [groupFilter, setGroupFilter] = createSignal<Filter>("all")
	const [modifierFilter, setModifierFilter] = createSignal<Filter>("all")
	const [expandedSections, setExpandedSections] = createSignal<Set<"groups" | "templates" | "modifiers">>(new Set())

	const handleSelect = (id: GroupID) => {
		setSelected(id)
	}

	const handleSelectTemplateGroup = (id: TemplateGroupID) => {
		setSelectedSection(null)
		setSelectedTemplateGroup(id)
		setSelectedTemplateVersion(null)
	}

	const handleSelectModifierGroup = (id: ModifierGroupID) => {
		setSelectedSection(null)
		setSelectedModifierGroup(id)
	}

	const toggleSection = (section: "groups" | "templates" | "modifiers") => {
		setExpandedSections(prev => {
			const newSet = new Set(prev)
			if (newSet.has(section)) {
				newSet.delete(section)
			} else {
				newSet.add(section)
			}
			return newSet
		})
	}

	const getSectionHeight = (section: "groups" | "templates" | "modifiers") => {
		const expanded = expandedSections()
		if (expanded.size === 0) return "h-0"
		if (expanded.size === 1) return expanded.has(section) ? "h-[calc(96vh-12rem)]" : "h-0"
		if (expanded.size === 2) return expanded.has(section) ? "h-[calc(48vh-6rem)]" : "h-0"
		return "h-[calc(31.66vh-4rem)]" // One third height when all three are open
	}

	return (
		<div
			data-collapsed={props.isCollapsed}
			class="group flex flex-col h-full py-2 data-[collapsed=true]:py-2 bg-background-secondary select-none"
		>
			<div class="flex flex-col">
				<div
					class="flex items-center justify-between mb-2 cursor-pointer"
					onClick={() => toggleSection("groups")}
				>
					<div class="text-[10px] font-semibold text-accent group-[[data-collapsed=false]]:ml-2 group-[[data-collapsed=true]]:text-[8px] group-[[data-collapsed=true]]:ml-1.2">
						Groups {expandedSections().has("groups") ? "▼" : "▶"}
					</div>
					<div
						onClick={e => {
							e.stopPropagation()
							setGroupFilter(prev =>
								prev === "all"
									? "preset"
									: prev === "preset"
									? "project"
									: prev === "project"
									? "collection"
									: prev === "collection"
									? "archived"
									: prev === "archived"
									? "favorite"
									: prev === "favorite"
									? "image"
									: prev === "image"
									? "voice"
									: prev === "voice"
									? "system"
									: prev === "system"
									? "user"
									: prev === "user"
									? "audio"
									: prev === "audio"
									? "business"
									: prev === "business"
									? "marketing"
									: prev === "marketing"
									? "social"
									: prev === "social"
									? "email"
									: prev === "email"
									? "website"
									: prev === "website"
									? "other"
									: "all"
							)
						}}
						class={`text-[10px] font-semibold group-[[data-collapsed=true]]:invisible mr-2 py-1 px-2 rounded-md cursor-pointer ${
							groupFilter() === "all" ? "text-accent bg-background border border-border" : "text-accent-foreground bg-accent"
						}`}
					>
						<span class="select-none">{groupFilter() === "all" ? "All" : groupFilter()}</span>
					</div>
				</div>
				<hr class="w-full border-muted" />
				<nav
					class={`overflow-y-auto scrollbar-none group-[[data-collapsed=true]]:px-2 group-[[data-collapsed=false]]:mx-1 transition-all duration-300 ${getSectionHeight(
						"groups"
					)}`}
				>
					<div class="pb-30">
						<For each={groupFilter() === "all" ? props.groups : props.groups.filter(group => group.sort === groupFilter())}>
							{group => {
								return (
									<Show
										when={props.isCollapsed}
										fallback={
											<a
												onClick={() => handleSelect(group.id)}
												class={cn(
													buttonVariants({
														variant: selected() === group.id ? "outline_selected" : "outline_only",
														size: "sm",
														class: "text-xs capitalize cursor-pointer hover:border-accent group-[[data-collapsed=false]]:max-h-7.5"
													}),
													selected() === group.id && " bg-accent border-background text-accent-foreground",
													"flex justify-between"
												)}
											>
												<span class="truncate max-w-30 select-none">{group.title}</span>
												<span class={cn("flex-shrink-0 ml-auto")}>{entityItems.get(group.id)?.size ?? 0}</span>
											</a>
										}
									>
										<Tooltip
											openDelay={0}
											closeDelay={0}
											placement="right"
										>
											<TooltipTrigger
												as="a"
												href="#"
												onClick={() => handleSelect(group.id)}
												class={cn(
													buttonVariants({ variant: selected() === group.id ? "outline_selected" : "outline_only", size: "icon" }),
													"size-9 capitalize hover:border-accent",
													selected() === group.id && "bg-accent border-background text-accent-foreground"
												)}
												tabIndex={0} // Make it focusable
												onKeyPress={(e: KeyboardEvent) => e.key === "Enter" && handleSelect(group.id)} // Handle keyboard interaction
											>
												<div
													// Handle keyboard interaction
													class="flex items-center justify-center size-6 rounded-full text-sm"
												>
													{group.title.slice(0, 2)}
												</div>
												<span class="sr-only">{group.title}</span>
											</TooltipTrigger>
											<TooltipContent class="flex items-center gap-4">
												{group.title}
												<span class={cn("ml-auto", selected() === group.id && "dark:text-white")}>
													{entityItems.get(group.id)?.size ?? 0}
												</span>
											</TooltipContent>
										</Tooltip>
									</Show>
								)
							}}
						</For>
					</div>
				</nav>
			</div>

			<hr class="w-full border-foreground/30" />
			<div class="flex flex-col mt-2">
				<div
					class="flex items-center justify-between mb-2 cursor-pointer"
					onClick={() => toggleSection("templates")}
				>
					<div class="text-[10px] font-semibold text-accent group-[[data-collapsed=false]]:ml-2 group-[[data-collapsed=true]]:text-[8px] group-[[data-collapsed=true]]:ml-1">
						Templates {expandedSections().has("templates") ? "▼" : "▶"}
					</div>
					<div
						onClick={e => {
							e.stopPropagation()
							setTemplateFilter(prev =>
								prev === "all"
									? "preset"
									: prev === "preset"
									? "project"
									: prev === "project"
									? "collection"
									: prev === "collection"
									? "archived"
									: prev === "archived"
									? "favorite"
									: prev === "favorite"
									? "image"
									: prev === "image"
									? "voice"
									: prev === "voice"
									? "system"
									: prev === "system"
									? "user"
									: prev === "user"
									? "audio"
									: prev === "audio"
									? "business"
									: prev === "business"
									? "marketing"
									: prev === "marketing"
									? "social"
									: prev === "social"
									? "email"
									: prev === "email"
									? "website"
									: prev === "website"
									? "other"
									: "all"
							)
						}}
						class={`text-[10px] font-semibold group-[[data-collapsed=true]]:invisible mr-2 py-1 px-2 rounded-md cursor-pointer ${
							templateFilter() === "all"
								? "text-accent bg-background border border-border"
								: "text-accent-foreground bg-accent"
						}`}
					>
						<span class="select-none">{templateFilter() === "all" ? "All" : templateFilter()}</span>
					</div>
				</div>
				<hr class="w-full border-muted" />
				<nav
					class={`overflow-y-auto scrollbar-none group-[[data-collapsed=true]]:px-2 group-[[data-collapsed=false]]:mx-1 transition-all duration-300 ${getSectionHeight(
						"templates"
					)}`}
				>
					<div class="pb-30">
						<For
							each={
								templateFilter() === "all"
									? props.templates
									: props.templates.filter(template => template.sort === templateFilter())
							}
						>
							{template => {
								return (
									<Show
										when={props.isCollapsed}
										fallback={
											<a
												onClick={() => handleSelectTemplateGroup(template.id)}
												class={cn(
													buttonVariants({
														variant: selectedTemplateGroup() === template.id ? "outline_selected" : "outline_only",
														size: "sm",
														class:
															"flex justify-between text-xs capitalize cursor-pointer hover:border-accent group-[[data-collapsed=false]]:max-h-7.5"
													}),
													selectedTemplateGroup() === template.id && " bg-accent border-background text-accent-foreground",
													"justify-start"
												)}
											>
												<span class="truncate max-w-30 select-none">{template.title}</span>
												<span class={cn("flex-shrink-0 ml-auto", selectedTemplateGroup() === template.id && " dark:text-white")}>
													{template.sections.get(template.versionCounter as VersionID)?.size ?? 0}
												</span>
											</a>
										}
									>
										<Tooltip
											openDelay={0}
											closeDelay={0}
											placement="right"
										>
											<TooltipTrigger
												as="a"
												href="#"
												onClick={() => handleSelectTemplateGroup(template.id)}
												class={cn(
													buttonVariants({
														variant: selectedTemplateGroup() === template.id ? "outline_selected" : "outline_only",
														size: "icon"
													}),
													"size-9 capitalize hover:border-accent",
													selectedTemplateGroup() === template.id && "bg-accent border-background text-accent-foreground"
												)}
											>
												<div class="flex items-center justify-center size-6 rounded-full text-sm">{template.title.slice(0, 2)}</div>
												<span class="sr-only">{template.title}</span>
											</TooltipTrigger>
											<TooltipContent class="flex items-center gap-4">
												{template.title}
												<span class={cn("ml-auto", selectedTemplateGroup() === template.id && "dark:text-white")}>
													{template.sections.get(template.versionCounter as VersionID)?.size ?? 0}
												</span>
											</TooltipContent>
										</Tooltip>
									</Show>
								)
							}}
						</For>
					</div>
				</nav>
			</div>
			<hr class="w-full border-foreground/30" />
			<div class="flex flex-col mt-2">
				<div
					class="flex items-center justify-between mb-2 cursor-pointer"
					onClick={() => toggleSection("modifiers")}
				>
					<div class="text-[10px] font-semibold text-accent group-[[data-collapsed=false]]:ml-2 group-[[data-collapsed=true]]:text-[8px] group-[[data-collapsed=true]]:ml-1">
						Modifiers {expandedSections().has("modifiers") ? "▼" : "▶"}
					</div>
					<div
						onClick={e => {
							e.stopPropagation()
							setModifierFilter(prev =>
								prev === "all"
									? "preset"
									: prev === "preset"
									? "project"
									: prev === "project"
									? "collection"
									: prev === "collection"
									? "archived"
									: prev === "archived"
									? "favorite"
									: prev === "favorite"
									? "image"
									: prev === "image"
									? "voice"
									: prev === "voice"
									? "system"
									: prev === "system"
									? "user"
									: prev === "user"
									? "audio"
									: prev === "audio"
									? "business"
									: prev === "business"
									? "marketing"
									: prev === "marketing"
									? "social"
									: prev === "social"
									? "email"
									: prev === "email"
									? "website"
									: prev === "website"
									? "other"
									: "all"
							)
						}}
						class={`text-[10px] font-semibold group-[[data-collapsed=true]]:invisible mr-2 py-1 px-2 rounded-md cursor-pointer ${
							modifierFilter() === "all"
								? "text-accent bg-background border border-border"
								: "text-accent-foreground bg-accent"
						}`}
					>
						<span class="select-none">{modifierFilter() === "all" ? "All" : modifierFilter()}</span>
					</div>
				</div>
				<hr class="w-full border-muted" />
				<nav
					class={`overflow-y-auto scrollbar-none group-[[data-collapsed=true]]:px-2 group-[[data-collapsed=false]]:mx-1 transition-all duration-300 ${getSectionHeight(
						"modifiers"
					)}`}
				>
					<div class="pb-30">
						<For
							each={
								modifierFilter() === "all"
									? props.modifiers
									: props.modifiers.filter(modifier => modifier.sort === modifierFilter())
							}
						>
							{template => {
								return (
									<Show
										when={props.isCollapsed}
										fallback={
											<a
												onClick={() => handleSelectModifierGroup(template.id)}
												class={cn(
													buttonVariants({
														variant: selectedModifierGroup() === template.id ? "outline_selected" : "outline_only",
														size: "sm",
														class:
															"flex justify-between text-xs capitalize cursor-pointer hover:border-accent group-[[data-collapsed=false]]:max-h-7.5"
													}),
													selectedModifierGroup() === template.id && " bg-accent border-background text-accent-foreground",
													"justify-start"
												)}
											>
												<span class="truncate max-w-30 select-none">{template.title}</span>
												<span class={cn("flex-shrink-0 ml-auto", selectedModifierGroup() === template.id && " dark:text-white")}>
													{entityModifiers.get(template.id)?.size ?? 0}
												</span>
											</a>
										}
									>
										<Tooltip
											openDelay={0}
											closeDelay={0}
											placement="right"
										>
											<TooltipTrigger
												as="a"
												href="#"
												onClick={() => handleSelectModifierGroup(template.id)}
												class={cn(
													buttonVariants({
														variant: selectedModifierGroup() === template.id ? "outline_selected" : "outline_only",
														size: "icon"
													}),
													"size-9 capitalize hover:border-accent",
													selectedModifierGroup() === template.id && "bg-accent border-background text-accent-foreground"
												)}
											>
												<div class="flex items-center justify-center size-6 rounded-full text-sm">{template.title.slice(0, 2)}</div>
												<span class="sr-only">{template.title}</span>
											</TooltipTrigger>
											<TooltipContent class="flex items-center gap-4">
												{template.title}
												<span class={cn("ml-auto", selectedModifierGroup() === template.id && "dark:text-white")}>
													{entityModifiers.get(template.id)?.size ?? 0}
												</span>
											</TooltipContent>
										</Tooltip>
									</Show>
								)
							}}
						</For>
					</div>
				</nav>
			</div>
		</div>
	)
}
