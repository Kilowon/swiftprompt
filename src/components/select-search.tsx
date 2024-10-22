import { For, Show, createEffect } from "solid-js"
import { Badge } from "~/registry/ui/badge"
import { Select, createOptions, fuzzyHighlight, fuzzySort } from "@thisbeyond/solid-select"
import "@thisbeyond/solid-select/style.css"
import "./styling-select-search.css"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { searchSelectedBadges, setSearchSelectedBadges, allBadgesGroup, setAllBadgesGroup, badge } from "~/global_state"
import { Badge as BadgeType } from "~/types/badgeType"
import { groupBadge, selected } from "~/global_state"
import { BadgeID, GroupID } from "~/types/entityType"

interface Badge {
	id: BadgeID
	name: string
	icon: string
	itemsIds: string[]
}

export const SelectSearch = () => {
	const createValue = (name: string, icon: string) => {
		return { id: crypto.randomUUID() as unknown as BadgeID, name, icon, itemsIds: [] } as unknown as BadgeType
	}

	createEffect(() => {
		const candidates = Array.from(groupBadge.get(selected() as unknown as GroupID)?.keys() ?? [])
		const allBadges = candidates.map(id => badge.get(id)).filter((badge): badge is Badge => badge !== undefined)
		setAllBadgesGroup(allBadges)
	})

	const onChange = (selected: Badge[]) => {
		setSearchSelectedBadges(selected)

		const lastValue = selected[selected.length - 1]
		if (lastValue && !allBadgesGroup().some(option => option.id === lastValue.id || option.name === lastValue.name)) {
			setAllBadgesGroup([...allBadgesGroup(), lastValue])
		}
	}

	const format = (value: any, type: any, meta: any) => (
		<div class="flex items-center gap-1">
			<span>
				{meta.highlight ?? value.name} {/* {value.icon} */}
			</span>
		</div>
	)

	const filterable = (inputValue: string, options: any[]) => {
		return fuzzySort(inputValue, options, "text").map(result => ({
			...result.item,
			label: format(result.item.value, "label", {
				highlight: fuzzyHighlight(result, (match: string) => <b>{match}</b>)
			})
		}))
	}

	const extractText = (value: any) => value.name

	const disable = (value: any) => searchSelectedBadges().some(badge => badge.id === value.id)

	const props = createOptions(() => allBadgesGroup(), {
		format,
		filterable,
		extractText,
		disable
	})

	const emptyPlaceholder = () =>
		allBadgesGroup().some(option => option.name === "grapes") ? "No more options" : "Try 'grapes'!"

	return (
		<div class="flex flex-1 flex-col max-w-100 min-h-18 gap-3">
			<div class="flex items-center w-full gap-1">
				<div class="flex items-center w-full">
					<Select
						class="custom flex-grow"
						multiple
						initialValue={searchSelectedBadges()}
						onChange={onChange}
						emptyPlaceholder={emptyPlaceholder()}
						{...props}
					/>
				</div>
				<Tooltip
					openDelay={1000}
					closeDelay={0}
				>
					<TooltipTrigger
						as={Button}
						onClick={() => setSearchSelectedBadges([])}
						variant="ghost"
						size="icon"
						class="h-9"
					>
						<div class="i-mdi:clear w-1.15em h-1.15em" />
					</TooltipTrigger>
					<TooltipContent>Clear Search</TooltipContent>
				</Tooltip>
			</div>
			<div class="flex gap-3 text-sm items-center flex-wrap ">
				<For
					each={Array.from(groupBadge.get(selected() as unknown as GroupID)?.entries() ?? [])
						.filter(([id, _]) => !searchSelectedBadges().some(badge => badge.id === id))
						.sort(([_, a], [__, b]) => b.length - a.length)
						.slice(0, 5)
						.map(([id, _]) => badge.get(id))
						.filter((badge): badge is Badge => badge !== undefined)}
				>
					{option => (
						<div>
							<button onClick={() => setSearchSelectedBadges([...searchSelectedBadges(), option])}>
								<Badge variant={"outline"}>{option.name || ""}</Badge>
							</button>
						</div>
					)}
				</For>
			</div>
			<Show when={false}>
				<div class="text-sm mt-2 bg-yellow-500/20 p-3">
					Selected values:
					<br />
					{JSON.stringify(searchSelectedBadges())}
				</div>
			</Show>
		</div>
	)
}
