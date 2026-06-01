import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { FECHA_INICIO, NOMBRE_ELLA } from "@/lib/config";

export const Route = createFileRoute("/contador")({
  head: () => ({
    meta: [
      { title: "Nuestro tiempo · Cofre de Recuerdos" },
      { name: "description", content: "Cuánto tiempo llevamos juntos, contado en tiempo real." },
    ],
  }),
  component: Contador,
});

function diffParts(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  let hours = to.getHours() - from.getHours();
  let minutes = to.getMinutes() - from.getMinutes();
  let seconds = to.getSeconds() - from.getSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }
  return { years, months, days, hours, minutes, seconds };
}

function Contador() {
  const start = new Date(FECHA_INICIO);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const p = diffParts(start, now);
  const totalDays = Math.floor((now.getTime() - start.getTime()) / 86400000);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      <div className="text-center">
        <p className="font-script text-3xl text-primary md:text-4xl">desde aquel día</p>
        <h1 className="mt-2 font-serif text-4xl md:text-6xl">Nuestro tiempo juntos</h1>
        <p className="mt-3 text-muted-foreground">
          Empezamos el{" "}
          <span className="font-serif italic text-foreground">
            {start.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          .
        </p>
      </div>

      {/* Placa decorativa */}
      <div className="animate-fade-up mt-10 rounded-3xl border border-border bg-card p-6 shadow-book md:p-10">
        <div className="rounded-2xl border-2 border-dashed border-primary/30 p-6 md:p-10">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-primary/40" />
            <Heart className="h-5 w-5 fill-rose text-rose animate-flicker" />
            <span className="h-px w-12 bg-primary/40" />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 md:grid-cols-6">
            <Cell n={p.years} label="años" />
            <Cell n={p.months} label="meses" />
            <Cell n={p.days} label="días" />
            <Cell n={p.hours} label="horas" />
            <Cell n={p.minutes} label="min" />
            <Cell n={p.seconds} label="seg" highlight />
          </div>

          <div className="mt-8 text-center">
            <p className="font-serif text-xl italic text-foreground md:text-2xl">
              {totalDays.toLocaleString("es-ES")} días contigo, {NOMBRE_ELLA}.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Y aún así, siempre se siente como el primero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({ n, label, highlight }: { n: number; label: string; highlight?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl px-2 py-4 shadow-soft transition-colors ${
        highlight ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
      }`}
    >
      <span className="font-serif text-3xl tabular-nums md:text-5xl">
        {String(n).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:text-xs">
        {label}
      </span>
    </div>
  );
}
