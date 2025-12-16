import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import type { error } from "console";
import { ToastProvider } from "./context/ToastContext";
import { Footer } from "./components/ui/Footer";
import { Analytics } from "@vercel/analytics/next"

// export const links: Route.LinksFunction = () => [
// { rel: "preconnect", href: "https://fonts.googleapis.com" },
// {
//   rel: "preconnect",
//   href: "https://fonts.gstatic.com",
//   crossOrigin: "anonymous",
// },
// {
//   rel: "stylesheet",
//   href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
// },
// ];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" type="image/png" href="/memo.png" />
      </head>
      <body>
        {children}
        <Analytics />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-900">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center font-sans p-4 text-white">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-red-500">Ocorreu um erro</h1>
        <p className="text-slate-400 mt-2">
          {isRouteErrorResponse(error) && error.status === 404
            ? "Não foi possível encontrar o resumo solicitado."
            : "Algo deu errado. Tente novamente."}
        </p>
        <div className="text-center mt-8">
          <Link
            to="/"
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold py-2 px-4 rounded-md transition-all">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
