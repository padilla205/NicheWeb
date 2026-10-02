// Pasa a minusculas y quita acentos para comparar textos al buscar ("Sueter" encuentra "suéter")
export function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
