// Capa de acceso a los recuerdos. Reemplaza a Supabase: los datos viven en
// un JSON local (src/data/recuerdos.json) que actúa como pequeña "base de datos".
import db from "@/data/recuerdos.json";

// Un recuerdo = una fila de la antigua tabla "memories".
export type Recuerdo = {
  id: string;
  title: string;
  memory_date: string; // AAAA-MM-DD
  description: string;
  photos: string[];
  created_at: string; // ISO 8601
};

// Convierte "AAAA-MM-DD" a una fecha en hora LOCAL. Si se usara
// `new Date("2026-03-12")` se interpretaría como medianoche UTC y, en husos
// horarios detrás de UTC (p. ej. Colombia, UTC-5), se mostraría el día anterior.
export function parseFecha(fecha: string): Date {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

// Devuelve todos los recuerdos ordenados del más reciente al más antiguo,
// igual que hacía la consulta `.order("memory_date", { ascending: false })`.
export function getRecuerdos(): Recuerdo[] {
  return [...(db.recuerdos as Recuerdo[])].sort(
    (a, b) => parseFecha(b.memory_date).getTime() - parseFecha(a.memory_date).getTime(),
  );
}

// Última vez que se actualizó la estantería: el created_at más reciente de
// todos los recuerdos. Devuelve null si el cofre está vacío.
export function getUltimaActualizacion(): Date | null {
  const recuerdos = db.recuerdos as Recuerdo[];
  if (recuerdos.length === 0) return null;
  const masReciente = Math.max(...recuerdos.map((r) => new Date(r.created_at).getTime()));
  return new Date(masReciente);
}
