import { closestCenter, DragEventHandler, Draggable, Droppable, CollisionDetector, Id } from "@thisbeyond/solid-dnd"
import Big from "big.js"
import {
	entities,
	setEntities,
	nextOrder,
	setNextOrder,
	ORDER_DELTA,
	entityItems,
	entityGroups,
	groupBadge,
	badge,
	templates,
	selectedTemplateVersion,
	selectedTemplateGroup,
	selectedSection,
	setSelectedSection,
	entityModifierGroups,
	entityModifiers
} from "~/global_state"
import {
	Entity,
	Group,
	Item,
	ElementID,
	GroupID,
	BadgeID,
	TemplateGroupID,
	TemplateSectionID,
	TemplateSection,
	VersionID,
	TemplateFilter,
	Filter,
	ModifierGroupID,
	ModifierID,
	Modifier,
	ModifierGroup,
	TemplateField,
	TemplateFieldID
} from "~/types/entityType"
import { Badge } from "~/types/badgeType"
import { storeEntityMap } from "./entityHelpers"
import { ReactiveMap } from "@solid-primitives/map"
import { toast } from "solid-sonner"

export const sortByOrder = (entities: Entity[]) => {
	const sorted = entities.map(item => ({ order: new Big(item.order), item }))
	sorted.sort((a, b) => a.order.cmp(b.order))
	return sorted.map(entry => entry.item)
}

export const updateBadge = (badgeId: BadgeID, icon: string, name: string) => {
	badge.set(badgeId, { id: badgeId, name: name, icon: icon })
	storeEntityMap()
}

export const saveUpdatedBadgesItem = (groupId: GroupID, id: ElementID, badges: Badge[]) => {
	const groupItems = entityItems.get(groupId)
	const item = groupItems?.get(id)
	const updatedItem = {
		...item,
		labels: badges.map(badge => badge.id)
	}

	entityItems
		.get(groupId)
		?.set(id, updatedItem as unknown as Omit<Item, "body"> & { body: ReactiveMap<VersionID, string> })
}

export const getNextOrder = () => {
	const current = nextOrder()
	const next = current + ORDER_DELTA
	setNextOrder(next)
	return current.toString()
}

// Group Functions

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
				item.fields || [],
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

export const deleteGroup = (id: GroupID) => {
	entityGroups.delete(id)
	entityItems.delete(id)
	storeEntityMap()
}

export const updateGroupSort = (id: GroupID, sort: Filter) => {
	const group = entityGroups.get(id)
	if (group) {
		const updatedGroup = { ...group, sort: sort }
		entityGroups.set(id, updatedGroup)
		storeEntityMap()
	}
}

// Template Functions

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

export const deleteTemplateGroup = (id: TemplateGroupID) => {
	templates.delete(id)
	storeEntityMap()
	//TODO: Delete all template versions - does this work?
}

export const incrementTemplateGroupVersion = (id: TemplateGroupID) => {
	const group = templates.get(id)
	if (group) {
		const updatedGroup = { ...group, versionCounter: group.versionCounter + 1, selectedVersion: group.versionCounter + 1 }
		const oldVersionSections = templates.get(id)?.sections.get(group.versionCounter)
		const newVersionSections = new ReactiveMap<TemplateSectionID, TemplateSection>()
		oldVersionSections?.forEach(section => {
			const newSection = { ...section, isLocked: false }
			newVersionSections.set(section.id, newSection)
			templates
				.get(id)
				?.sections.get(group.versionCounter)
				?.set(section.id, { ...section, isLocked: true })
		})
		templates.set(id, updatedGroup)
		templates.get(id)?.sections.set(updatedGroup.versionCounter, newVersionSections)
		storeEntityMap()
		toast.success("Template version incremented to new version: " + updatedGroup.versionCounter, {
			duration: 5000,
			position: "bottom-center"
		})
	}
}

