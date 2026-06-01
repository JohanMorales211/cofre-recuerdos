import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen, Calendar, Library as LibraryIcon, LayoutGrid, Heart,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { getRecuerdos, parseFecha, type Recuerdo } from "@/lib/recuerdos";

export const Route = createFileRoute("/recuerdos")({
  head: () => ({
    meta: [
      { title: "El Cofre · Nuestros Recuerdos" },
      { name: "description", content: "Galería de recuerdos: historias, fotos y momentos compartidos." },
    ],
  }),
  component: Recuerdos,
});

const SPINE_COLORS = [
  "linear-gradient(180deg, oklch(0.86 0.07 5), oklch(0.7 0.09 10))",
  "linear-gradient(180deg, oklch(0.84 0.06 310), oklch(0.68 0.08 305))",
  "linear-gradient(180deg, oklch(0.88 0.055 165), oklch(0.72 0.07 160))",
  "linear-gradient(180deg, oklch(0.92 0.05 85), oklch(0.78 0.08 80))",
  "linear-gradient(180deg, oklch(0.88 0.04 30), oklch(0.7 0.06 30))",
];

function Recuerdos() {
  const [view, setView] = useState<"shelf" | "grid">("shelf");
  const [open, setOpen] = useState<Recuerdo | null>(null);

  const memories = useMemo(() => getRecuerdos(), []);

  const chapters = useMemo(() => {
    const map = new Map<string, Recuerdo[]>();
    for (const m of memories) {
      const y = parseFecha(m.memory_date).getFullYear().toString();
      if (!map.has(y)) map.set(y, []);
      map.get(y)!.push(m);
    }
    return Array.from(map.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [memories]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <header className="text-center">
        <p className="font-script text-3xl text-primary">nuestra biblioteca</p>
        <h1 className="mt-1 font-serif text-4xl md:text-6xl">El cofre de recuerdos</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Cada libro es un momento. Tócalo para abrirlo y revivirlo.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
          <ViewBtn active={view === "shelf"} onClick={() => setView("shelf")} icon={LibraryIcon} label="Estantería" />
          <ViewBtn active={view === "grid"} onClick={() => setView("grid")} icon={LayoutGrid} label="Galería" />
        </div>
      </div>

      {memories.length === 0 ? (
        <EmptyState />
      ) : view === "shelf" ? (
        <div className="mt-10 space-y-12">
          {chapters.map(([year, items]) => (
            <ChapterShelf key={year} year={year} items={items} onOpen={setOpen} />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((m, i) => (
            <MemoryCard key={m.id} m={m} onOpen={() => setOpen(m)} index={i} />
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {open && (
          <DialogContent className="flex h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-card p-0 sm:h-auto sm:max-h-[88vh] sm:w-[calc(100%-1.5rem)] sm:max-w-2xl sm:rounded-lg sm:border sm:border-border">
            <div className="flex min-h-0 flex-1 flex-col bg-paper animate-open-book">
              <DialogHeader className="shrink-0 border-b border-border/60 bg-gradient-warm px-6 py-5 pr-12 text-left">
                <DialogTitle className="font-serif text-2xl sm:text-3xl">{open.title}</DialogTitle>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {parseFecha(open.memory_date).toLocaleDateString("es-ES", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <PhotoViewer photos={open.photos} title={open.title} />
                <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-foreground/90 sm:text-lg">
                  {open.description || <span className="italic text-muted-foreground">Sin historia escrita… todavía.</span>}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function PhotoViewer({ photos, title }: { photos: string[]; title: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <img
        src={photos[0]}
        alt={title}
        loading="lazy"
        className="mx-auto mb-5 max-h-[44vh] w-auto rounded-xl object-contain shadow-soft sm:max-h-[56vh]"
      />
    );
  }

  return (
    <div className="mb-5">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {photos.map((url, i) => (
            <CarouselItem key={i} className="flex items-center justify-center">
              <img
                src={url}
                alt={`${title} ${i + 1}`}
                loading="lazy"
                className="mx-auto max-h-[44vh] w-auto rounded-xl object-contain shadow-soft sm:max-h-[56vh]"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 border-0 bg-background/80 backdrop-blur hover:bg-background" />
        <CarouselNext className="right-2 border-0 bg-background/80 backdrop-blur hover:bg-background" />
      </Carousel>

      <div className="mt-3 flex items-center justify-center gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Ir a la foto ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-5 bg-primary" : "w-1.5 bg-primary/30 hover:bg-primary/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ViewBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof LibraryIcon; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors ${
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 rounded-3xl border-2 border-dashed border-border bg-card/60 p-12 text-center">
      <BookOpen className="mx-auto h-10 w-10 text-primary/60" />
      <h2 className="mt-4 font-serif text-2xl">El cofre está esperando</h2>
      <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
        Aún no hay recuerdos. Añade el primero editando el archivo{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">src/data/recuerdos.json</code>.
      </p>
    </div>
  );
}

function ChapterShelf({
  year, items, onOpen,
}: { year: string; items: Recuerdo[]; onOpen: (m: Recuerdo) => void }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-serif text-3xl text-foreground">Capítulo {year}</h2>
        <span className="h-px flex-1 bg-border" />
        <Heart className="h-4 w-4 fill-rose text-rose" />
      </div>

      <div className="rounded-2xl bg-gradient-shelf p-3 shadow-book md:p-4">
        <div className="flex flex-wrap items-end gap-1.5 overflow-x-auto rounded-lg bg-card/40 p-3">
          {items.map((m, i) => {
            const fecha = parseFecha(m.memory_date);
            const dia = String(fecha.getDate()).padStart(2, "0");
            const mes = String(fecha.getMonth() + 1).padStart(2, "0");
            return (
              <button
                key={m.id}
                onClick={() => onOpen(m)}
                title={m.title}
                className="group relative flex h-44 w-10 shrink-0 flex-col items-center justify-between rounded-sm px-1 py-4 text-center shadow-soft transition-all hover:-translate-y-2 hover:shadow-book md:h-56 md:w-12"
                style={{ background: SPINE_COLORS[i % SPINE_COLORS.length] }}
              >
                {/* fecha del recuerdo en números: día sobre mes */}
                <span className="flex flex-col items-center gap-1 font-serif text-primary-foreground">
                  <span className="text-xl leading-none md:text-2xl">{dia}</span>
                  <span className="h-px w-4 bg-primary-foreground/50" />
                  <span className="text-sm leading-none text-primary-foreground/90 md:text-base">{mes}</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-primary-foreground/85 md:text-xs">
                  {fecha.getFullYear()}
                </span>
              </button>
            );
          })}
        </div>
        {/* tabla del estante */}
        <div className="mt-1 h-2 rounded-b-lg bg-gradient-to-b from-[oklch(0.65_0.06_50)] to-[oklch(0.5_0.07_45)] shadow-inner" />
      </div>
    </section>
  );
}

function MemoryCard({ m, onOpen, index }: { m: Recuerdo; onOpen: () => void; index: number }) {
  const cover = m.photos[0];
  return (
    <button
      onClick={onOpen}
      className="animate-fade-up group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition-all hover:-translate-y-1 hover:shadow-book"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-warm">
        {cover ? (
          <img
            src={cover}
            alt={m.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/40">
            <BookOpen className="h-12 w-12" />
          </div>
        )}
        {m.photos.length > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-xs backdrop-blur">
            +{m.photos.length - 1}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {parseFecha(m.memory_date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h3 className="mt-1 font-serif text-xl">{m.title}</h3>
        {m.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
        )}
      </div>
    </button>
  );
}
