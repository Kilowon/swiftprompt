import "@unocss/reset/tailwind.css"
import "virtual:uno.css"

import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import { Suspense } from "solid-js"
import Nav from "~/components/Nav"
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"

export default function App() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false
			}
		}
	})

	return (
		<QueryClientProvider client={queryClient}>
			<Router
				root={props => (
					<>
						<Nav />
						<Suspense>{props.children}</Suspense>
					</>
				)}
			>
				<FileRoutes />
			</Router>
			<SolidQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}
