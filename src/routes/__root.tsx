import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Menu, BookHeart, Home, Clock, Library, Mail } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl text-foreground">404</h1>
        <p className="mt-3 text-muted-foreground">Esta página se perdió entre las estanterías.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Volver a la portada
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl">Algo se cayó del estante</h1>
        <p className="mt-2 text-sm text-muted-foreground">Intenta de nuevo en un momento.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => { router.invalidate(); reset(); }}>Reintentar</Button>
          <Button variant="outline" asChild><a href="/">Ir al inicio</a></Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nuestro Cofre de Recuerdos" },
      { name: "description", content: "Una pequeña biblioteca privada para guardar y revivir nuestros momentos." },
      { name: "theme-color", content: "#f7e6e0" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/foto-web.png" },
      { rel: "apple-touch-icon", href: "/foto-web.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Quicksand:wght@400;500;600&family=Dancing+Script:wght@500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/", label: "Portada", icon: Home },
  { to: "/contador", label: "Nuestro tiempo", icon: Clock },
  { to: "/recuerdos", label: "El cofre", icon: Library },
  { to: "/mensaje", label: "Para ti", icon: Mail },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      {NAV.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`group flex items-center gap-2 rounded-full px-4 py-2 font-serif text-base transition-all ${
              active
                ? "bg-accent text-accent-foreground shadow-soft"
                : "text-foreground/70 hover:bg-accent/40 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <BookHeart className="h-6 w-6 text-primary" />
          <span className="font-serif text-lg italic">Nuestro Cofre</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLinks />
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <SheetTitle className="font-serif text-xl">Nuestro Cofre</SheetTitle>
              <div className="mt-6 flex flex-col gap-2">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Petals() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="animate-petal absolute text-rose/40"
          style={{
            left: `${(i * 11 + 5) % 100}%`,
            animationDelay: `${i * 1.6}s`,
            animationDuration: `${12 + (i % 4) * 3}s`,
            fontSize: `${10 + (i % 4) * 4}px`,
            color: i % 2 ? "var(--rose)" : "var(--lilac)",
            opacity: 0.5,
          }}
        >
          ❀
        </span>
      ))}
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen">
        <Petals />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <footer className="border-t border-border/40 py-6 text-center">
            <p className="font-script text-xl text-primary/70">hecho con amor</p>
          </footer>
        </div>
      </div>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
