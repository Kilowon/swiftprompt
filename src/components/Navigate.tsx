import { For, Show, createSignal, createEffect } from "solid-js"
import { cn } from "~/lib/utils"
import { buttonVariants } from "~/registry/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"

import {
	Group,
	GroupID,
	TemplateGroupID,
	Filter,
	VersionID,
	TemplateSectionID,
	TemplateSection,
	TemplateFilter
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
}

interface Selected {
	id: GroupID
}

const testNavArray = [
	{
		title: "Group One",
		sort: "all",
		id: "1"
	},
	{
		title: "Group Two",
		sort: "all",
		id: "2"
	},
	{
		title: "Group Three",
		sort: "all",
		id: "3"
	},
	{
		title: "Group Four",
		sort: "all",
		id: "4"
	},
	{
		title: "Group Five",
		sort: "all",
		id: "5"
	},
	{
		title: "Group Six",
		sort: "all",
		id: "6"
	},
	{
		title: "Group Seven",
		sort: "all",
		id: "7"
	},
	{
		title: "Group Eight",
		sort: "all",
		id: "8"
	},
	{
		title: "Group Nine",
		sort: "all",
		id: "9"
	},
	{
		title: "Group Ten",
		sort: "all",
		id: "10"
	}
]

const testTemplateArray = [
	{
		title: "Template One",
		sort: "all",
		id: "1",
		versionCounter: "1",
		sections: "1"
	},
	{
		title: "Template Two",
		sort: "all",
		id: "2",
		versionCounter: "2",
		sections: "2"
	},
	{
		title: "Template Three",
		sort: "all",
		id: "3",
		versionCounter: "3",
		sections: "3"
	},
	{
		title: "Template Four",
		sort: "all",
		id: "4",
		versionCounter: "4",
		sections: "4"
	},
	{
		title: "Template Five",
		sort: "all",
		id: "5",
		versionCounter: "5",
		sections: "5"
	}
]

export function Navigate(props: NavProps) {
	const [templateFilter, setTemplateFilter] = createSignal<TemplateFilter>("all")
	const [groupFilter, setGroupFilter] = createSignal<Filter>("all")

	return (
		<div
			data-collapsed={props.isCollapsed}
			class="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2 bg-background-secondary h-83vh select-none"
		>
			<div class="flex items-center justify-between">
				<div class="text-[10px] font-semibold text-accent group-[[data-collapsed=false]]:ml-2 group-[[data-collapsed=true]]:ml-2">
					Groups
				</div>
				<div
					onClick={() =>
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
					}
					class={`text-[10px] font-semibold group-[[data-collapsed=true]]:invisible mr-2 px-2 py-1 rounded-md cursor-pointer ${
						groupFilter() === "all" ? "text-accent bg-background border border-border" : "text-accent-foreground bg-accent"
					}`}
				>
					<span class="select-none">{groupFilter() === "all" ? "All" : groupFilter()}</span>
				</div>
			</div>
			<nav class="grid grid-cols-1 gap-1 h-50% group-[[data-collapsed=true]]:px-2 overflow-y-auto scrollbar-none content-start group-[[data-collapsed=false]]:mx-1">
				<For each={groupFilter() === "all" ? testNavArray : testNavArray.filter(group => group.sort === groupFilter())}>
					{group => {
						return (
							<Show
								when={props.isCollapsed}
								fallback={
									<a
										class={cn(
											buttonVariants({
												variant: "outline_only",
												size: "sm",
												class: "text-xs capitalize cursor-pointer hover:border-accent group-[[data-collapsed=false]]:max-h-7.5"
											}),
											" bg-accent border-background text-accent-foreground",
											"justify-start"
										)}
									>
										<span class="truncate max-w-30 select-none">{group.title}</span>
										<span class={cn("ml-auto")}>{"0"}</span>
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
										class={cn(
											buttonVariants({ variant: "outline_only", size: "icon" }),
											"size-9 capitalize hover:border-accent bg-accent border-background text-accent-foreground"
										)}
										tabIndex={0} // Make it focusable
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
										<span class={cn("ml-auto")}>{"0"}</span>
									</TooltipContent>
								</Tooltip>
							</Show>
						)
					}}
				</For>
			</nav>
			<div class="flex items-center justify-between">
				<div class="text-[10px] font-semibold text-accent group-[[data-collapsed=false]]:ml-2 group-[[data-collapsed=true]]:text-[8px] group-[[data-collapsed=true]]:ml-1">
					Templates
				</div>

				<div
					onClick={() =>
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
					}
					class={`text-[10px] font-semibold group-[[data-collapsed=true]]:invisible mr-2 px-2 py-1 rounded-md cursor-pointer ${
						templateFilter() === "all" ? "text-accent bg-background border border-border" : "text-accent-foreground bg-accent"
					}`}
				>
					<span class="select-none">{templateFilter() === "all" ? "All" : templateFilter()}</span>
				</div>
			</div>
			<nav class="grid grid-cols-1 gap-1 h-50% group-[[data-collapsed=true]]:px-2 overflow-y-auto scrollbar-none content-start  group-[[data-collapsed=false]]:mx-1">
				<For
					each={
						templateFilter() === "all"
							? testTemplateArray
							: testTemplateArray.filter(template => template.sort === templateFilter())
					}
				>
					{template => {
						return (
							<Show
								when={props.isCollapsed}
								fallback={
									<a
										class={cn(
											buttonVariants({
												variant: "outline_only",
												size: "sm",
												class: "text-xs capitalize cursor-pointer hover:border-accent group-[[data-collapsed=false]]:max-h-7.5"
											})
										)}
									>
										<span class="truncate max-w-30 select-none">{template.title}</span>
										<span class={cn("ml-auto")}>{template.sections}</span>
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
										class={cn(
											buttonVariants({
												variant: "outline_only",
												size: "icon"
											}),
											"size-9 capitalize hover:border-accent"
										)}
									>
										<div class="flex items-center justify-center size-6 rounded-full text-sm">{template.title.slice(0, 2)}</div>
										<span class="sr-only">{template.title}</span>
									</TooltipTrigger>
									<TooltipContent class="flex items-center gap-4">
										{template.title}
										<span class={cn("ml-auto")}>{template.sections}</span>
									</TooltipContent>
								</Tooltip>
							</Show>
						)
					}}
				</For>
			</nav>
		</div>
	)
}
