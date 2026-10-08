/** Máscara de telefone brasileiro: (11) 91234-5678 ou (11) 1234-5678. */
export function maskPhoneBR(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhoneBR(value: string): boolean {
  const d = phoneDigits(value);
  if (d.length !== 10 && d.length !== 11) return false;
  if (d.startsWith("0") || d[1] === "0") return false; // DDD válido não começa nem termina em 0
  return d.length === 10 || d[2] === "9"; // celular com 11 dígitos começa com 9
}
