import { Id } from "@thisbeyond/solid-dnd"
import {
	nextOrder,
	setNextOrder,
	entityGroups,
	entityItems,
	groupBadge,
	badge,
	setAvailableBadges,
	templates,
	entityModifiers,
	entityModifierGroups
} from "~/global_state"
import {
	ElementID,
	EntityMap,
	Group,
	GroupID,
	Item,
	BadgeID,
	TemplateGroupID,
	TemplateGroup,
	TemplateSectionID,
	TemplateSection,
	VersionID,
	GlobalModifiersID,
	Modifier,
	ModifierGroupID,
	ModifierID,
	ModifierGroup
} from "~/types/entityType"
import { ReactiveMap } from "@solid-primitives/map"
import { Badge } from "~/types/badgeType"

const entitiesToEntityMap = (): EntityMap => {
	const groups = entityGroups
	const items = entityItems
	const groupBadges = groupBadge
	const badges = badge
	const template = templates
	const modifierGroups = entityModifierGroups
	const modifiers = entityModifiers

	return { groups, items, modifierGroups, modifiers, groupBadges, badges, template, nextOrder: nextOrder() }
}

const serializeEntityMap = (entityMap: EntityMap): string => {
	const serialized = {
		groups: Array.from(entityMap.groups.entries()),
		items: Array.from<[GroupID, ReactiveMap<ElementID, Item>]>(entityMap.items.entries()).map(([groupId, itemMap]) => [
			groupId,
			Array.from<[ElementID, Item]>(itemMap.entries()).map(([elementID, item]) => [
				elementID,
				{
					...item,
					body: Array.from<[VersionID, string]>(item.body?.entries() || [])
				}
			])
		]),
		badges: Array.from<[BadgeID, Badge]>(entityMap.badges.entries()),
		groupBadges: Array.from<[GroupID, ReactiveMap<BadgeID, ElementID[]>]>(entityMap.groupBadges.entries()).map(
			([groupId, badgeMap]) => [
				groupId,
				Array.from<[BadgeID, ElementID[]]>(badgeMap.entries()).filter(([_, elementIds]) => elementIds.length > 0)
			]
		),
		template: Array.from<[TemplateGroupID, TemplateGroup]>(entityMap.template.entries()).map(([templateId, template]) => [
			templateId,
			{
				...template,
				sections: Array.from<[VersionID, ReactiveMap<TemplateSectionID, TemplateSection>]>(template.sections.entries()).map(
					([versionId, sectionMap]) => [
						versionId,
						Array.from<[TemplateSectionID, TemplateSection]>(sectionMap.entries()).map(([sectionId, section]) => [
							sectionId,
							{
								...section,
								items: section.items
							}
						])
					]
				)
			}
		]),
		modifierGroups: Array.from<[ModifierGroupID, ModifierGroup]>(entityMap.modifierGroups.entries()),
		modifiers: Array.from<[ModifierGroupID, ReactiveMap<ModifierID, Modifier>]>(entityMap.modifiers.entries()).map(
			([groupId, modifierMap]) => [groupId, Array.from<[ModifierID, Modifier]>(modifierMap.entries())]
		),
		nextOrder: nextOrder()
	}
	return JSON.stringify(serialized)
}

export const storeEntityMap = () => {
	try {
		const entityMap = entitiesToEntityMap()
		const serialized = serializeEntityMap(entityMap)
		if (serialized) {
			localStorage.setItem("entityMap", serialized)
		} else {
			console.warn("Serialized entity map is empty or invalid")
		}
	} catch (error) {
		console.error("Error storing entity map:", error)
	}
}

const deserializeEntityMap = (serialized: string): EntityMap => {
	const parsed = JSON.parse(serialized)
	entityGroups.clear()
	entityItems.clear()
	groupBadge.clear()
	badge.clear()
	templates.clear()
	entityModifierGroups.clear()
	entityModifiers.clear()

	parsed.groups.forEach(([id, group]: [Id, Group]) => entityGroups.set(id as unknown as GroupID, group))

	parsed.items.forEach(([groupId, items]: [Id, [Id, Item][]]) => {
		const groupItems = new ReactiveMap(
			items.map(([elementID, item]) => [
				elementID,
				{
					...item,
					body: new ReactiveMap(item.body || [])
				}
			])
		) as unknown as ReactiveMap<ElementID, Omit<Item, "body"> & { body: ReactiveMap<VersionID, string> }>
		entityItems.set(groupId as unknown as GroupID, groupItems)
	})

	parsed.groupBadges.forEach(([groupId, badges]: [Id, [Id, Badge][]]) => {
		const groupBadgeMap = new ReactiveMap(badges)
		groupBadge.set(groupId as unknown as GroupID, groupBadgeMap as unknown as ReactiveMap<BadgeID, ElementID[]>)
	})

	parsed.badges.forEach(([id, badg]: [BadgeID, Badge]) => badge.set(id, badg))
	parsed.template.forEach(([id, template]: [TemplateGroupID, TemplateGroup]) => {
		const templateGroup: TemplateGroup = {
			...template,
			sections: new ReactiveMap(
				Array.from<[VersionID, any]>(template.sections).map(([versionId, sectionMap]) => [
					versionId,
					new ReactiveMap(Array.from<[TemplateSectionID, TemplateSection]>(sectionMap))
				])
			)
		}
		templates.set(id, templateGroup)
	})

	if (parsed.modifierGroups) {
		parsed.modifierGroups.forEach(([id, group]: [Id, ModifierGroup]) =>
			entityModifierGroups.set(id as unknown as ModifierGroupID, group)
		)
	}

	if (parsed.modifiers) {
		parsed.modifiers.forEach(([groupId, modifiers]: [Id, [Id, Modifier][]]) => {
			const groupModifiers = new ReactiveMap(modifiers) as unknown as ReactiveMap<ModifierID, Modifier>
			entityModifiers.set(groupId as unknown as ModifierGroupID, groupModifiers)
		})
	}

	setAvailableBadges(Array.from<Badge>(badge.values()))
	setNextOrder(parsed.nextOrder)
	return {
		groups: entityGroups,
		items: entityItems,
		modifierGroups: entityModifierGroups,
		modifiers: entityModifiers,
		groupBadges: groupBadge,
		badges: badge,
		template: templates,
		nextOrder: parsed.nextOrder
	}
}

export const initializeEntityMap = () => {
	const storedEntityMap = localStorage.getItem("entityMap")
	if (!storedEntityMap) {
		console.warn("No entity map found in localStorage")
		return
	}
	const entityMap = deserializeEntityMap(storedEntityMap)
	return entityMap
}
