### Purpose & Goals

Current AI prompt generators seem to be fully driven by a simple prompt and AI fills in the blanks or "enhances" the simple prompt. When we do this it makes it hard to compare the effectiveness and accuracy of our prompts.

When an artist uses photoshop or blender they use functions to assist in creating their vision in an explicit but creative way. That is the vision for SwiftPrompt, give the user an explicit but creative way of making, storing, and testing prompts.

SwiftPrompt wants to help make these generated prompts be more explicit with modular elements used to make up composable sections. We then take these sections to form templates that bring our prompt to life.

# Best Practice

### Naming

#### Element Title

===

#### Element Summary

===

#### Element Prompt

Should be thought of as a building block for a prompt and not the prompt it self. Think of a function and how it does one thing and does it well. This is how an element should be used.

The use of fields(delimiters) in mustache brackets will allow variables to be injected during prompt assembly.

{{fields}}

They should be unique in the element to prevent collisions. They can also be similar across elements for global settings. Fields will be parsed by a prefix so keeping a generic naming convention is best practice i.e.

```
{{color}},{{pdf}}, {{info}}, etc.
```

If you are using two words use a dash or kabab case

```
{{business-pdf}}  {{character-name}} {{book-text}}
```

Set a field as a global using $

```
${{color}} ${{language}}
```

You can then use the global settings in the Template UI to set one modifier and use it across many locations.

#### Element Badges

Badges are designed to be subgroups within a group for easy searching and categorization.

example:

group - Image Backgrounds

badges - solid, wavy, splatter, vista, hazy

#### Group Title

For projects use a project name.

For collections use a name that best describes all the elements use case.

example: Image Backgrounds

#### Sort Categories

The following are sort categories and how they are intended to be applied however it doesn't change the scope or functionality of a Group or Template

Project - Having special use case for a project or as a store of what is being used in a project.

Collection - Separate by concern of general use.

Example: Thinking, Step By Step, Output schema, etc.

Favorite - If you find it to be a go to Group or Template.

Archived - Good for deprecated Groups or Templates saved for reference

Presets - Are hard coded and come preset for examples and derivation.

#### Template Title

Best Practice: Should use the function name of where you call it in the project or its generic intended function. in camel case.

```
PickingBestPickel  AgenticPickelsPicker
```

### Duplication

Only copies the content to a new Element, Group or Template. It does not duplicate the versioning structure and will start over at v1.

## Element Creation

### Elements

Think of an element like that of a function or a paragraph where it will convey one idea or one building block of the whole idea. These are pieces that will assemble to form the whole story latter to make effective and predictable prompts.

Title:

```
Background color
```

Summary:

```
a solid background color
```

Prompt:

```
The {{color}} of the background should be one solid
color and the main image should be in the foreground
of this solid {{color}} background.
```

In this element we made a snippet that is useful across many different prompts dealing with image generation. Now we can have the LLM assemble more meaningful and explicit prompts from the pieces.

versions are saved on any change of the element prompt

### Sections

Sections are made up of references back to individual elements. So mutating an element prompt will mutate the output of the section the element is associated with including versioned "saved" templates and its sections.

Deleting elements will also delete them from the template and its sections as they only store the ids to reference the data.

Deleting sections or templates have no direct issues with elements.

Sections will only use the most current version of the element.

### Modifiers

Used to fill in Fields with data.
