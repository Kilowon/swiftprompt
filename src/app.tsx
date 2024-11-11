import "@unocss/reset/tailwind.css"
import "virtual:uno.css"

import { isServer } from "solid-js/web"
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core"
import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import { Suspense, onMount } from "solid-js"
import Topbar from "~/components/topbar"
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import { getCookie } from "vinxi/http"
import { ColorExampleFooter } from "./components/color-footer"
import { Toaster } from "~/registry/ui/sonner"
import { HotKeyFooter } from "./components/HotKeyFooter"
import { Title, MetaProvider, Meta, Link } from "@solidjs/meta"

const getServerCookies = (): string => {
	"use server"
	const colorMode = getCookie("kb-color-mode")
	return colorMode ? `kb-color-mode=${colorMode}` : ""
}

const PlausibleScript = (): null => {
	onMount(() => {
		try {
			if (import.meta.env.VITE_DRAFT_SITE === "true") return

			// Check if required env vars are present
			if (!import.meta.env.VITE_PLAUSIBLE_DOMAIN || !import.meta.env.VITE_PLAUSIBLE_SCRIPT_SRC) {
				console.warn("Plausible configuration missing")
				return
			}

			// Check if script already exists
			const existingScript = document.querySelector(`script[src="${import.meta.env.VITE_PLAUSIBLE_SCRIPT_SRC}"]`)
			if (existingScript) return

			const script = document.createElement("script")
			script.defer = true // Use defer instead of async
			script.dataset.domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
			script.src = import.meta.env.VITE_PLAUSIBLE_SCRIPT_SRC
			script.onerror = e => console.error("Failed to load Plausible script:", e)
			document.head.appendChild(script)
		} catch (err) {
			console.error("Error initializing Plausible:", err)
		}
	})
	return null
}

export function MetaTags() {
	let shouldRender = false

	onMount(() => {
		shouldRender = import.meta.env.VITE_DRAFT_SITE === "false"
	})

	if (!shouldRender) {
		return null
	}

	return (
		<>
			<Meta
				http-equiv="Strict-Transport-Security"
				content="max-age=63072000 includeSubDomains preload"
			/>
			<Meta
				http-equiv="X-Content-Type-Options"
				content="nosniff"
			/>
			<Meta
				http-equiv="X-Frame-Options"
				content="DENY"
			/>
			<Meta
				http-equiv="X-XSS-Protection"
				content="1; mode=block"
			/>
			<Meta
				http-equiv="Content-Security-Policy"
				content="default-src 'self' modernedge.app *.modernedge.app direct.shauns.cool services.shauns.cool endpoint.shauns.cool ; img-src https://*; child-src 'none'; "
			/>
			<Meta
				http-equiv="Referrer-Policy"
				content="strict-origin-when-cross-origin"
			/>
		</>
	)
}

export default function App() {
	const storageManager = cookieStorageManagerSSR(isServer ? getServerCookies() : document.cookie)
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false
			}
		}
	})

	return (
		<QueryClientProvider client={queryClient}>
			<ColorModeScript storageType={storageManager.type} />
			<ColorModeProvider storageManager={storageManager}>
				<MetaProvider>
					<MetaTags />
					<Title>{import.meta.env.VITE_STORE_NAME}</Title>
					<Meta charset="utf-8" />
					<Meta
						name="viewport"
						content="width=device-width, initial-scale=1"
					/>
					<Meta
						name="description"
						content={import.meta.env.VITE_STORE_DESCRIPTION}
					/>
					<Meta
						name="robots"
						content="index, follow"
					/>
					<Meta
						name="keywords"
						content={import.meta.env.VITE_STORE_KEYWORDS}
					/>
					<Meta
						name="twitter:title"
						content={import.meta.env.VITE_OL_TITLE || ""}
					/>
					<Meta
						name="twitter:description"
						content={import.meta.env.VITE_OL_DESC || ""}
					/>
					<Meta
						name="twitter:site"
						content={import.meta.env.VITE_OL_SITE || ""}
					/>{" "}
					<Meta
						name="twitter:domain"
						content={import.meta.env.VITE_OL_DOMAIN || ""}
					/>
					<Meta
						name="twitter:image"
						content={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${import.meta.env.VITE_OL_LOGO}`}
					/>
					<Meta
						name="twitter:summary"
						content={import.meta.env.VITE_OL_DESC || ""}
					/>
					<Meta
						name="twitter:card"
						content={"summary_large_image"}
					/>
					<Link
						rel="preload"
						as="image"
						href={import.meta.env.VITE_STORE_FAVICON}
					/>
					<Link
						rel="favicon"
						href={import.meta.env.VITE_STORE_FAVICON}
					/>
					<Link
						rel="preconnect"
						href={`${import.meta.env.VITE_DIRECTUS_URL}/items/Primary`}
					/>
					<Link
						rel="preconnect"
						href="https://fonts.googleapis.com"
					/>
					<Link
						rel="preconnect"
						href="https://fonts.gstatic.com"
						crossorigin="anonymous"
					/>
					<PlausibleScript />
				</MetaProvider>
				<Router
					root={props => (
						<div class="flex flex-col h-full">
							<Topbar />
							<div class="flex-1 overflow-hidden">
								<Suspense>{props.children}</Suspense>
							</div>
							<HotKeyFooter />
							<ColorExampleFooter />
						</div>
					)}
				>
					<FileRoutes />
				</Router>
			</ColorModeProvider>
			<Toaster />
			<SolidQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}
