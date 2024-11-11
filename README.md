This was made as an entry for the [SolidHack2024](https://https://hack.solidjs.com//challenges/1)

```
 ███████╗██╗    ██╗██╗███████╗████████╗██████╗ ██████╗  ██████╗ ███╗   ███╗██████╗ ████████╗
 ██╔════╝██║    ██║██║██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔═══██╗████╗ ████║██╔══██╗╚══██╔══╝
 ███████╗██║ █╗ ██║██║█████╗     ██║   ██████╔╝██████╔╝██║   ██║██╔████╔██║██████╔╝   ██║
 ╚════██║██║███╗██║██║██╔══╝     ██║   ██╔═══╝ ██╔══██╗██║   ██║██║╚██╔╝██║██╔═══╝    ██║
 ███████║╚███╔███╔╝██║██║        ██║   ██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║        ██║
 ╚══════╝ ╚══╝╚══╝ ╚═╝╚═╝        ╚═╝   ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝        ╚═╝
```

SwiftPrompt reimagines how we create and manage AI prompts. Instead of relying on simple inputs with AI-driven enhancements, SwiftPrompt takes inspiration from creative software tools, providing a structured yet flexible approach to prompt engineering, allowing users to build complex, explicit prompts from reusable components.

## Why SwiftPrompt?

Traditional prompt generators often feel like black boxes - input goes in, enhanced output comes out. SwiftPrompt brings transparency and control to this process by treating prompts as composable elements that can be mixed, matched, and fine-tuned. Think of it like having a creative toolkit where each tool serves a specific purpose but works in harmony with others.

## Core Concepts

### Elements: The Building Blocks

Elements are the heart of SwiftPrompt. Each element is a single-purpose prompt component, similar to a well-designed function in programming. They include a title, summary, and the prompt text itself, with variable fields marked using mustache brackets: `{{field_name}}`.

For example, a background color element might look like:

```
Title: Background Color
Summary: Defines a solid background color
Prompt: The {{color}} of the background should be one solid color and the main image should be in the foreground of this solid {{color}} background.
```

### Fields and Variables

Fields make your prompts dynamic and reusable. Use kebab-case for multi-word fields (`{{business-pdf}}`, `{{character-name}}`), and prefix global fields with $ (`${{color}}`) to use them across multiple elements.

### Groups and Organization

Groups help organize your elements in meaningful ways. Whether you're working on a specific project or collecting related prompts, groups keep everything tidy and accessible. You can mark groups as favorites, archive them when they're no longer needed, or set them as presets for quick access.

### Templates: Bringing It All Together

Templates are where the magic happens. They combine elements into complete, functional prompts. Think of templates as recipes - they specify which elements to use and how to combine them. Name them descriptively using camelCase (like `PickingBestPickel` or `AgenticPickelsPicker`) to make their purpose clear.

## Working with SwiftPrompt

### Creating Effective Elements

When creating elements, focus on making them modular and reusable. Each element should do one thing well, making it easier to combine them in different ways. Version control happens automatically whenever you modify an element's prompt, so you can always track changes.

### Building Templates

Templates reference elements through sections, maintaining a dynamic relationship. If you update an element, all templates using that element will reflect the changes. This ensures consistency while allowing for flexible prompt assembly.

### Managing Changes

Duplication creates fresh copies of elements or templates, starting at version 1. This lets you experiment with variations while preserving the original. Remember that references between elements and templates aren't duplicated - you're creating new, independent components.

## Tips for Success

- Think modularly: Break down complex prompts into focused elements
- Use clear, descriptive names for everything
- Test combinations of elements to find effective patterns
- Keep your organization system simple but meaningful

## Getting Started

SwiftPrompt is currently in alpha preview and can be accessed at [swiftprompt.app](https://swiftprompt.app)

### Privacy First

SwiftPrompt is designed with a local-first approach - all your data is stored directly on your device, not in a central database. This means you maintain complete control over your prompts and can work without an internet connection once the app is loaded.

### Alpha Status

As an alpha release, SwiftPrompt is still evolving. We're actively developing new features and refining existing ones based on user feedback. While the core functionality is stable, you might encounter occasional rough edges as we work to improve the experience.

## Contributing

We welcome contributions! If you'd like to help improve SwiftPrompt, feel free to:

- Report bugs
- Suggest new features
- Share your feedback and experiences

## License

SwiftPrompt is released under the MIT License

This is just the beginning - SwiftPrompt is designed to grow and adapt with your needs. We're excited to see how you'll use it to create more effective and predictable prompts.

Remember to ⭐ the repo on GitHub if you find SwiftPrompt helpful!
