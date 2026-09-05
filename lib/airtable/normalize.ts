const INVISIBLE_CHARS = [0x200b, 0x200c, 0x200d, 0xfeff, 0x00a0, 0x2060]
  .map((code) => String.fromCharCode(code))
  .join("");
const INVISIBLE_CHARS_RE = new RegExp(`[${INVISIBLE_CHARS}]`, "g");

// Un champ lookup Airtable peut contenir un caractere invisible (espace
// insecable, zero-largeur, BOM) qui casse une egalite stricte tout en
// semblant identique a l'oeil — d'ou ce nettoyage avant toute comparaison
// entre une cle Supabase (cle_unique_airtable) et une cle Airtable (id_logement).
export function normalize(s: string) {
  return (s || "")
    .normalize("NFKC")
    .replace(INVISIBLE_CHARS_RE, "")
    .trim()
    .toLowerCase();
}
