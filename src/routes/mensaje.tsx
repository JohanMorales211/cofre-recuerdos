import { createFileRoute } from "@tanstack/react-router";
import { Heart, Sparkles } from "lucide-react";
import { MENSAJE_DEDICADO, NOMBRE_ELLA } from "@/lib/config";

export const Route = createFileRoute("/mensaje")({
  head: () => ({
    meta: [
      { title: "Para ti · Cofre de Recuerdos" },
      { name: "description", content: "Una carta dedicada con cariño." },
    ],
  }),
  component: Mensaje,
});

function Mensaje() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <div className="text-center">
        <Sparkles className="mx-auto h-5 w-5 text-gold animate-flicker" />
        <p className="mt-2 font-script text-3xl text-primary md:text-4xl">para ti,</p>
        <h1 className="font-serif text-4xl md:text-6xl">{NOMBRE_ELLA}</h1>
      </div>

      <article className="animate-fade-up mt-10 rounded-3xl border border-border bg-card p-8 shadow-book md:p-14">
        <div className="bg-paper relative rounded-2xl border border-border/60 p-6 md:p-10">
          <Heart className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 fill-rose text-rose" />
          <div className="space-y-5 font-serif text-lg leading-relaxed text-foreground/90 md:text-xl">
            {MENSAJE_DEDICADO.split("\n\n").map((para, i) => (
              <p key={i} className={i === 0 ? "first-letter:font-serif first-letter:text-5xl first-letter:font-semibold first-letter:text-primary first-letter:mr-2 first-letter:float-left first-letter:leading-none" : ""}>
                {para}
              </p>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center font-script text-2xl text-primary/80">
          siempre, siempre tuyo.
        </p>
      </article>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Para cambiar este mensaje, edita <code className="rounded bg-secondary px-1.5 py-0.5">src/lib/config.ts</code>.
      </p>
    </div>
  );
}
