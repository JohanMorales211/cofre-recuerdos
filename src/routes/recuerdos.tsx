import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BookOpen, Plus, Pencil, Trash2, X, Calendar, ImagePlus, Library as LibraryIcon, LayoutGrid, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/recuerdos")({
  head: () => ({
    meta: [
      { title: "El Cofre · Nuestros Recuerdos" },
      { name: "description", content: "Galería de recuerdos: historias, fotos y momentos compartidos." },
    ],
  }),
  component: Recuerdos,
});

type Memory = {
  id: string;
  title: string;
  memory_date: string;
  description: string;
  photos: string[];
  created_at: string;
};

const SPINE_COLORS = [
  "linear-gradient(180deg, oklch(0.86 0.07 5), oklch(0.7 0.09 10))",
  "linear-gradient(180deg, oklch(0.84 0.06 310), oklch(0.68 0.08 305))",
  "linear-gradient(180deg, oklch(0.88 0.055 165), oklch(0.72 0.07 160))",
  "linear-gradient(180deg, oklch(0.92 0.05 85), oklch(0.78 0.08 80))",
  "linear-gradient(180deg, oklch(0.88 0.04 30), oklch(0.7 0.06 30))",
];

function Recuerdos() {
  const qc = useQueryClient();
  const [view, setView] = useState<"shelf" | "grid">("shelf");
  const [open, setOpen] = useState<Memory | null>(null);
  const [editing, setEditing] = useState<Memory | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Memory | null>(null);

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ["memories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("memory_date", { ascending: false });
      if (error) throw error;
      return data as Memory[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (m: Memory) => {
      // delete photos from storage
      if (m.photos.length) {
        const paths = m.photos
          .map((url) => url.split("/memory-photos/")[1])
          .filter(Boolean);
        if (paths.length) await supabase.storage.from("memory-photos").remove(paths);
      }
      const { error } = await supabase.from("memories").delete().eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      toast.success("Recuerdo guardado en la memoria… eliminado del cofre.");
      setConfirmDelete(null);
      setOpen(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // group by year for timeline-ish chapters
  const chapters = useMemo(() => {
    const map = new Map<string, Memory[]>();
    for (const m of memories) {
      const y = new Date(m.memory_date).getFullYear().toString();
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

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
          <ViewBtn active={view === "shelf"} onClick={() => setView("shelf")} icon={LibraryIcon} label="Estantería" />
          <ViewBtn active={view === "grid"} onClick={() => setView("grid")} icon={LayoutGrid} label="Galería" />
        </div>
        <Button onClick={() => setEditing("new")} className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> Nuevo recuerdo
        </Button>
      </div>

      {isLoading ? (
        <p className="mt-16 text-center text-muted-foreground">Sacudiendo el polvo de los libros…</p>
      ) : memories.length === 0 ? (
        <EmptyState onCreate={() => setEditing("new")} />
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

      {/* Reader / book opening */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {open && (
          <DialogContent className="max-w-2xl overflow-hidden border-border bg-card p-0">
            <div className="animate-open-book bg-paper">
              <DialogHeader className="border-b border-border/60 bg-gradient-warm px-6 py-5">
                <DialogTitle className="font-serif text-3xl">{open.title}</DialogTitle>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(open.memory_date).toLocaleDateString("es-ES", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </DialogHeader>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                {open.photos.length > 0 && (
                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    {open.photos.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`${open.title} ${i + 1}`}
                        loading="lazy"
                        className="aspect-square w-full rounded-xl object-cover shadow-soft"
                      />
                    ))}
                  </div>
                )}
                <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground/90">
                  {open.description || <span className="italic text-muted-foreground">Sin historia escrita… todavía.</span>}
                </div>
              </div>

              <DialogFooter className="border-t border-border/60 bg-secondary/50 px-6 py-3">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(open); setOpen(null); }}>
                  <Pencil className="mr-1 h-4 w-4" /> Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(open)} className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-1 h-4 w-4" /> Borrar
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <MemoryForm
        editing={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["memories"] }); setEditing(null); }}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar este recuerdo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará "{confirmDelete?.title}" y sus fotos. Esto no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ViewBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Plus; label: string }) {
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

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mt-16 rounded-3xl border-2 border-dashed border-border bg-card/60 p-12 text-center">
      <BookOpen className="mx-auto h-10 w-10 text-primary/60" />
      <h2 className="mt-4 font-serif text-2xl">El cofre está esperando</h2>
      <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
        Agrega el primer recuerdo: una fecha, una historia, una foto. Lo demás lo escribimos juntos.
      </p>
      <Button onClick={onCreate} className="mt-6 rounded-full">
        <Plus className="mr-1 h-4 w-4" /> Crear el primer recuerdo
      </Button>
    </div>
  );
}

function ChapterShelf({
  year, items, onOpen,
}: { year: string; items: Memory[]; onOpen: (m: Memory) => void }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-serif text-3xl text-foreground">Capítulo {year}</h2>
        <span className="h-px flex-1 bg-border" />
        <Heart className="h-4 w-4 fill-rose text-rose" />
      </div>

      <div className="rounded-2xl bg-gradient-shelf p-3 shadow-book md:p-4">
        <div className="flex flex-wrap items-end gap-1.5 overflow-x-auto rounded-lg bg-card/40 p-3">
          {items.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onOpen(m)}
              title={m.title}
              className="group relative flex h-44 w-10 shrink-0 flex-col items-center justify-between rounded-sm px-1 py-3 text-center shadow-soft transition-all hover:-translate-y-2 hover:shadow-book md:h-56 md:w-12"
              style={{ background: SPINE_COLORS[i % SPINE_COLORS.length] }}
            >
              <span className="line-clamp-3 origin-center -rotate-90 whitespace-nowrap pt-8 font-serif text-xs text-primary-foreground/95 md:text-sm">
                {m.title}
              </span>
              <span className="text-[9px] font-medium text-primary-foreground/80">
                {new Date(m.memory_date).getFullYear()}
              </span>
            </button>
          ))}
        </div>
        {/* shelf board */}
        <div className="mt-1 h-2 rounded-b-lg bg-gradient-to-b from-[oklch(0.65_0.06_50)] to-[oklch(0.5_0.07_45)] shadow-inner" />
      </div>
    </section>
  );
}

