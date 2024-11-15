import { defineConfig } from "@solidjs/start/config"
import UnoCSS from "unocss/vite"

export default defineConfig({
	ssr: false,
	vite: {
		plugins: [
			UnoCSS({
				configFile: "../my-uno.config.ts"
			})
		]
	}
})
