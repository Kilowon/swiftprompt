import { createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { ReactiveMap } from "@solid-primitives/map"

import {
	Entity,
	Group,
	Item,
	GroupID,
	BadgeID,
	ElementID,
	TemplateGroupID,
	TemplateGroup,
	TemplateSectionID,
	VersionID
} from "~/types/entityType"
import { Id } from "@thisbeyond/solid-dnd"
import { Badge } from "~/types/badgeType"
import { EditingItem } from "~/types/entityType"
const [entities, setEntities] = createStore<Record<Id, Entity>>({})

export { entities, setEntities }

const entityGroups = new ReactiveMap<GroupID, Group>()
const entityItems = new ReactiveMap<
	GroupID,
	ReactiveMap<ElementID, Omit<Item, "body"> & { body: ReactiveMap<VersionID, string> }>
>()

export { entityGroups, entityItems }

const groupBadge = new ReactiveMap<GroupID, ReactiveMap<BadgeID, ElementID[]>>()

export { groupBadge }

const badge = new ReactiveMap<BadgeID, Badge>()

export { badge }

const templates = new ReactiveMap<TemplateGroupID, TemplateGroup>()

export { templates }

const [availableBadges, setAvailableBadges] = createSignal<Badge[]>([])

export { availableBadges, setAvailableBadges }

const [isEditingGroup, setIsEditingGroup] = createSignal<EditingItem>({
	status: "saved",
	id: "" as unknown as ElementID,
	label: ""
})

export { isEditingGroup, setIsEditingGroup }

const [isEditingItem, setIsEditingItem] = createSignal<EditingItem>({
	status: "saved",
	id: "" as unknown as ElementID,
	label: ""
})

export { isEditingItem, setIsEditingItem }

export const ORDER_DELTA = 1

const [nextOrder, setNextOrder] = createSignal(ORDER_DELTA)

export { nextOrder, setNextOrder }

const [colorFooter, setColorFooter] = createSignal(false)

export { colorFooter, setColorFooter }

const [selected, setSelected] = createSignal<GroupID | null>(null)

export { selected, setSelected }

const [selectedItem, setSelectedItem] = createSignal<ElementID | null>(null)

export { selectedItem, setSelectedItem }

const [selectedTemplateGroup, setSelectedTemplateGroup] = createSignal<TemplateGroupID | null>(null)

export { selectedTemplateGroup, setSelectedTemplateGroup }

const [selectedTemplateVersion, setSelectedTemplateVersion] = createSignal<VersionID | null>(null)

export { selectedTemplateVersion, setSelectedTemplateVersion }

const [selectedSection, setSelectedSection] = createSignal<TemplateSectionID | null>(null)

export { selectedSection, setSelectedSection }

const [selectedSectionItemEl, setSelectedSectionItemEl] = createSignal<HTMLButtonElement | undefined>(undefined)

export { selectedSectionItemEl, setSelectedSectionItemEl }

const [selectedSectionItem, setSelectedSectionItem] = createSignal<ElementID | null>(null)

export { selectedSectionItem, setSelectedSectionItem }

const [searchSelectedBadges, setSearchSelectedBadges] = createSignal<Badge[]>([])

export { searchSelectedBadges, setSearchSelectedBadges }

const [allBadgesGroup, setAllBadgesGroup] = createSignal<Badge[]>([])

export { allBadgesGroup, setAllBadgesGroup }