function MemoryCard({ m, onOpen, index }: { m: Memory; onOpen: () => void; index: number }) {
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
          {new Date(m.memory_date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h3 className="mt-1 font-serif text-xl">{m.title}</h3>
        {m.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
        )}
      </div>
    </button>
  );
}

function MemoryForm({
  editing, onClose, onSaved,
}: { editing: Memory | "new" | null; onClose: () => void; onSaved: () => void }) {
  const isOpen = editing !== null;
  const isNew = editing === "new";
  const m = isNew ? null : (editing as Memory | null);

  const [title, setTitle] = useState(m?.title ?? "");
  const [date, setDate] = useState(m?.memory_date ?? new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(m?.description ?? "");
  const [photos, setPhotos] = useState<string[]>(m?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // reset when editing changes
  useMemoChange(editing, () => {
    setTitle(m?.title ?? "");
    setDate(m?.memory_date ?? new Date().toISOString().slice(0, 10));
    setDescription(m?.description ?? "");
    setPhotos(m?.photos ?? []);
  });

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("memory-photos").upload(path, file, {
          cacheControl: "3600", upsert: false,
        });
        if (error) throw error;
        const { data } = supabase.storage.from("memory-photos").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setPhotos((p) => [...p, ...uploaded]);
      toast.success(`${uploaded.length} foto(s) añadidas`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto(url: string) {
    const path = url.split("/memory-photos/")[1];
    if (path) await supabase.storage.from("memory-photos").remove([path]);
    setPhotos((p) => p.filter((u) => u !== url));
  }

  async function handleSave() {
    if (!title.trim() || !date) {
      toast.error("Necesitamos al menos un título y una fecha.");
      return;
    }
    setSaving(true);
    try {
      if (m) {
        const { error } = await supabase
          .from("memories")
          .update({ title, memory_date: date, description, photos, updated_at: new Date().toISOString() })
          .eq("id", m.id);
        if (error) throw error;
        toast.success("Recuerdo actualizado");
      } else {
        const { error } = await supabase
          .from("memories")
          .insert({ title, memory_date: date, description, photos });
        if (error) throw error;
        toast.success("Recuerdo guardado en el cofre");
      }
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {isNew ? "Nuevo recuerdo" : "Editar recuerdo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Aquel día en la playa..." />
          </div>
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="desc">Historia</Label>
            <Textarea id="desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cuéntalo como si lo escribieras en un diario..." />
          </div>

          <div>
            <Label>Fotos</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {photos.map((url) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(url)}
                    className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Quitar foto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:bg-accent/30">
                <ImagePlus className="h-6 w-6" />
                <span className="mt-1 text-xs">{uploading ? "Subiendo…" : "Añadir"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? "Guardando…" : "Guardar recuerdo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// helper: run a function when a value changes
function useMemoChange<T>(value: T, fn: () => void) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { fn(); return null; }, [value]);
}
