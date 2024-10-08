import {
	defineConfig,
	//presetAttributify,
	presetIcons,
	//presetTypography,
	presetUno,
	presetWebFonts,
	transformerDirectives,
	transformerVariantGroup
} from "unocss"
import { presetScrollbar } from "unocss-preset-scrollbar"

export default defineConfig({
	presets: [
		presetScrollbar({
			// config
		}),
		presetIcons({
			scale: 1.2,
			warn: true,
			prefix: "i-",
			extraProperties: {
				display: "inline-block",
				"vertical-align": "middle"
			}
		}),
		presetUno(),
		presetWebFonts({
			provider: "google",
			fonts: {
				inter: [
					{
						name: "Inter",
						weights: ["700", "400", "500"]
					},
					{
						name: "sans-serif",
						provider: "none"
					}
				]
			}
		})
	],

	shortcuts: [
		{
			"content-container": "max-w-[1440px] w-full mx-auto px-8"
		},
		{
			"content-container-wide": "max-w-[80vw] w-full mx-auto px-8"
		},

		{ "animate-accordion-down": "animate-[accordion-down_0.2s_ease-out]" },
		{ "animate-accordion-up": "animate-[accordion-up_0.2s_ease-out]" },
		{ "animate-content-show": "animate-[content-show_0.2s_ease-out]" },
		{ "animate-content-hide": "animate-[content-hide_0.2s_ease-out]" },
		{ "animate-caret-blink": "animate-[caret-blink_1.25s_ease-out_infinite]" }
	],
	rules: [
		["dark", { selector: 'html.dark, [data-kb-theme="dark"]' }],
		["light", { selector: 'html.light, [data-kb-theme="light"]' }],
		["warm-dark", { selector: 'html.warm-dark, [data-kb-theme="warm-dark"]' }],
		[
			"sl-arrow",
			{
				[`--slidy-arrow-size`]: "80px",
				[`--slidy-arrow-color`]: "white",
				[`--slidy-nav-item-size`]: "4px"
			}
		],
		[
			"overflow-ellipsis",
			{
				["overflow"]: "hidden",
				["text-overflow"]: "ellipsis",
				["white-space"]: "nowrap"
			}
		],
		[
			"height-fill",
			{
				["height"]: "-webkit-fill-available"
			}
		],
		[
			"text-balance",
			{
				["text-wrap"]: "balance"
			}
		],
		[
			"scrollbar-gutter",
			{
				["scrollbar-gutter"]: "stable",
				["scrollbar-width"]: "auto"
			}
		],

		[
			/^scrollbar-hide$/,
			([r]) => `.scrollbar-hide{scrollbar-width:none}
.scrollbar-hide::-webkit-scrollbar{display:none}`
		],
		[
			/^scrollbar-default$/,
			([r]) => `.scrollbar-default{scrollbar-width:auto}
.scrollbar-default::-webkit-scrollbar{display:block}
.scrollbar-default::-webkit-scrollbar-thumb{min-height:40px}`
		]
	],
	theme: {
		colors: {
			border: "hsl(var(--border))",
			input: "hsl(var(--input))",
			ring: "hsl(var(--ring))",
			background: "hsl(var(--background))",
			backgroundSecondary: "hsl(var(--background-secondary))",
			foreground: "hsl(var(--foreground))",
			primary: {
				DEFAULT: "hsl(var(--primary))",
				foreground: "hsl(var(--primary-foreground))"
			},
			secondary: {
				DEFAULT: "hsl(var(--secondary))",
				foreground: "hsl(var(--secondary-foreground))"
			},
			destructive: {
				DEFAULT: "hsl(var(--destructive))",
				foreground: "hsl(var(--destructive-foreground))"
			},
			info: {
				DEFAULT: "hsl(var(--info))",
				foreground: "hsl(var(--info-foreground))"
			},
			success: {
				DEFAULT: "hsl(var(--success))",
				foreground: "hsl(var(--success-foreground))"
			},
			warning: {
				DEFAULT: "hsl(var(--warning))",
				foreground: "hsl(var(--warning-foreground))"
			},
			error: {
				DEFAULT: "hsl(var(--error))",
				foreground: "hsl(var(--error-foreground))"
			},
			muted: {
				DEFAULT: "hsl(var(--muted))",
				foreground: "hsl(var(--muted-foreground))"
			},
			accent: {
				DEFAULT: "hsl(var(--accent))",
				foreground: "hsl(var(--accent-foreground))"
			},
			popover: {
				DEFAULT: "hsl(var(--popover))",
				foreground: "hsl(var(--popover-foreground))"
			},
			card: {
				DEFAULT: "hsl(var(--card))",
				foreground: "hsl(var(--card-foreground))"
			}
		},
		extend: {
			"--popover": "9 9 11",
			"--popover-foreground": "9 9 11",
			"--card": "0,200,0",
			"--card-foreground": "0,200,0",
			"--border": "0,200,0",
			"--input": "0,200,0",
			"--ring": "0,200,0",
			"--background": "0,200,0",
			"--background-secondary": "0,200,0",
			"--foreground": "0,200,0",
			"--primary": "0,200,0",
			"--primary-foreground": "0,200,0",
			"--secondary": "0,200,0",
			"--secondary-foreground": "0,200,0",
			"--destructive": "0,200,0",
			"--destructive-foreground": "0,200,0",
			"--info": "0,200,0",
			"--info-foreground": "0,200,0",
			"--success": "0,200,0",
			"--success-foreground": "0,200,0",
			"--warning": "0,200,0",
			"--warning-foreground": "0,200,0",
			"--error": "0,200,0",
			"--error-foreground": "0,200,0",
			"--muted": "0,200,0",
			"--muted-foreground": "0,200,0",
			"--accent": "0,200,0",
			"--accent-foreground": "0,200,0",

			borderRadius: {
				xl: "calc(var(--radius) + 4px)",
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)"
			}
		}
	},
	transformers: [transformerDirectives(), transformerVariantGroup()],
	preflights: [
		{
			getCSS: () => `
			@layer base {
		:root {
  --background: 220 20% 97%;
  --background-secondary: 220 13% 95%;
  --foreground: 221.17 24% 19%;
  --muted: 220 15% 90%;
  --muted-foreground: 220 20% 40%;
  --popover: 220 20% 98%;
  --popover-foreground: 220 25% 10%;
  --border: 220 15% 85%;
  --input: 220 15% 85%;
  --card: 220 20% 98%;
  --card-foreground: 220 25% 10%;
  --primary: 220 80% 50%;
  --primary-foreground: 220 20% 98%;
  --secondary: 220 15% 60%;
  --secondary-foreground: 220 25% 10%;
  --accent: 220.28 13% 40%;
  --accent-foreground: 220 15% 90%;
  --destructive: 0 70% 50%;
  --destructive-foreground: 0 20% 98%;
  --info: 200 70% 50%;
  --info-foreground: 200 20% 98%;
  --success: 160 70% 40%;
  --success-foreground: 160 20% 98%;
  --warning: 40 70% 50%;
  --warning-foreground: 40 20% 10%;
  --error: 0 70% 50%;
  --error-foreground: 0 20% 98%;
  --ring: 220 80% 50%;
  --radius: 0.5rem;
}

[data-kb-theme="dark"] {
  --background: 220 27% 8%;
  --background-secondary: 220 25% 10%;
  --foreground: 220 20% 97%;
  --muted: 220 19% 14%;
  --muted-foreground: 220 20% 60%;
  --popover: 220 25% 12%;
  --popover-foreground: 220 20% 97%;
  --border: 220 15% 16%;
  --input: 220 25% 25%;
  --card: 220 25% 12%;
  --card-foreground: 220 20% 97%;
  --primary: 220 70% 60%;
  --primary-foreground: 220 20% 10%;
  --secondary: 220 20% 40%;
  --secondary-foreground: 220 20% 97%;
  --accent: 219 8% 53%;
  --accent-foreground: 220 20% 97%;
  --destructive: 0 60% 50%;
  --destructive-foreground: 0 20% 98%;
  --info: 200 60% 50%;
  --info-foreground: 200 20% 98%;
  --success: 160 60% 40%;
  --success-foreground: 160 20% 98%;
  --warning: 40 60% 50%;
  --warning-foreground: 40 20% 98%;
  --error: 0 60% 50%;
  --error-foreground: 0 20% 98%;
  --ring: 220 70% 60%;
}
  [data-kb-theme="warm-dark"] {
  --background: 220.01 15% 8%;
  --background-secondary: 240.02 7.0% 11%;
  --foreground: 220 20% 97%;
  --muted: 219.95 19% 14%;
  --muted-foreground: 220 19% 45%;
  --popover: 223.81 0% 12%;
  --popover-foreground: 220 20% 97%;
  --border: 219.99 10% 11%;
  --input: 220 25% 25%;
  --card: 240.02 7.0% 11%;
  --card-foreground: 220 20% 97%;
  --primary: 8.16 91% 59%;
  --primary-foreground: 220 20% 97%;
  --secondary: 219.99 9% 46%;
  --secondary-foreground: 220 20% 97%;
  --accent: 26.66 5% 63%;
  --accent-foreground: 223.81 0% 18%;
  --destructive: 0 60% 50%;
  --destructive-foreground: 0 20% 98%;
  --info: 200 60% 50%;
  --info-foreground: 200 20% 98%;
  --success: 160 60% 40%;
  --success-foreground: 160 20% 98%;
  --warning: 40 60% 50%;
  --warning-foreground: 40 20% 98%;
  --error: 0 60% 50%;
  --error-foreground: 0 20% 98%;
  --ring: 8.16 91% 59%;
}
			}
	
			@layer base {
			  * { @apply border-border; }
			  body {
				@apply bg-background text-foreground;
				font-feature-settings: "rlig" 1, "calt" 1;
			  }
			}
	
			@layer utilities {
			  .step { counter-increment: step; }
			  .step:before {
				@apply absolute w-9 h-9 bg-muted rounded-full font-mono font-medium text-center text-base inline-flex items-center justify-center -indent-px border-4 border-background;
				@apply ml-[-50px] mt-[-4px];
				content: counter(step);
			  }
			}
	
			@media (max-width: 640px) {
			  .container { @apply px-4; }
			}
	
			::-webkit-scrollbar { width: 16px; }
			::-webkit-scrollbar-thumb {
			  border-radius: 9999px;
			  border: 4px solid transparent;
			  background-clip: content-box;
			  @apply bg-accent;
			}
	
			@keyframes accordion-down {
			  from { height: 0 }
			  to { height: var(--kb-accordion-content-height) }
			}
			@keyframes accordion-up {
			  from { height: var(--kb-accordion-content-height) }
			  to { height: 0 }
			}
			@keyframes content-show {
			  from { opacity: 0; transform: scale(0.96) }
			  to { opacity: 1; transform: scale(1) }
			}
			@keyframes content-hide {
			  from { opacity: 1; transform: scale(1) }
			  to { opacity: 0; transform: scale(0.96) }
			}
			@keyframes caret-blink {
			  0%,70%,100% { opacity: 1 }
			  20%,50% { opacity: 0 }
			}
			 body, #root {
				margin: 0;
				padding: 0;
				height: 100vh;
				overflow: hidden;
			}
		  `
		}
	]
})
