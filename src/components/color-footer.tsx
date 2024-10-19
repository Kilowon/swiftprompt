import { Show } from "solid-js"
import { cn } from "~/lib/utils"
import { colorFooter } from "~/global_state"

export function ColorExampleFooter() {
	return (
		<Show when={colorFooter()}>
			<div
				class={cn(
					"bg-background-secondary w-full h-30 flex flex-wrap gap-2 p-4 font-inter text-sm font-700 fixed bottom-0 left-0 right-0"
				)}
			>
				<div class="w-20 h-20 bg-background rounded-md flex items-center justify-center text-foreground">Background</div>
				<div class="w-20 h-20 bg-background-secondary rounded-md flex items-center justify-center text-foreground">
					Background Secondary
				</div>
				<div class="w-20 h-20 bg-foreground rounded-md flex items-center justify-center text-background">Foreground</div>
				<div class="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground">Muted</div>
				<div class="w-20 h-20 bg-popover rounded-md flex items-center justify-center text-popover-foreground">Popover</div>
				<div class="w-20 h-20 bg-border rounded-md flex items-center justify-center text-foreground">Border</div>
				<div class="w-20 h-20 bg-input rounded-md flex items-center justify-center text-foreground">Input</div>
				<div class="w-20 h-20 bg-card rounded-md flex items-center justify-center text-card-foreground">Card</div>
				<div class="w-20 h-20 bg-primary rounded-md flex items-center justify-center text-primary-foreground">Primary</div>
				<div class="w-20 h-20 bg-secondary rounded-md flex items-center justify-center text-secondary-foreground">
					Secondary
				</div>
				<div class="w-20 h-20 bg-accent rounded-md flex items-center justify-center text-accent-foreground">Accent</div>
				<div class="w-20 h-20 bg-destructive rounded-md flex items-center justify-center text-destructive-foreground">
					Destructive
				</div>
				<div class="w-20 h-20 bg-info rounded-md flex items-center justify-center text-info-foreground">Info</div>
				<div class="w-20 h-20 bg-success rounded-md flex items-center justify-center text-success-foreground">Success</div>
				<div class="w-20 h-20 bg-warning rounded-md flex items-center justify-center text-warning-foreground">Warning</div>
				<div class="w-20 h-20 bg-error rounded-md flex items-center justify-center text-error-foreground">Error</div>
				<div class="w-20 h-20 bg-ring rounded-md flex items-center justify-center text-primary-foreground">Ring</div>
			</div>
		</Show>
	)
}
