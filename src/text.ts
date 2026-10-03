// case- and accent-insensitive form of a text, so a search for "historico" finds "Histórico"
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