export const revertTemplateToPreviousVersion = (id: TemplateGroupID, version: VersionID) => {
	const group = templates.get(id)
	if (group) {
		const updatedGroup = { ...group, versionCounter: group.versionCounter + 1, selectedVersion: group.versionCounter + 1 }
		const oldVersionSections = templates.get(id)?.sections.get(version)
		const newVersionSections = new ReactiveMap<TemplateSectionID, TemplateSection>()
		oldVersionSections?.forEach(section => {
			const newSection = { ...section, isLocked: false }
			newVersionSections.set(section.id, newSection)
			templates
				.get(id)
				?.sections.get(version)
				?.set(section.id, { ...section, isLocked: true })
		})
		templates.set(id, updatedGroup)
		templates.get(id)?.sections.set(updatedGroup.versionCounter, newVersionSections)
		storeEntityMap()

		toast.success("Template version reverted to previous at new version: " + updatedGroup.versionCounter, {
			duration: 7000,
			position: "bottom-center"
		})
	}
}

export const duplicateTemplateGroup = (id: TemplateGroupID) => {
	const group = templates.get(id)
	const newGroupId = addTemplateGroup("(Copy) " + (group?.name || ""), group?.sort as TemplateFilter)

	if (group && group.sections) {
		const newSections = new ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>()

		group.sections.forEach((versionSections, versionId) => {
			const newVersionSections = new ReactiveMap<TemplateSectionID, TemplateSection>()

			versionSections.forEach((section, sectionId) => {
				const newSectionId = crypto.randomUUID() as unknown as TemplateSectionID
				const newSection: TemplateSection = {
					...section,
					id: newSectionId,
					items: [...section.items], // Create a new array with the same items
					date_created: new Date().toISOString(),
					date_modified: new Date().toISOString()
				}
				newVersionSections.set(newSectionId, newSection)
			})

			newSections.set(versionId, newVersionSections)
		})

		templates.set(newGroupId as unknown as TemplateGroupID, {
			...group,
			id: newGroupId as unknown as TemplateGroupID,
			sections: newSections,
			date_created: new Date().toISOString(),
			date_modified: new Date().toISOString()
		})
	}

	storeEntityMap()

	return newGroupId
}

export const updateTemplateGroupSort = (id: TemplateGroupID, sort: TemplateFilter) => {
	const group = templates.get(id)
	if (group) {
		const updatedGroup = { ...group, sort: sort }
		templates.set(id, updatedGroup)
		storeEntityMap()
	}
}

