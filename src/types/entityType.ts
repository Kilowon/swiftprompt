import { Id } from "@thisbeyond/solid-dnd"
import { Badge, BadgeMap } from "~/types/badgeType"
import { ReactiveMap } from "@solid-primitives/map"

export interface Base {
	name: string
	type: "group" | "item"
	order: string
	color?: string
	status: "active" | "saved" | "deleted"
}

export interface Group extends Base {
	id: GroupID
	type: "group"
	date_created?: string
	date_modified?: string
	sort: Filter
}

export interface Item extends Base {
	id: ElementID
	type: "item"
	description: string
	group: GroupID
	labels: Badge[]
	summary?: string
	body?: ReactiveMap<VersionID, string>
	versionCounter: VersionID
	selectedVersion: VersionID
	date_created?: string
	date_modified?: string
	pinned?: boolean
}

export interface Modifier {
	id: ModifierID
	modifierGroupId: ModifierGroupID
	name: string
	order: string
	modifier: string
	summary: string
	date_created?: string
	date_modified?: string
}

export interface ModifierGroup {
	id: ModifierGroupID
	sort: Filter
	name: string
	order: string
	date_created?: string
	date_modified?: string
}

export interface Prompt extends Item {
	prompts: string
}

export type Entity = Group | Item | PromptItem

export interface EntityMap {
	groups: ReactiveMap<GroupID, Group>
	items: ReactiveMap<GroupID, ReactiveMap<ElementID, Omit<Item, "body"> & { body: ReactiveMap<VersionID, string> }>>
	modifierGroups: ReactiveMap<ModifierGroupID, ModifierGroup>
	modifiers: ReactiveMap<ModifierGroupID, ReactiveMap<ModifierID, Modifier>>
	badges: ReactiveMap<BadgeID, Badge>
	groupBadges: ReactiveMap<GroupID, ReactiveMap<BadgeID, ElementID[]>>
	template: ReactiveMap<TemplateGroupID, TemplateGroup>
	nextOrder: number
}

export interface Version {
	body: ReactiveMap<VersionID, string>
}

export interface PromptItem extends Item {
	summary: string
	body: ReactiveMap<VersionID, string>
	date_created: string
	date_modified: string
}

export interface PromptMapData {
	items: Map<string, PromptItem>
	allLabels: string[]
}

export type PromptMap = Map<string, PromptMapData>

export interface EditingItem {
	status: "editing" | "saved"
	id: ElementID
	label: "badge" | "summary" | "body" | "title" | "all" | ""
}

export interface ElementID {
	id: Id
}

export interface BadgeID {
	id: Id
}

export interface GroupID {
	id: Id
}

export interface TemplateGroupID {
	id: Id
}

export interface TemplateSectionID {
	id: Id
}

export interface GlobalModifiersID {
	id: Id
}

export interface ModifierID {
	id: Id
}

export interface ModifierGroupID {
	id: Id
}

export interface TemplateGroup {
	id: TemplateGroupID
	order: string
	name: string
	note: string
	versionCounter: VersionID
	selectedVersion: VersionID
	date_created?: string
	date_modified?: string
	sort: TemplateFilter
	sections: ReactiveMap<VersionID, ReactiveMap<TemplateSectionID, TemplateSection>>
}

export interface TemplateSection {
	id: TemplateSectionID
	date_created?: string
	date_modified?: string
	isLocked: boolean
	order: string
	name: string
	items: {
		id: ElementID
		group: GroupID
		order: string
		fields?: TemplateField[]
		date_created?: string
		date_modified?: string
	}[]
}

export interface TemplateField {
	name: string
	order: string
	modifierId?: ModifierID
}

export type Filter =
	| "all"
	| "preset"
	| "project"
	| "collection"
	| "archived"
	| "favorite"
	| "image"
	| "voice"
	| "system"
	| "user"
	| "audio"
	| "business"
	| "marketing"
	| "social"
	| "email"
	| "website"
	| "other"
	| undefined

export type TemplateFilter =
	| "all"
	| "preset"
	| "project"
	| "collection"
	| "archived"
	| "favorite"
	| "image"
	| "voice"
	| "system"
	| "user"
	| "audio"
	| "business"
	| "marketing"
	| "social"
	| "email"
	| "website"
	| "other"
	| undefined

export type VersionID = number
