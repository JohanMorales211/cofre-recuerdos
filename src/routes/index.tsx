import { createFileRoute, Link } from "@tanstack/react-router";
import { BookHeart, Clock, Library, Mail, Sparkles } from "lucide-react";
import heroImg from "@/assets/library-hero.jpg";
import { NOMBRE_EL, NOMBRE_ELLA } from "@/lib/config";
import { TiempoJuntos } from "@/components/tiempo-juntos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nuestro Cofre de Recuerdos" },
      { name: "description", content: "Una biblioteca privada para guardar y revivir nuestros momentos juntos." },
      { property: "og:title", content: "Nuestro Cofre de Recuerdos" },
      { property: "og:description", content: "Una biblioteca privada para guardar y revivir nuestros momentos juntos." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero - book cover */}
      <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="animate-fade-up order-2 md:order-1">
            <p className="font-script text-3xl text-primary md:text-4xl">el cofre de</p>
            <h1 className="mt-1 font-serif text-5xl leading-tight text-foreground md:text-7xl">
              {NOMBRE_EL} <span className="text-primary">&amp;</span> {NOMBRE_ELLA}
            </h1>
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <Sparkles className="h-4 w-4 text-gold animate-flicker" />
              <span className="h-px flex-1 bg-border" />
            </div>
            <p className="max-w-md font-serif text-lg italic text-muted-foreground md:text-xl">
              Un pequeño cofre, una biblioteca íntima, un lugar donde nuestros días se vuelven
              libros y nuestras tardes se vuelven páginas.
            </p>
            <p className="mt-4 max-w-md text-muted-foreground">
              Este será el lugar donde guardemos todos
              nuestros momentos valiosos —los grandes, los pequeñitos, los que solo
              nosotros entendemos—. Ábrelo cuando quieras revivirnos.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/recuerdos"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-serif text-base text-primary-foreground shadow-book transition-transform hover:scale-[1.03]"
              >
                <Library className="h-4 w-4" />
                Abrir el cofre
              </Link>
              <Link
                to="/mensaje"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-serif text-base text-foreground shadow-soft transition-colors hover:bg-accent/50"
              >
                <Mail className="h-4 w-4" />
                Leer mi carta
              </Link>
            </div>
          </div>

          {/* Book cover visual */}
          <div className="order-1 md:order-2">
            <div className="animate-fade-up relative mx-auto max-w-sm" style={{ animationDelay: "0.15s" }}>
              <div className="relative aspect-[3/4] rotate-1 rounded-r-md rounded-l-sm bg-gradient-warm p-6 shadow-book">
                <div className="absolute inset-y-3 left-2 w-1.5 rounded-full bg-primary/20" />
                <div className="flex h-full flex-col items-center justify-between border border-primary/20 px-4 py-6 text-center">
                  <div className="font-script text-2xl text-primary/80">vol. uno</div>
                  <div>
                    <BookHeart className="mx-auto h-10 w-10 text-primary" />
                    <h2 className="mt-4 font-serif text-3xl text-foreground">Nuestro Cofre</h2>
                    <p className="mt-2 font-serif italic text-muted-foreground">de recuerdos</p>
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <span className="h-px w-10 bg-primary/40" />
                      <Sparkles className="h-3 w-3 text-gold" />
                      <span className="h-px w-10 bg-primary/40" />
                    </div>
                    <p className="mt-4 font-serif text-sm uppercase tracking-[0.2em] text-muted-foreground">
                      {NOMBRE_EL} &amp; {NOMBRE_ELLA}
                    </p>
                  </div>
                  <div className="font-serif text-xs italic text-muted-foreground">
                    edición de bolsillo
                  </div>
                </div>
              </div>
              {/* lamp glow */}
              <div className="absolute -inset-10 -z-10 lamp-glow opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Tiempo desde que nos vimos */}
      <section className="relative mx-auto max-w-6xl px-4 pb-6">
        <TiempoJuntos />
      </section>

      {/* Library backdrop card */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20">
        <div className="overflow-hidden rounded-3xl shadow-book ring-1 ring-border">
          <img
            src={heroImg}
            alt="Biblioteca acogedora con estanterías de libros pastel"
            width={1536}
            height={1024}
            className="h-64 w-full object-cover md:h-80"
          />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <NavCard to="/contador" icon={Clock} title="Nuestro tiempo" desc="Cada segundo desde que somos nosotros." />
          <NavCard to="/recuerdos" icon={Library} title="El cofre" desc="Capítulos, fotos e historias guardadas." />
          <NavCard to="/mensaje" icon={Mail} title="Para ti" desc="Una carta que te escribí sin prisas." />
        </div>
      </section>
    </div>
  );
}

function NavCard({
  to, icon: Icon, title, desc,
}: { to: string; icon: typeof Clock; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-book"
    >
      <Icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
      <h3 className="mt-4 font-serif text-2xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
