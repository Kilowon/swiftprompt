import { closestCenter, DragEventHandler, Draggable, Droppable, CollisionDetector } from "@thisbeyond/solid-dnd"
import { createSignal } from "solid-js"
import Big from "big.js"
import {
	nextOrder,
	setNextOrder,
	ORDER_DELTA,
	entityItems,
	entityGroups,
	templates,
	groupBadge,
	badge,
	selectedTemplateVersion,
	selectedTemplateGroup,
	selectedSection
} from "~/global_state"
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
	Filter,
	BadgeID
} from "~/types/entityType"
import { Badge } from "~/types/badgeType"
import { storeEntityMap } from "./entityHelpers"
import { toast } from "solid-sonner"
import { ReactiveMap } from "@solid-primitives/map"

export const sortByOrder = (entities: Entity[]) => {
	const sorted = entities.map(item => ({ order: new Big(item.order), item }))
	sorted.sort((a, b) => a.order.cmp(b.order))
	return sorted.map(entry => entry.item)
}

export const updateBadge = (badgeId: BadgeID, icon: string, name: string) => {
	badge.set(badgeId, { id: badgeId, name: name, icon: icon })
	storeEntityMap()
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

export const deleteGroup = (id: GroupID) => {
	entityGroups.delete(id)
	entityItems.delete(id)
	storeEntityMap()
}

export const duplicateGroup = (id: GroupID) => {
	const group = entityGroups.get(id)
	const groupItems = entityItems.get(id)
	const newGroupId = addGroup(group?.name || "Copy of " + group?.name, group?.sort)
	if (group && groupItems) {
		groupItems.forEach(item => {
			addItem(
				item.name,
				newGroupId as unknown as GroupID,
				item.labels || [],
				item.summary || "",
				0,
				0,
				item.body?.get(item.selectedVersion) || ""
			)
		})
	}
	storeEntityMap()
	return newGroupId
}

export const updateGroupSort = (id: GroupID, sort: Filter) => {
	const group = entityGroups.get(id)
	if (group) {
		const updatedGroup = { ...group, sort: sort }
		entityGroups.set(id, updatedGroup)
		storeEntityMap()
	}
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

export const updateTemplateGroupSort = (id: TemplateGroupID, sort: TemplateFilter) => {
	const group = templates.get(id)
	if (group) {
		const updatedGroup = { ...group, sort: sort }
		templates.set(id, updatedGroup)
		storeEntityMap()
	}
}

export const addItemToTemplateSection = (
	templateGroupId: TemplateGroupID,
	id: TemplateSectionID,
	itemId: ElementID,
	groupId: GroupID,
	version: VersionID
) => {
	const versionCounter = templates.get(selectedTemplateGroup()!)?.versionCounter ?? 0
	const selectedVersion = selectedTemplateVersion() ?? 0

	if (versionCounter !== selectedVersion) {
		toast.error("Template version is Locked", {
			description:
				"Cannot add elements to template section. Template version is locked. Please select the current Template version to add elements",
			duration: 5000,
			position: "bottom-center"
		})
		return
	}

	if (selectedTemplateGroup() === null) {
		toast.error("No template selected", {
			description: "Cannot add elements to template section. No template selected",
			duration: 5000,
			position: "bottom-center"
		})
		return
	}

	if (selectedSection() === null) {
		toast.error("No section selected", {
			description: "Cannot add elements to template section. No section selected",
			duration: 5000,
			position: "bottom-center"
		})
		return
	}

	const section = templates.get(templateGroupId)?.sections.get(version)?.get(id)
	const hasItem = section?.items.some(item => item.id === itemId)

	if (section && !hasItem) {
		section.items.push({
			id: itemId,
			group: groupId,
			order: getNextOrder(),
			date_created: new Date().toISOString(),
			date_modified: new Date().toISOString()
		})
		templates
			.get(templateGroupId)
			?.sections.get(version)
			?.set(id, { ...section, items: section.items })
		storeEntityMap()
	}
	if (hasItem) {
		toast.error("Element already exists in section", {
			description: "Can only have one instance of an Element in a section",
			duration: 5000,
			position: "bottom-center"
		})
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

export const deleteItem = (groupId: GroupID, id: ElementID) => {
	// Removes the item from the templates before deleting the item from the entityItems
	const itemBadges = entityItems.get(groupId)?.get(id)
	console.log("deleteItem", id, itemBadges?.labels)
	templates.forEach(template => {
		const updatedSections = new ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>(
			[template.sections.entries()].map(([version, sections]) => [
				version,
				new ReactiveMap<TemplateSectionID, TemplateSection>(
					(sections as [TemplateSectionID, TemplateSection][]).map(([sectionId, section]) => [
						sectionId,
						{ ...section, items: section.items.filter(item => item.id !== id) }
					])
				)
			])
		)
		templates.set(template.id, { ...template, sections: updatedSections })
	})

	entityItems.get(groupId)?.delete(id)
	storeEntityMap()
}

export const duplicateItem = (groupId: GroupID, itemId: ElementID) => {
	const item = entityItems.get(groupId)?.get(itemId)
	if (item) {
		const newItem: ElementID = addItem(
			item.name + " - Copy",
			groupId,
			item.labels,
			item.summary || "",
			item.versionCounter,
			item.selectedVersion,
			item.body?.get(item.selectedVersion) || ""
		) as unknown as ElementID

		item.labels.forEach(bdg => {
			if (!groupBadge.has(item.group)) {
				groupBadge.set(item.group, new ReactiveMap())
			}
			const groupBadgeMap = groupBadge.get(item.group)
			if (groupBadgeMap) {
				// Check if badgeID exists in groupBadgeMap
				if (!groupBadgeMap.has(bdg.id)) {
					groupBadgeMap.set(bdg.id, [...(groupBadgeMap.get(bdg.id) || []), newItem])
				}
				// Check if itemID exists in badgeID
				if (!groupBadgeMap.get(bdg.id)?.includes(newItem)) {
					groupBadgeMap.get(bdg.id)?.push(newItem)
				}
				// Check if the item ID is already associated with the badge
				if (groupBadgeMap.get(bdg.id)?.includes(newItem)) {
					// Optionally handle the case where the item ID is already present
					console.log(`Item ID ${newItem} is already associated with badge ID ${bdg.id}`)
				}
				// Sets groupBadgeMap to groupBadge
				console.log(`Item added to badge ElementID:${newItem}`)
				groupBadge.set(item.group, groupBadgeMap)
			}
		})
	}
}

export const moveItemToGroup = (groupId: GroupID, itemId: ElementID, newGroupId: GroupID) => {
	if (groupId === newGroupId) return
	const item = entityItems.get(groupId)?.get(itemId)
	if (item) {
		const updatedItem = { ...item, group: newGroupId }

		// Updates the item in the templates with the new groupId
		templates.forEach(template => {
			const updatedSections = new ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>(
				[template.sections.entries()].map(([version, sections]) => [
					version,
					new ReactiveMap<TemplateSectionID, TemplateSection>(
						(sections as [TemplateSectionID, TemplateSection][]).map(([sectionId, section]) => [
							sectionId,
							{ ...section, items: section.items.map(item => (item.id === itemId ? { ...item, group: newGroupId } : item)) }
						])
					)
				])
			)
			templates.set(template.id, { ...template, sections: updatedSections })
		})

		entityItems.get(newGroupId)?.set(itemId, updatedItem)
		entityItems.get(groupId)?.delete(itemId)
		storeEntityMap()
	}
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

export const groupsMap = () => entityGroups
