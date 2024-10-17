import { createEffect, Show } from "solid-js"
import { storeEntityMap } from "../helpers/entityHelpers"
import { isEditingItem, setIsEditingItem } from "../global_state"
import { ElementID } from "~/types/entityType"

export const EditableGroupText = (props: {
	id: ElementID
	name: string
	type: string
	onChange: (newName: string) => void
}) => {
	let inputRef: HTMLInputElement | undefined

	const handleBlur = (e: FocusEvent) => {
		setIsEditingItem({ status: "saved", id: props.id, label: "" })
		const newText = (e.target as HTMLElement).textContent || ""
		props.onChange(newText)
		storeEntityMap()
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		if (((e.key === "s" || e.key === "S") && e.ctrlKey) || e.key === "Enter") {
			e.preventDefault() // Prevent default browser save action
			;(e.target as HTMLElement).blur()
			setIsEditingItem({ status: "saved", id: props.id, label: "" })
			storeEntityMap()
		}
	}

	createEffect(() => {
		if (isEditingItem().status === "editing" && inputRef) {
			inputRef.focus()
		}
	})

	// yeah i know <span> isnt the best element to use here, but <p> doesnt let whitespace be preserved
	return (
		<Show when={isEditingItem().status === "editing" && isEditingItem().id === props.id}>
			<div>
				<span
					ref={inputRef}
					contentEditable={true}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
					class="min-w-0 w-full min-h-10 border-none outline-none text-sm font-bold mt-1.5 mb-1.5 capitalize text-center"
				>
					{props.name || "\u200B"}
				</span>
			</div>

			<div
				class="flex items-center ml-auto"
				onClick={() => handleBlur}
			>
				<div class="i-material-symbols-light:data-check w-1.0em h-1.0em ml-2 text-muted-foreground hover:text-primary cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out" />
			</div>
		</Show>
	)
}
