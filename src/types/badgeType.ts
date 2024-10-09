import { Id } from "@thisbeyond/solid-dnd"
import { ReactiveMap } from "@solid-primitives/map"
import { BadgeID } from "./entityType"
export interface Badge {
	id: BadgeID
	name?: string
	icon?: string
}

export interface BadgeMap extends ReactiveMap<BadgeID, Badge> {
	id: BadgeID
	name: string
	icon?: string
}
