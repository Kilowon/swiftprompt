import { createSignal, For, Show } from "solid-js"
import { Button } from "~/registry/ui/button"

type TutorialImage = {
	src: string
	caption: string
}

type TutorialStep = {
	title: string
	description: string
	icon: string
	code?: string
	images?: TutorialImage[]
}

export default function Tutorial() {
	const [currentStep, setCurrentStep] = createSignal<number>(0)
	const [currentImage, setCurrentImage] = createSignal<number>(0)

	const steps: TutorialStep[] = [
		{
			title: "Welcome to SwiftPrompt! 🚀",
			description: "Your tool for creating explicit, modular, and testable AI prompts. Let's explore how it works!",
			icon: "i-carbon:chart-relationship",
			images: [
				{
					src: "/FirstPage.gif",
					caption: "SwiftPrompt: Create explicit, modular prompts."
				}
			]
		},
		{
			title: "Organization 📂",
			description: "Use Groups, Badges, and Sort Categories to keep your prompts organized and searchable.",
			icon: "i-carbon:folder",
			images: [
				{ src: "/Group_Create.gif", caption: "Groups: Organize by project names or collections of related elements" },
				{ src: "/filters.gif", caption: "Sort Categories: Project, Collection, Favorite, Archived, and Presets" },
				{
					src: "/Badge_Create.gif",
					caption: "Badges: Create subgroups within groups for easy searching (e.g., 'solid', 'striped' for backgrounds)"
				}
			]
		},
		{
			title: "Elements - Building Blocks 🧱",
			description:
				"Elements are like functions - they do one thing well. Create reusable prompt pieces with variables using {{fields}}.",
			icon: "i-carbon:cube",
			code: `Title: Background color
Summary: a solid background color
Prompt: The {{color}} of the background should be solid`,
			images: [
				{
					src: "/element.gif",
					caption: "Elements: Create reusable building blocks that do one thing well, like functions"
				},
				{ src: "/element_version.gif", caption: "Version Control: Each change to an element prompt creates a new version" },
				{
					src: "/Fields.gif",
					caption: "Fields: Use {{field}} for variables, ${{field}} for globals (e.g., {{color}}, {{pdf}})"
				}
			]
		},
		{
			title: "Templates - Final Form 📝",
			description:
				"Templates bring everything together. Use sections to create complete, composable prompts with versioning.",
			icon: "i-carbon:template",
			images: [
				{
					src: "/Template Create.gif",
					caption: "Templates: Name using camelCase like 'PickingBestPickel' for project functions"
				},
				{
					src: "/template_version.gif",
					caption: "Versioning: Save different iterations while maintaining element references"
				}
			]
		},
		{
			title: "Sections - Assembly 🔄",
			description:
				"Combine elements to create sections. These reference your elements and update automatically when elements change.",
			icon: "i-carbon:assembly",
			images: [
				{
					src: "/Section_Create.gif",
					caption: "Sections: Combine elements to build complete prompts that update automatically"
				},
				{ src: "/SectionElement.gif", caption: "References: Elements are linked by ID, changes propagate to all sections" }
			]
		},

		{
			title: "Modifiers & Fields 🎨",
			description: "Use {{fields}} for variables, ${{global}} for global settings. Modifiers fill these with data.",
			icon: "i-carbon:code",
			code: "{{color}}, {{pdf}}, ${{language}}",
			images: [
				{ src: "/Fields.gif", caption: "Fields: Add modifiers to sections with {{fields}} from modifiers Tab" },
				{ src: "/Fields.gif", caption: "Field Naming: Use kabab-case for multi-word fields (e.g., {{business-pdf}})" }
			]
		},

		{
			title: "Best Practices 📚",
			description: "Learn about naming conventions, versioning, and effective prompt organization.",
			icon: "i-carbon:book",
			code: `// Naming Examples
Element: Background Color
Template: AgenticPickelsPicker
Field: {{pdf}}, \${{color}}`,
			images: []
		},
		{
			title: "Ready to Create! 🎉",
			description: "Start building your modular prompts! Remember: explicit, reusable, and testable.",
			icon: "i-fluent-mdl2:education",
			images: []
		}
	]

	const nextImage = () => {
		const images = steps[currentStep()].images
		if (images && currentImage() < images.length - 1) {
			setCurrentImage(prev => prev + 1)
		}
	}

	const prevImage = () => {
		if (currentImage() > 0) {
			setCurrentImage(prev => prev - 1)
		}
	}

	// Reset image index when step changes
	const handleStepChange = (newStep: number) => {
		setCurrentStep(newStep)
		setCurrentImage(0)
	}

	return (
		<div class="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
			<div class="flex items-start gap-6">
				<div class={`${steps[currentStep()].icon} w-16 h-16 p-3 bg-sky-100 dark:bg-sky-900 rounded-xl shrink-0`} />
				<div class="space-y-2">
					<h3 class="text-xl font-bold">{steps[currentStep()].title}</h3>
					<p class="text-sm text-gray-600 dark:text-gray-300">{steps[currentStep()].description}</p>
				</div>
			</div>

			<Show when={steps[currentStep()].code}>
				<div class="flex flex-col gap-2">
					<div class="text-sm text-foreground">Example</div>
					<pre class="p-3 bg-background-secondary border border-border rounded-lg text-sm overflow-x-auto text-foreground font-mono">
						<code>{steps[currentStep()].code}</code>
					</pre>
				</div>
			</Show>

			<Show
				when={
					steps[currentStep()].images &&
					steps[currentStep()].images!.length > 0 &&
					currentImage() < steps[currentStep()].images!.length
				}
			>
				<div class="relative rounded-lg overflow-hidden bg-background border border-border">
					<div class="aspect-video relative">
						<img
							src={steps[currentStep()].images?.[currentImage()]?.src ?? ""}
							alt="Tutorial step"
							class="object-contain w-full h-full"
						/>

						<div class="absolute bottom-0 left-0 right-0 bg-background text-foreground p-2 text-sm text-center">
							{steps[currentStep()].images?.[currentImage()]?.caption ?? ""}
						</div>
					</div>

					<Show when={steps[currentStep()].images!.length > 1}>
						<div class="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
							<For each={steps[currentStep()].images}>
								{(_, index) => (
									<div
										class={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
											index() === currentImage() ? "bg-sky-600 scale-125" : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400"
										}`}
										onClick={() => setCurrentImage(index())}
									/>
								)}
							</For>
						</div>

						<div class="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-2">
							<Button
								variant="ghost"
								class="rounded-full bg-background hover:bg-background/80"
								onClick={prevImage}
								disabled={currentImage() === 0}
							>
								<div class="i-carbon:arrow-left" />
							</Button>
							<Button
								variant="ghost"
								class="rounded-full bg-background hover:bg-background/80"
								onClick={nextImage}
								disabled={currentImage() === steps[currentStep()].images!.length - 1}
							>
								<div class="i-carbon:arrow-right" />
							</Button>
						</div>
					</Show>
				</div>
			</Show>

			<div class="flex justify-between items-center">
				<Button
					variant="outline"
					disabled={currentStep() === 0}
					onClick={() => handleStepChange(currentStep() - 1)}
				>
					<div class="i-carbon:arrow-left mr-2" />
					Previous
				</Button>

				<div class="flex gap-2">
					<For each={steps}>
						{(_, index) => (
							<div
								class={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
									index() === currentStep() ? "bg-sky-600 scale-125" : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400"
								}`}
								onClick={() => handleStepChange(index())}
							/>
						)}
					</For>
				</div>

				<Button
					variant="outline"
					disabled={currentStep() === steps.length - 1}
					onClick={() => handleStepChange(currentStep() + 1)}
				>
					Next
					<div class="i-carbon:arrow-right ml-2" />
				</Button>
			</div>
		</div>
	)
}
