export function asset(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}
