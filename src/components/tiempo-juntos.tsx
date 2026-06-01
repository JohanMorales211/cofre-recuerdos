import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { FECHA_PRIMER_DIA } from "@/lib/config";

// Descompone la diferencia entre dos fechas en años/meses/días/h/min/seg.
function diffJuntos(from: Date, to: Date) {
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

// Contador en vivo del tiempo desde el primer día que se vieron.
export function TiempoJuntos() {
  const start = useMemo(() => new Date(FECHA_PRIMER_DIA), []);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const p = diffJuntos(start, now);
  const totalDays = Math.floor((now.getTime() - start.getTime()) / 86400000);

  return (
    <div className="animate-fade-up mx-auto max-w-3xl rounded-3xl border border-border bg-gradient-warm p-4 shadow-soft md:p-6">
      <div className="flex items-center justify-center gap-2 text-primary">
        <span className="h-px w-6 bg-primary/40 sm:w-10" />
        <Heart className="h-4 w-4 shrink-0 fill-rose text-rose animate-flicker" />
        <p className="font-script text-xl sm:text-2xl">tiempo desde que nos conocimos</p>
        <Heart className="h-4 w-4 shrink-0 fill-rose text-rose animate-flicker" />
        <span className="h-px w-6 bg-primary/40 sm:w-10" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        <TimeCell n={p.years} label="años" />
        <TimeCell n={p.months} label="meses" />
        <TimeCell n={p.days} label="días" />
        <TimeCell n={p.hours} label="horas" />
        <TimeCell n={p.minutes} label="min" />
        <TimeCell n={p.seconds} label="seg" highlight />
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <span className="font-serif italic text-foreground">{totalDays.toLocaleString("es-ES")} días</span>{" "}
        desde que te vi por primera vez, el{" "}
        <span className="whitespace-nowrap font-serif italic text-foreground">
          {start.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        .
      </p>
    </div>
  );
}

function TimeCell({ n, label, highlight }: { n: number; label: string; highlight?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl px-1 py-2 shadow-soft ${
        highlight ? "bg-accent text-accent-foreground" : "bg-card/70 text-foreground"
      }`}
    >
      <span className="font-serif text-2xl tabular-nums md:text-3xl">{String(n).padStart(2, "0")}</span>
      <span className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-muted-foreground md:text-[10px]">
        {label}
      </span>
    </div>
  );
}
