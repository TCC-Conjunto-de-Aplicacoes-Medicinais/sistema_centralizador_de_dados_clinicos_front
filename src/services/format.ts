/** Formata uma data de nascimento AAAA-MM-DD como DD/MM/AAAA, sem deslocamento de fuso. */
export function formatBirthDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value || "";
}
