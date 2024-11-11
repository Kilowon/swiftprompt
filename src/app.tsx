import "@unocss/reset/tailwind.css"
import "virtual:uno.css"

import { isServer } from "solid-js/web"
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core"
import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import { Suspense } from "solid-js"
import Topbar from "~/components/topbar"
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import { getCookie } from "vinxi/http"
import { ColorExampleFooter } from "./components/color-footer"
import { Toaster } from "~/registry/ui/sonner"
import { HotKeyFooter } from "./components/HotKeyFooter"
function getServerCookies() {
	"use server"
	const colorMode = getCookie("kb-color-mode")
	return colorMode ? `kb-color-mode=${colorMode}` : ""
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
