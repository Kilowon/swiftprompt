import { closestCenter, DragEventHandler, Draggable, Droppable, CollisionDetector } from "@thisbeyond/solid-dnd"
import { createSignal } from "solid-js"
import Big from "big.js"
import { nextOrder, setNextOrder, ORDER_DELTA, entityItems, entityGroups, templates } from "~/global_state"
import {
	Entity,
	Group,
	Item,
	ElementID,
	GroupID,
	TemplateGroupID,
	TemplateSectionID,
	TemplateSection,
	VersionID,
	TemplateFilter,
	Filter
} from "~/types/entityType"
import { Badge } from "~/types/badgeType"
import { storeEntityMap } from "./entityHelpers"
import { ReactiveMap } from "@solid-primitives/map"

export const sortByOrder = (entities: Entity[]) => {
	const sorted = entities.map(item => ({ order: new Big(item.order), item }))
	sorted.sort((a, b) => a.order.cmp(b.order))
	return sorted.map(entry => entry.item)
}

export const nameChangeGroup = (id: GroupID, name: string) => {
	const group = entityGroups.get(id)

	const updatedGroup = {
		...group,
		name: name
	}

	try {
		if (!group) throw new Error("Group not found")

		entityGroups.set(id, updatedGroup as Group)

		storeEntityMap()
	} catch (error) {
		console.warn((error as Error).message)
	}
}

export const getNextOrder = () => {
	const current = nextOrder()
	const next = current + ORDER_DELTA
	setNextOrder(next)
	return current.toString()
}

export const addGroup = (name: string, sortType: Filter) => {
	const order = getNextOrder()
	const id = crypto.randomUUID()
	entityGroups.set(id as unknown as GroupID, {
		name: name,
		type: "group",
		order: order,
		status: "active",
		id: id as unknown as GroupID,
		sort: sortType,
		date_created: new Date().toISOString(),
		date_modified: new Date().toISOString()
	})
	storeEntityMap()

	return id
}

export const addTemplateGroup = (name: string, sortType: TemplateFilter) => {
	const order = getNextOrder()
	const id = crypto.randomUUID()
	templates.set(id as unknown as TemplateGroupID, {
		name: name,
		order: order,
		id: id as unknown as TemplateGroupID,
		sections: new ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>(),
		sort: sortType,
		note: "",
		versionCounter: 0,
		selectedVersion: 0,
		date_created: new Date().toISOString(),
		date_modified: new Date().toISOString()
	})
	storeEntityMap()

	return id
}

export const editTemplateGroup = (id: TemplateGroupID, names: string, version: VersionID) => {
	const existingGroup = templates.get(id)
	if (existingGroup) {
		templates.set(id, { ...existingGroup, name: names, date_modified: new Date().toISOString() })

		storeEntityMap()
	}
}

export const addTemplateSection = (templateGroupId: TemplateGroupID, name: string, version: VersionID) => {
	const order = getNextOrder()
	const id = crypto.randomUUID()
	const versionMap: ReactiveMap<TemplateSectionID, TemplateSection> =
		templates.get(templateGroupId)?.sections.get(version) || new ReactiveMap<TemplateSectionID, TemplateSection>()
	versionMap?.set(id as unknown as TemplateSectionID, {
		name: name,
		order: order,
		id: id as unknown as TemplateSectionID,
		items: [],
		isLocked: false,
		date_created: new Date().toISOString(),
		date_modified: new Date().toISOString()
	})
	templates.get(templateGroupId)?.sections.set(version, versionMap)
	storeEntityMap()

	return id
}

export const editTemplateSection = (
	templateGroupId: TemplateGroupID,
	id: TemplateSectionID,
	name: string,
	order: string,
	version: VersionID
) => {
	const section = templates.get(templateGroupId)?.sections.get(version)?.get(id)
	if (section) {
		templates
			.get(templateGroupId)
			?.sections.get(version)
			?.set(id, { ...section, name: name, date_modified: new Date().toISOString() })
		storeEntityMap()
	}
}

export const addItem = (
	name: string,
	group: GroupID,
	labels: Badge[],
	summary: string,
	versionCounter: VersionID,
	selectedVersion: VersionID,
	body: string
) => {
	const id = crypto.randomUUID()
	const date_created = new Date()
	const date_modified = new Date()
	const labelsCopy = labels || []
	const summaryCopy = summary || ""
	const nameCopy = name || ""
	const order = getNextOrder()
	const pinned = false
	const groupItems = entityItems.get(group) || new ReactiveMap<ElementID, Item>()
	const versionCounters = versionCounter || 0
	const selectedVersions = selectedVersion || 0
	const bodyMap = new ReactiveMap<VersionID, string>()
	bodyMap.set(versionCounter, body)
	groupItems.set(id as unknown as ElementID, {
		group,
		order,
		type: "item",
		status: "active",
		versionCounter: versionCounters,
		selectedVersion: selectedVersions,
		summary: summaryCopy,
		body: bodyMap,
		date_created: date_created.toString(),
		date_modified: date_modified.toString(),
		labels: labelsCopy,
		description: "",
		name: nameCopy,
		id: id as unknown as ElementID,
		pinned
	})
	entityItems.set(
		group,
		groupItems as unknown as ReactiveMap<ElementID, Omit<Item, "body"> & { body: ReactiveMap<VersionID, string> }>
	)
	storeEntityMap()

	return id
}

export const changeItemAttributes = (
	groupId: GroupID,
	id: ElementID,
	name: string,
	summary: string,
	body: string,
	versionCounter: VersionID,
	selectedVersion: VersionID,
	updatedBody: boolean
) => {
	const entity = entityItems.get(groupId)
	const item = entity?.get(id)

	if (!entity || !item) {
		console.warn(`Item not found: groupId=${groupId}, id=${id}`)
		return
	}

	const date_modified = new Date()
	const versionCounters = versionCounter
	const selectedVersions = selectedVersion

	const bodyMap = item.body
	const updatedBodyMap = bodyMap.set(versionCounters, body)

	const updatedItem = {
		...item,
		name: name ?? item.name,
		summary: summary ?? item.summary,
		body: updatedBodyMap,
		versionCounter: versionCounters,
		selectedVersion: selectedVersions,
		date_modified: date_modified.toString(),
		type: "item" as const
	}

	entity.set(id, updatedItem as unknown as Omit<Item, "body"> & { body: ReactiveMap<VersionID, string> })
	entityItems.set(groupId, entity)

	storeEntityMap()
}

export const pinToggleItem = (groupId: GroupID, id: ElementID) => {
	const groupItems = entityItems.get(groupId)
	const item = groupItems?.get(id)

	if (item && item.type === "item") {
		groupItems?.set(id, {
			...item,
			pinned: !item.pinned
		})

		storeEntityMap()
	} else {
		console.warn("Cannot pin non-item entity")
	}
}
