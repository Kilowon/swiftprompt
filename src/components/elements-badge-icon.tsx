import { createSignal, Show, createEffect, Accessor } from "solid-js"
import { cn } from "~/lib/utils"
import {
	Combobox,
	ComboboxContent,
	ComboboxControl,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxItemLabel,
	ComboboxSection,
	ComboboxTrigger
} from "~/registry/ui/combobox"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuPortal,
	DropdownMenuSubContent
} from "~/registry/ui/dropdown-menu"
import { selectedItem } from "~/global_state"
import { BadgeID, ElementID } from "~/types/entityType"
import { ALL_OPTIONS } from "./icon-list"
import { Button } from "~/registry/ui/button"

interface Food {
	value: string
	label: string
	disabled: boolean
}
interface Category {
	label: string
	options: Food[]
}

interface ElementsBadgeIconProps {
	itemId: ElementID
	badgeId: BadgeID
	iconSelection: Accessor<{ icon: string; name: string }>
	isBadgeHover: boolean
	handleUpdateBadge: (badgeId: BadgeID, icon: string, name: string) => void
}
export default function ElementsBadgeIcon(props: ElementsBadgeIconProps) {
	const [isBadgeHover, setIsBadgeHover] = createSignal<boolean>(false)
	const [iconSelection, setIconSelection] = createSignal<{ icon: string; name: string }>(props.iconSelection())

	createEffect(() => {
		setIconSelection(props.iconSelection())
	})

	return (
		<Show
			when={selectedItem() === props.itemId}
			fallback={
				<div
					class={cn(
						"[var(--icon)] w-4 h-4 hover:cursor-pointer hover:bg-accent-foreground min-h-5 ml-1",
						`--icon: ${iconSelection().icon}`
					)}
				/>
			}
		>
			<Button
				variant="no_format"
				size="badge"
				class={cn("ml-1")}
				onClick={(e: any) => {
					e.stopPropagation()
					setIsBadgeHover(true)
				}}
			>
				<DropdownMenu
					placement="bottom-start"
					open={isBadgeHover()}
					onOpenChange={isOpen => setIsBadgeHover(isOpen)}
				>
					<DropdownMenuTrigger class="hover:cursor-pointer hover:bg-accent hover:rounded-sm focus:outline-none focus:ring-none">
						<div>
							<div
								class={cn(
									"[var(--icon)] w-4 h-4 hover:cursor-pointer hover:bg-accent-foreground flex items-center justify-center min-h-5",
									`--icon: ${iconSelection().icon}`
								)}
							/>
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuSub overlap>
							<DropdownMenuSubTrigger class="text-xs">Change Icon</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									<ComboboxDemo
										setIsBadgeHover={setIsBadgeHover}
										badgeId={props.badgeId}
										handleUpdateBadge={props.handleUpdateBadge}
										iconSelection={props.iconSelection}
										setIconSelection={setIconSelection}
									/>
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					</DropdownMenuContent>
				</DropdownMenu>
			</Button>
		</Show>
	)
}

function ComboboxDemo(props: {
	setIsBadgeHover: (value: boolean) => void
	badgeId: BadgeID
	handleUpdateBadge: (badgeId: BadgeID, icon: string, name: string) => void
	iconSelection: Accessor<{ icon: string; name: string }>
	setIconSelection: (value: { icon: string; name: string }) => void
}) {
	const handleIconChange = (e: any) => {
		props.setIsBadgeHover(false)
		if (e) {
			props.setIconSelection({ icon: e.label, name: props.iconSelection().name })
			props.handleUpdateBadge(props.badgeId, e.label, props.iconSelection().name)
		}
	}

	return (
		<Combobox<Food, Category>
			options={ALL_OPTIONS}
			optionValue="value"
			optionTextValue="value"
			optionLabel="label"
			optionDisabled="disabled"
			optionGroupChildren="options"
			placeholder="Search Icons"
			onChange={e => {
				handleIconChange(e)
			}}
			itemComponent={props => (
				<ComboboxItem item={props.item}>
					<ComboboxItemLabel class="text-xs">
						<IconDisplayUI
							label={props.item.rawValue.label}
							value={props.item.rawValue.value}
						/>
					</ComboboxItemLabel>
					<ComboboxItemIndicator />
				</ComboboxItem>
			)}
			sectionComponent={props => <ComboboxSection class="text-xs">{props.section.rawValue.label}</ComboboxSection>}
			onOpenChange={isOpen => {
				if (!isOpen) props.setIsBadgeHover(false)
			}}
		>
			<ComboboxControl aria-label="Food">
				<ComboboxInput class="text-xs" />
				<ComboboxTrigger />
				<ComboboxContent class="max-h-[200px] overflow-y-auto" />
			</ComboboxControl>
		</Combobox>
	)
}

const IconDisplayUI = (props: { value: string; label: string }) => {
	return (
		<div class="flex items-center gap-2">
			<div class={cn("i-[var(--icon)] w-6 h-6 ", `--icon: ${props.label}`)} />
			<div class="text-xs">{props.value}</div>
		</div>
	)
}
