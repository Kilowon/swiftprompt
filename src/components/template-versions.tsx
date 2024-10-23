import { createSignal, Show, createEffect } from "solid-js"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/registry/ui/tooltip"
import { Button } from "~/registry/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/registry/ui/select"
import { TemplateGroupID, VersionID } from "~/types/entityType"
import { selectedTemplateGroup, selectedTemplateVersion, templates, setSelectedTemplateVersion } from "~/global_state"
import { incrementTemplateGroupVersion, revertTemplateToPreviousVersion } from "~/helpers/actionHelpers"
import { cn } from "~/lib/utils"
interface TemplateVersionsProps {
	version: VersionID
}

const TemplateVersions = (props: TemplateVersionsProps) => {
	const [isLocked, setIsLocked] = createSignal(true)

	const handleSetVersion = (value: number, isCurrent: boolean) => {
		setSelectedTemplateVersion(value)
	}

	const handleRevertVersion = () => {
		revertTemplateToPreviousVersion(
			selectedTemplateGroup() as unknown as TemplateGroupID,
			selectedTemplateVersion() as unknown as VersionID
		)
		setSelectedTemplateVersion(
			templates.get(selectedTemplateGroup() as unknown as TemplateGroupID)?.versionCounter as unknown as VersionID
		)
	}

	const handleIncrementVersion = () => {
		incrementTemplateGroupVersion(selectedTemplateGroup() as unknown as TemplateGroupID)
		setSelectedTemplateVersion(
			templates.get(selectedTemplateGroup() as unknown as TemplateGroupID)?.versionCounter as unknown as VersionID
		)
	}

	createEffect(() => {
		//the template is newly selected
		if (!selectedTemplateVersion()) {
			setSelectedTemplateVersion(props.version)
		}
	})

	return (
		<div class="flex justify-end items-center gap-2">
			<Show when={selectedTemplateVersion() !== props.version}>
				<div
					onClick={() => setIsLocked(!isLocked())}
					class={cn(
						"i-mdi:lock w-1em h-1em",

						isLocked() && "i-mdi:lock text-accent"
					)}
				></div>
			</Show>
			<Show
				when={true}
				fallback={
					<div class="text-xs font-medium bg-background rounded-md px-2 py-0.5 justify-center items-center flex select-none ">
						<div class="text-[.5rem] mr-0.25 mt-0.5">v</div>
						<div>{props.version}</div>
					</div>
				}
			>
				<div class="flex items-center justify-center mr-2">
					<Select
						value={{
							value: selectedTemplateVersion() ?? templates.get(selectedTemplateGroup()!)?.versionCounter ?? 0,
							label: selectedTemplateVersion() ?? templates.get(selectedTemplateGroup()!)?.versionCounter ?? 0
						}}
						defaultValue={{
							value: selectedTemplateVersion() ?? templates.get(selectedTemplateGroup()!)?.versionCounter ?? 0,
							label: selectedTemplateVersion() ?? templates.get(selectedTemplateGroup()!)?.versionCounter ?? 0
						}}
						onChange={e => {
							const value = e?.value ?? 0
							handleSetVersion(value, false)
						}}
						options={Array.from(templates.get(selectedTemplateGroup()!)?.sections.keys() ?? []).map(key => {
							return {
								value: key,
								label: key
							}
						})}
						optionValue={"value" as any}
						optionTextValue={"label" as any}
						optionDisabled={"disabled" as any}
						placeholder={selectedTemplateVersion() ?? templates.get(selectedTemplateGroup()!)?.versionCounter ?? 0}
						itemComponent={props => (
							<SelectItem
								class="text-xs font-medium bg-background rounded-md px-2 py-0.5 justify-center items-center w-7 h-6"
								item={props.item}
							>
								<div class="flex items-center">
									<div class="text-[.5rem] mr-0.25 mt-0.5">v</div>
									<span class="text-xs">{(props.item as any).rawValue.label}</span>
								</div>
							</SelectItem>
						)}
						class="text-xs font-medium  rounded-md px-2 py-0.5 justify-center items-center flex select-none w-7 h-6"
					>
						<SelectTrigger class="flex items-center justify-center w-6 h-6 border-0 text-xs font-700 border border-border bg-background ">
							<div class="text-[0.5rem]  mr-0.25 mt-0.5">v</div>
							<SelectValue<{ value: number; label: string }>>{state => state.selectedOption()?.label}</SelectValue>
						</SelectTrigger>
						<SelectContent />
					</Select>
				</div>
			</Show>

			<Tooltip
				openDelay={1000}
				closeDelay={0}
			>
				<TooltipTrigger
					as={Button}
					variant="ghost"
					size="icon"
					class="  hover:text-accent-foreground"
					onClick={() => {
						handleRevertVersion()
					}}
				>
					<div class="i-mdi:file-revert w-1.25em h-1.25em"></div>
					<span class="sr-only">Revert Version</span>
				</TooltipTrigger>
				<TooltipContent>Revert Version (Ctrl + R)</TooltipContent>
			</Tooltip>
			<Tooltip
				openDelay={1000}
				closeDelay={0}
			>
				<TooltipTrigger
					as={Button}
					onClick={() => handleIncrementVersion()}
					variant="ghost"
					size="icon"
					class="  hover:text-accent-foreground"
				>
					<div class="i-mdi:upload-box w-1.25em h-1.25em"></div>
					<span class="sr-only">Increment Version</span>
				</TooltipTrigger>
				<TooltipContent>Increment Version</TooltipContent>
			</Tooltip>
		</div>
	)
}

export default TemplateVersions