export const addTemplateSection = (templateGroupId: TemplateGroupID, name: string, version: VersionID) => {
	const order = getNextOrder()
	const id = crypto.randomUUID()

	const templateGroup = templates.get(templateGroupId)
	if (!templateGroup) return id

	// Create new version map
	const versionMap = new ReactiveMap<TemplateSectionID, TemplateSection>(
		templateGroup.sections.get(version) || new ReactiveMap<TemplateSectionID, TemplateSection>()
	)

	// Add new section
	versionMap.set(id as unknown as TemplateSectionID, {
		name: name,
		order: order,
		id: id as unknown as TemplateSectionID,
		items: [],
		isLocked: false,
		date_created: new Date().toISOString(),
		date_modified: new Date().toISOString()
	})

	// Create new sections map
	const newSections = new ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>(
		templateGroup.sections as ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>
	)
	newSections.set(version, versionMap)

	// Update template with new sections
	templates.set(templateGroupId, {
		...templateGroup,
		sections: newSections,
		date_modified: new Date().toISOString()
	})

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

export const deleteTemplateSection = (templateGroupId: TemplateGroupID, id: TemplateSectionID, version: VersionID) => {
	templates.get(templateGroupId)?.sections.get(version)?.delete(id)
	setSelectedSection(null)
	storeEntityMap()
}

export const duplicateTemplateSection = (
	templateGroupId: TemplateGroupID,
	id: TemplateSectionID,
	version: VersionID
) => {
	const section = templates.get(templateGroupId)?.sections.get(version)?.get(id)
	if (section) {
		const newId = crypto.randomUUID() as unknown as TemplateSectionID
		const newSection: TemplateSection = {
			...section,
			id: newId,
			name: section.name + " - Copy",
			items: [...section.items], // Create a new array with the same items
			date_created: new Date().toISOString(),
			date_modified: new Date().toISOString()
		}

		templates.get(templateGroupId)?.sections.get(version)?.set(newId, newSection)
		storeEntityMap()

		return newId
	}
}

export const moveTemplateSection = (
	templateGroupId: TemplateGroupID,
	id: TemplateSectionID,
	newTemplateGroupId: TemplateGroupID
) => {
	const version = templates.get(templateGroupId)?.selectedVersion ?? 0
	const newVersion = templates.get(newTemplateGroupId)?.versionCounter ?? 0

	const templateGroup = templates.get(templateGroupId)
	if (!templateGroup) return

	const section = templateGroup.sections.get(version)?.get(id)
	if (!section) return

	const targetTemplateGroup = templates.get(newTemplateGroupId)
	if (!targetTemplateGroup) return

	if (!targetTemplateGroup.sections.has(newVersion)) {
		targetTemplateGroup.sections.set(newVersion, new ReactiveMap<TemplateSectionID, TemplateSection>())
	}

	// Move the section to the target version
	const newSection: TemplateSection = {
		...section,
		date_modified: new Date().toISOString()
	}
	targetTemplateGroup.sections.get(newVersion)?.set(id, newSection)

	// Remove the section from the original version
	templateGroup.sections.get(version)?.delete(id)

	// Update the template group
	templates.set(templateGroupId, {
		...templateGroup,
		date_modified: new Date().toISOString()
	})

	storeEntityMap()
}

export const addItemToTemplateSection = (
	templateGroupId: TemplateGroupID,
	id: TemplateSectionID,
	itemId: ElementID,
	groupId: GroupID,
	version: VersionID,
	fields: TemplateField[]
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

	if (selectedTemplateGroup() === null || selectedSection() === null) {
		toast.error("Invalid selection", {
			description: "Cannot add elements to template section. No template or section selected",
			duration: 5000,
			position: "bottom-center"
		})
		return
	}

	const templateGroup = templates.get(templateGroupId)
	if (!templateGroup) return

	// Create new version map
	const versionMap = new ReactiveMap<TemplateSectionID, TemplateSection>(templateGroup.sections.get(version))
	if (!versionMap) return

	// Get section and check for existing item
	const section: TemplateSection | undefined = versionMap.get(id) as unknown as TemplateSection | undefined
	if (!section) return

	const hasItem = section.items.some(item => item.id === itemId)
	if (hasItem) {
		toast.error("Element already exists in section", {
			description: "Can only have one instance of an Element in a section",
			duration: 5000,
			position: "bottom-center"
		})
		return
	}

	// Create new items array with new item
	const newItems = [
		...section.items,
		{
			id: itemId,
			group: groupId,
			order: getNextOrder(),
			date_created: new Date().toISOString(),
			date_modified: new Date().toISOString(),
			fields: fields
		}
	]

	// Create new section with updated items
	const updatedSection = { ...section, items: newItems }
	versionMap.set(id, updatedSection)

	// Create new sections map and update template
	const newSections = new ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>(templateGroup.sections)
	newSections.set(version, versionMap)

	templates.set(templateGroupId, {
		...templateGroup,
		sections: newSections,
		date_modified: new Date().toISOString()
	})

	storeEntityMap()
}

export const removeItemFromTemplateSection = (
	templateGroupId: TemplateGroupID,
	id: TemplateSectionID,
	itemId: ElementID,
	version: VersionID
) => {
	const section = templates.get(templateGroupId)?.sections.get(version)?.get(id)
	if (section) {
		section.items = section.items.filter(item => item.id !== itemId)
		templates
			.get(templateGroupId)
			?.sections.get(version)
			?.set(id, { ...section, items: section.items })
		storeEntityMap()
	}
}

export const updateItemFieldsInTemplateSection = (
	templateGroupId: TemplateGroupID,
	id: TemplateSectionID,
	itemId: ElementID,
	fields: TemplateField[],
	version: VersionID
) => {
	const section = templates.get(templateGroupId)?.sections.get(version)?.get(id)
	if (section) {
		const updatedItems = section.items.map(item => {
			if (item.id === itemId) {
				const updatedFields = fields.map(newField => {
					const existingField = item.fields?.find(f => f.templateFieldId === newField.templateFieldId)

					const result = {
						...newField,
						// Explicitly preserve existing modifier IDs if they exist
						modifierId: existingField?.modifierId ?? newField.modifierId,
						modifierGroupId: existingField?.modifierGroupId ?? newField.modifierGroupId
					}

					return result
				})

				return { ...item, fields: updatedFields }
			}
			return item
		})

		templates
			.get(templateGroupId)
			?.sections.get(version)
			?.set(id, {
				...section,
				items: updatedItems,
				date_modified: new Date().toISOString()
			})

		storeEntityMap()
	}
}

export const addModifierToField = (
	templateGroupId: TemplateGroupID,
	id: TemplateSectionID,
	itemId: ElementID,
	modifierId: ModifierID,
	modifierGroupId: ModifierGroupID,
	fieldId: TemplateFieldID,
	version: VersionID
) => {
	const templateGroup = templates.get(templateGroupId)
	const sections = templateGroup?.sections.get(version)

	const field = sections
		?.get(id)
		?.items.find(item => item.id === itemId)
		?.fields?.find(field => field.templateFieldId === fieldId)

	if (field?.type === "global") {
		sections?.forEach((section, sectionId) => {
			const updatedItems = section.items.map(item => ({
				...item,
				fields: item.fields?.map(f =>
					f.type === "global" && f.name === field.name ? { ...f, modifierId, modifierGroupId } : f
				)
			}))

			templates
				.get(templateGroupId)
				?.sections.get(version)
				?.set(sectionId, {
					...section,
					items: updatedItems,
					date_modified: new Date().toISOString()
				})
		})
	} else {
		const section = sections?.get(id)
		if (section) {
			const updatedItems = section.items.map(item => {
				if (item.id === itemId) {
					return {
						...item,
						fields: item.fields?.map(field =>
							field.templateFieldId === fieldId ? { ...field, modifierId, modifierGroupId } : field
						)
					}
				}
				return item
			})

			sections?.set(id, {
				...section,
				items: updatedItems,
				date_modified: new Date().toISOString()
			})
		}
	}

	storeEntityMap()
}

// Element Functions

export const addItem = (
	name: string,
	group: GroupID,
	labels: Badge[],
	fields: TemplateField[],
	summary: string,
	versionCounter: VersionID,
	selectedVersion: VersionID,
	body: string
) => {
	const id = crypto.randomUUID()
	const date_created = new Date()
	const date_modified = new Date()
	const labelsCopy = labels || []
	const fieldsCopy = fields || []
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
		fields: fieldsCopy,
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
	fields: TemplateField[],
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
		type: "item" as const,
		fields: fields ?? item.fields
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

export const deleteItem = (groupId: GroupID, id: ElementID) => {
	// Removes the item from the templates before deleting the item from the entityItems
	const itemBadges = entityItems.get(groupId)?.get(id)
	templates.forEach(template => {
		const updatedSections = new ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>(
			[...template.sections.entries()].map(([version, sections]) => [
				version,
				new ReactiveMap<TemplateSectionID, TemplateSection>(
					[...sections.entries()].map(([sectionId, section]) => [
						sectionId,
						{ ...section, items: section.items.filter((item: Item) => item.id !== id) }
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
			item.fields || [],
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
				[...template.sections.entries()].map(([version, sections]) => [
					version,
					new ReactiveMap<TemplateSectionID, TemplateSection>(
						[...sections.entries()].map(([sectionId, section]) => [
							sectionId,
							{
								...section,
								items: section.items.map((item: Item) => (item.id === itemId ? { ...item, group: newGroupId } : item))
							}
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

// Modifier Group Functions

export const addModifierGroup = (name: string, sortType: Filter) => {
	const order = getNextOrder()
	const id = crypto.randomUUID()
	entityModifierGroups.set(id as unknown as ModifierGroupID, {
		name: name,
		order: order,
		id: id as unknown as ModifierGroupID,
		sort: sortType,
		date_created: new Date().toISOString(),
		date_modified: new Date().toISOString()
	})
	storeEntityMap()

	return id
}

export const nameChangeModifierGroup = (id: ModifierGroupID, name: string) => {
	const group = entityModifierGroups.get(id)

	const updatedGroup = {
		...group,
		name: name
	}

	try {
		if (!group) throw new Error("Group not found")

		entityModifierGroups.set(id, updatedGroup as ModifierGroup)

		storeEntityMap()
	} catch (error) {
		console.warn((error as Error).message)
	}
}

export const deleteModifierGroup = (id: ModifierGroupID) => {
	entityModifierGroups.delete(id)
	entityModifiers.delete(id)
	storeEntityMap()
}

export const updateModifierGroupSort = (id: ModifierGroupID, sort: Filter) => {
	const group = entityModifierGroups.get(id)
	if (group) {
		const updatedGroup = { ...group, sort: sort }
		entityModifierGroups.set(id, updatedGroup as ModifierGroup)
		storeEntityMap()
	}
}

// Modifier Functions

export const addModifier = (name: string, modifierGroupId: ModifierGroupID, summary: string, modifier: string) => {
	const id = crypto.randomUUID()
	const date_created = new Date()
	const date_modified = new Date()
	const order = getNextOrder()
	const summaryCopy = summary || ""
	const nameCopy = name || ""
	const modifierToGroup = entityModifiers.get(modifierGroupId) || new ReactiveMap<ModifierID, Modifier>()

	modifierToGroup.set(id as unknown as ModifierID, {
		id: id as unknown as ModifierID,
		modifierGroupId: modifierGroupId,
		summary: summaryCopy,
		modifier: modifier,
		order: order,
		date_created: date_created.toString(),
		date_modified: date_modified.toString(),
		name: nameCopy
	})

	entityModifiers.set(modifierGroupId, modifierToGroup)

	storeEntityMap()

	return id
}

export const changeModifierAttributes = (
	modifierGroupId: ModifierGroupID,
	id: ModifierID,
	name: string,
	summary: string,
	modifier: string
) => {
	const entity = entityModifiers.get(modifierGroupId)
	const mod = entity?.get(id)

	if (!entity || !mod) {
		console.warn(`Modifier not found: modifierGroupId=${modifierGroupId}, id=${id}`)
		return
	}

	const date_modified = new Date()
	const updatedModifier = {
		...mod,
		name: name ?? mod?.name,
		summary: summary ?? mod?.summary,
		modifier: modifier ?? mod?.modifier,
		date_modified: date_modified.toString(),
		type: "modifier" as const
	}

	entity.set(id, updatedModifier)
	entityModifiers.set(modifierGroupId, entity)
	storeEntityMap()
}

export const deleteModifier = (modifierGroupId: ModifierGroupID, id: ModifierID) => {
	entityModifiers.get(modifierGroupId)?.delete(id)
	storeEntityMap()
}

// DnD Sorting Functions

export const isSortableGroup = (sortable: Draggable | Droppable) => sortable.data.type === "group"

export const closestEntity: CollisionDetector = (draggable, droppables, context) => {
	if (!draggable || !droppables || droppables.length === 0) return null

	const draggableIsSection = draggable.data.type === "section"

	// Filter droppables based on type
	const validDroppables = droppables.filter(droppable => {
		if (draggableIsSection) {
			return droppable.data.type === "section"
		}
		return true // Items can be dropped on both sections and items
	})

	return closestCenter(draggable, validDroppables, context)
}

/* export const groups = () =>
	sortByOrder(Object.values(entities).filter(item => item.type === "group" && item.status !== "deleted")) as Group[] // Deprecated
 */

export const groupsMap = () => entityGroups

export const groupIds = () => [...entityGroups.keys()]

export const groupItems = (groupId: GroupID) => {
	const groupItems = entityItems.get(groupId)
	if (groupItems) {
		return [...groupItems.values()]
	}
	return []
}

export const groupOrders = () => [...entityGroups.values()].map(group => group.order)

export const groupItemIds = (groupId: GroupID) => [...(entityItems.get(groupId)?.keys() ?? [])]

export const groupItemOrders = (groupId: GroupID) =>
	[...(entityItems.get(groupId)?.values() ?? [])].map(item => item.order)

export const move = (draggable: Draggable, droppable: Droppable, onlyWhenChangingGroup = true) => {
	if (!draggable || !droppable) return

	const draggableIsSection = draggable.data.type === "section"
	const droppableIsSection = droppable.data.type === "section"

	const templateId = selectedTemplateGroup() as TemplateGroupID
	const version = selectedTemplateVersion() || 0

	if (!templateId || version === undefined) return

	const templateSections = templates.get(templateId)?.sections.get(version)
	if (!templateSections) return

	// Handle section reordering
	if (draggableIsSection && droppableIsSection) {
		const sections = [...templateSections.values()].sort((a, b) => Number(a.order) - Number(b.order))

		const draggableIndex = sections.findIndex(section => section.id === draggable.id)
		const droppableIndex = sections.findIndex(section => section.id === droppable.id)

		if (draggableIndex === droppableIndex) return

		const orders = sections.map(section => section.order)
		const newOrder = calculateNewOrder(draggableIndex, droppableIndex, orders)

		if (newOrder) {
			const draggedSection = templateSections.get(draggable.id as unknown as TemplateSectionID)
			if (draggedSection) {
				const updatedSection = {
					...draggedSection,
					order: newOrder.toString()
				}
				templateSections.set(draggable.id as unknown as TemplateSectionID, updatedSection)

				const template = templates.get(templateId)
				if (template) {
					templates.set(templateId, {
						...template,
						sections: new ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>(template.sections).set(
							version,
							templateSections
						)
					})
					storeEntityMap()
				}
			}
		}
		return
	}

	// Extract section ID and item ID from the composite ID
	const extractIds = (id: string) => {
		const parts = id.match(/.{8}-.{4}-.{4}-.{4}-.{12}/g) || []
		return {
			sectionId: parts[0] as unknown as TemplateSectionID,
			itemId: parts[1] as unknown as ElementID
		}
	}

	// Get section ID from droppable
	const { sectionId } = extractIds(droppableIsSection ? droppable.id : droppable.data.sectionId)

	const section = templateSections.get(sectionId)
	if (!section) return

	const items = [...section.items].sort((a, b) => Number(a.order) - Number(b.order))

	// Extract item IDs
	const { itemId: draggableItemId } = extractIds(draggable.id as string)
	const { itemId: droppableItemId } = droppableIsSection ? { itemId: null } : extractIds(droppable.id as string)

	const draggableIndex = items.findIndex(item => item.id === draggableItemId)
	const droppableIndex = droppableIsSection ? items.length : items.findIndex(item => item.id === droppableItemId)

	if (draggableIndex === droppableIndex) return

	try {
		const orders = items.map(item => item.order)
		const newOrder = calculateNewOrder(draggableIndex, droppableIndex, orders)

		if (newOrder) {
			const updatedItems = items
				.map(item => (item.id === draggableItemId ? { ...item, order: newOrder.toString() } : item))
				.sort((a, b) => Number(a.order) - Number(b.order))

			const newSections = new ReactiveMap<TemplateSectionID, TemplateSection>(templateSections)
			newSections.set(sectionId, {
				...section,
				items: updatedItems
			})

			const template = templates.get(templateId)
			if (template) {
				templates.set(templateId, {
					...template,
					sections: new ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>(template.sections).set(
						version,
						newSections
					)
				})
				storeEntityMap()
			}
		}
	} catch (error) {
		console.error("Error calculating item order:", error)
	}
}

const calculateNewOrder = (dragIndex: number, dropIndex: number, orders: string[]) => {
	if (dragIndex === dropIndex) return null

	const numericOrders = orders.map(Number)
	let before: number, after: number

	if (dragIndex === -1 || dragIndex > dropIndex) {
		// Moving up
		before = numericOrders[dropIndex]
		after = dropIndex > 0 ? numericOrders[dropIndex - 1] : before - ORDER_DELTA * 2
	} else {
		// Moving down
		after = numericOrders[dropIndex]
		before = dropIndex < numericOrders.length - 1 ? numericOrders[dropIndex + 1] : after + ORDER_DELTA * 2
	}

	return (before + after) / 2
}

export const onDragOver: DragEventHandler = ({ draggable, droppable }) => {
	if (!draggable || !droppable) return

	const draggableIsSection = draggable.data.type === "section"
	const droppableIsSection = droppable.data.type === "section"

	if (draggableIsSection !== droppableIsSection && !droppableIsSection) return

	move(draggable, droppable)
}

export const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
	if (!draggable || !droppable) return

	const draggableIsSection = draggable.data.type === "section"
	const droppableIsSection = droppable.data.type === "section"

	if (draggableIsSection !== droppableIsSection && !droppableIsSection) return

	move(draggable, droppable, false)
}
