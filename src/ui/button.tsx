import type { JSX, ValidComponent } from "solid-js"
import { splitProps } from "solid-js"

import * as ButtonPrimitive from "@kobalte/core/button"
import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

import { cn } from "~/lib/utils"

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline: "border border-input hover:bg-accent hover:text-accent-foreground",
				outline_only: "border border-transparent hover:border-input transition-all duration-250",
				outline_selected: "border-2 border-input bg-muted/50 hover:border-input transition-all duration-250",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
				initializing:
					"bg-primary animate-pulse transition-colors duration-250 hover:bg-accent hover:text-accent-foreground",
				no_format: "p-0 m-0 w-full",
				unstyled: "bg-transparent border-none shadow-none p-0 m-0 w-full",
				badge: "p-0 m-0 border border-accent rounded-md text-accent"
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "size-10",
				no_format: "",
				unstyled: "",
				badge: ""
			}
		},
		defaultVariants: {
			variant: "default",
			size: "default"
		}
	}
)

type ButtonProps<T extends ValidComponent = "button"> = ButtonPrimitive.ButtonRootProps<T> &
	VariantProps<typeof buttonVariants> & { class?: string | undefined; children?: JSX.Element }

const Button = <T extends ValidComponent = "button">(props: PolymorphicProps<T, ButtonProps<T>>) => {
	const [local, others] = splitProps(props as ButtonProps, ["variant", "size", "class"])
	return (
		<ButtonPrimitive.Root
			class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
			{...others}
		/>
	)
}

export type { ButtonProps }
export { Button, buttonVariants }