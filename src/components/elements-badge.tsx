import { createSignal, Show, Accessor, onMount } from "solid-js"
import { ErrorBoundary } from "solid-js"
import { Select, createOptions, fuzzyHighlight, fuzzySort } from "@thisbeyond/solid-select"
import "@thisbeyond/solid-select/style.css"
import "./styling-select-search.css"
import { Button } from "~/registry/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { Badge as BadgeType } from "~/types/badgeType"
import {
	allBadgesGroup,
	setAllBadgesGroup,
	entityItems,
	groupBadge,
	badge,
	availableBadges,
	setAvailableBadges
} from "~/global_state"
import { Item } from "~/types/entityType"
import { storeEntityMap } from "~/helpers/entityHelpers"
import { ReactiveMap } from "@solid-primitives/map"

interface ElementsBadgeProps {
	item: Item
	isBadgeSelectEdit: boolean
	setIsBadgeSelectEdit: (value: boolean) => void
	selectedValues: Accessor<any[]>
	setSelectedValues: (value: any[]) => void
	body?: string
}

export default function ElementsBadge(props: ElementsBadgeProps) {
	const createValue = (name: string, icon: string) => {
		return { id: crypto.randomUUID(), name, icon, itemsIds: [] } as unknown as BadgeType
	}

	const [options, setOptions] = createSignal([...allBadgesGroup()])
	const [prevSelected, setPrevSelected] = createSignal<BadgeType[]>(props.selectedValues())
	const [inputValueKey, setInputValueKey] = createSignal("")

	onMount(() => {
		setOptions([...allBadgesGroup()])
	})

	onMount(() => {
		setAvailableBadges([...badge.values()])
	})

	const handleKeyDown = (el: HTMLSpanElement, e: KeyboardEvent) => {
		if (((e.key === "s" || e.key === "S") && e.ctrlKey) || (e.key === "Enter" && inputValueKey() === "")) {
			el.blur()
			e.preventDefault() // Prevent default browser save action
			props.setIsBadgeSelectEdit(false)
			//storeEntityMap()
		}
	}

	const onChangeHandler = (selected: BadgeType[]) => {
		setInputValueKey("")

		if (
			selected.length === props.selectedValues().length &&
			selected.every((s, i) => s.id === props.selectedValues()[i].id)
		)
			return // prevent running onMount <Show when={true}>

		// tracks selected values
		setPrevSelected(props.selectedValues())
		props.setSelectedValues(selected)

		// sets badges to Element
		const currentItem = entityItems.get(props.item.group)?.get(props.item.id)
		if (currentItem) {
			currentItem.labels = selected
			entityItems.get(props.item.group)?.set(props.item.id, currentItem)
			storeEntityMap()
		}

		// sets badges to all Badges
		selected.forEach(b => {
			if (!badge.has(b.id)) {
				badge.set(b.id, b)
			}
		})

		// sets badges to groupBadge
		selected.forEach(bdg => {
			if (!groupBadge.has(props.item.group)) {
				groupBadge.set(props.item.group, new ReactiveMap())
			}
			const groupBadgeMap = groupBadge.get(props.item.group)
			if (groupBadgeMap) {
				// Check if badgeID exists in groupBadgeMap
				if (!groupBadgeMap.has(bdg.id)) {
					groupBadgeMap.set(bdg.id, [...(groupBadgeMap.get(bdg.id) || []), props.item.id])
				}
				// Prune any deleted itemIds from the groupBadgeMap
				const currentItems = entityItems.get(props.item.group)
				if (currentItems) {
					const validItemIds =
						groupBadge
							.get(props.item.group)
							?.get(bdg.id)
							?.filter(id => currentItems.has(id)) || []
					groupBadgeMap.set(bdg.id, validItemIds)
				}
				// Check if itemID exists in badgeID
				if (!groupBadgeMap.get(bdg.id)?.includes(props.item.id)) {
					groupBadgeMap.get(bdg.id)?.push(props.item.id)
				}
				// Check if the item ID is already associated with the badge
				if (groupBadgeMap.get(bdg.id)?.includes(props.item.id)) {
					// Optionally handle the case where the item ID is already present
					console.log(`Item ID ${props.item.id} is already associated with badge ID ${bdg.id}`)
				}
				// Sets groupBadgeMap to groupBadge
				groupBadge.set(props.item.group, groupBadgeMap)
			}
		})

		// Remove item ID from badges no longer selected
		const removedBadges = prevSelected().filter(b => !selected.some(s => s.id === b.id))
		removedBadges.forEach(b => {
			const groupBadgeMap = groupBadge.get(props.item.group)
			if (groupBadgeMap && groupBadgeMap.has(b.id)) {
				const itemIds = groupBadgeMap.get(b.id)
				if (itemIds) {
					const updatedItemIds = itemIds.filter(id => id !== props.item.id)
					groupBadgeMap.set(b.id, updatedItemIds)
				}
			}
		})

		if (selected.length > 0) {
			const lastValue = selected[selected.length - 1]
			if (lastValue && !options().some(option => option.id === lastValue.id || option.name === lastValue.name)) {
				setOptions([...options(), lastValue])
				setAllBadgesGroup([...allBadgesGroup(), lastValue])
			}
		}
		storeEntityMap()
		//TODO: This is a temporary fix to update the available badges. It should be removed when the entity map is updated to include the new badges.
		setAvailableBadges([...badge.values()])
	}

	const format = (value: any, type: any, meta: any) => (
		<div class="flex items-center gap-1">
			<span>
				{meta.highlight ?? value.name} {/* {value.icon} */}
			</span>
			{/* {value.id.slice(-4)} */}
		</div>
	)

	const filterable = (inputValue: string, options: any[]) => {
		setInputValueKey(inputValue)
		return fuzzySort(inputValue, options, "text").map(result => ({
			...result.item,
			label: format(result.item.value, "label", {
				highlight: fuzzyHighlight(result, (match: string) => <b>{match}</b>)
			})
		}))
	}

	const createable = (inputValue: string, exists: boolean) => {
		if (exists) return
		const name = inputValue.toLowerCase()

		const selectIcon = () => {
			const icons = "i-tabler:circle-dashed"

			return icons
		}

		return createValue(name, selectIcon())
	}

	const extractText = (value: any) => value.name

	const disable = (value: any) => {
		return props.selectedValues().some(v => v.id === value.id || v.id === value.value?.id)
	}

	const prop = createOptions(availableBadges() || [], {
		format,
		filterable,
		createable,
		extractText,
		disable
	})

	const emptyPlaceholder = () =>
		availableBadges().some(option => option.name === "grapes") ? "No more options" : "Create a new badge"

	const focusElement = (el: HTMLSpanElement) => {
		onMount(() => el.focus())
		el.onkeydown = e => {
			handleKeyDown(el, e)
		}
		el.onblur = () => {
			props.setIsBadgeSelectEdit(false)
		}
	}

	return (
		<div class="flex flex-1 flex-col max-w-full gap-3">
			<Show when={props.isBadgeSelectEdit}>
				<div class="flex items-center w-full gap-1">
					<div class="flex items-center w-full">
						<ErrorBoundary fallback={<div>Error</div>}>
							<Select
								class="custom flex-grow"
								multiple
								ref={el => focusElement(el)}
								initialValue={props.selectedValues()}
								onChange={onChangeHandler}
								emptyPlaceholder={emptyPlaceholder()}
								{...prop}
							/>
						</ErrorBoundary>
					</div>

					<Tooltip
						openDelay={1000}
						closeDelay={0}
					>
						<TooltipTrigger
							as={Button}
							onClick={() => props.setIsBadgeSelectEdit(false)}
							variant="ghost"
							size="icon"
							class="h-9 ml-3"
						>
							<div class="i-ic:round-rocket-launch w-1.25em h-1.25em" />
						</TooltipTrigger>
						<TooltipContent>Save Element Badges</TooltipContent>
					</Tooltip>
				</div>
			</Show>
			<Show when={false}>
				<div class="text-sm mt-2 bg-yellow-500/20 p-3">
					Selected values:
					<br />
					{JSON.stringify(
						allBadgesGroup().filter((badge: BadgeType) => props.selectedValues().some(selected => selected.id === badge.id))
					)}
				</div>
			</Show>
		</div>
	)
}
