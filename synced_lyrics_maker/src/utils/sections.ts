export type SectionType = 'Intro' | 'Verse' | 'Pre-Chorus' | 'Chorus' | 'Bridge' | 'Outro' | 'Instrumental' | 'Solo' | 'Other';

const SECTION_MAPPINGS: Record<string, string> = {
  // English
  'intro': 'Intro',
  'introduction': 'Intro',
  'verse': 'Verse',
  'pre-chorus': 'Pre-Chorus',
  'prechorus': 'Pre-Chorus',
  'chorus': 'Chorus',
  'refrain': 'Chorus',
  'hook': 'Chorus',
  'bridge': 'Bridge',
  'outro': 'Outro',
  'ending': 'Outro',
  'instrumental': 'Instrumental',
  'inst': 'Instrumental',
  'interlude': 'Instrumental',
  'solo': 'Solo',

  // French (supprimé 'introduction' car déjà défini)
    'couplet': 'Verse',
    'pre-refrain': 'Pre-Chorus',
    'prerefrain': 'Pre-Chorus',
    'pont': 'Bridge',
    'final': 'Outro',
};

const KNOWN_SECTION_TYPES = new Set([
  'Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus',
  'Bridge',
  'Outro',
  'Instrumental',
  'Solo',
]);

function isLikelyChordToken(value: string): boolean {
  return /^(?:[A-G](?:#|b)?|Do|Re|Mi|Fa|Sol|La|Si)(?:m|maj|min|dim|aug|sus|add|[0-9]|\/|b|#|\(|\)|\+|-)*$/i.test(value.trim());
}

/**
 * Normalise un nom de section brut (ex: "Couplet 1", "Verse 2", "[Refrain]")
 * vers un type standardisé.
 */
export function normalizeSectionName(rawName: string): string {
    if (!rawName) return '';
    
    // Nettoyage : retirer crochets, accolades, deux-points, espaces
    // On conserve les chiffres pour "Verse 1", "Chorus 2" si on veut, 
    // mais le mapping ci-dessus cherche des mots clés.
    
    // Simplification Regex : pas besoin d'échapper {}() dans []
    const cleanName = rawName
        .replace(/[\[\]{}().:]/g, '') // Retire les symboles de structure et points
        .trim(); 
        
    const lowerName = cleanName.toLowerCase();

    // 1. Recherche exacte
    if (SECTION_MAPPINGS[lowerName]) {
        return SECTION_MAPPINGS[lowerName];
    }

    // 2. Recherche par mot-clé (ex: "Couplet 1" -> commence par "couplet")
    // On trie par longueur décroissante pour matcher "Pre-Chorus" avant "Chorus" si nécessaire
    const sortedKeys = Object.keys(SECTION_MAPPINGS).sort((a, b) => b.length - a.length);
    
    for (const key of sortedKeys) {
        if (lowerName.startsWith(key)) {
            // Identifier le suffixe (ex: " 1", " A")
            const suffix = cleanName.slice(key.length).trim();
            const standardType = SECTION_MAPPINGS[key];
            
            // Si suffixe court (chiffre ou lettre), on l'ajoute
            if (suffix.length > 0 && suffix.length < 5) {
                return `${standardType} ${suffix}`;
            }
            return standardType;
        }
    }

    // 3. Fallback : Capitalisation simple
    if (!cleanName) return '';
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
}

/**
 * Détecte si une ligne de texte ressemble à un header de section
 * Accepte: [Section], {Section}, Section:
 */
export function isSectionHeader(text: string): boolean {
    const trimmed = text.trim();

    const bracketMatch = trimmed.match(/^\[(.+)]$/);
    if (bracketMatch) {
        const inner = bracketMatch[1].trim();

        // [C], [Am], [G/B], [Do] are chord tokens, not section headers.
        if (isLikelyChordToken(inner)) {
            return false;
        }

        const normalized = normalizeSectionName(inner);
        const canonical = normalized.replace(/\s+\d+$/, '');
        return KNOWN_SECTION_TYPES.has(canonical);
    }

    // Simplification Regex : échappement minimal
    return /^{.*}$/.test(trimmed) || /:$/.test(trimmed);
}

/**
 * Extrait et normalise le nom de la section depuis un header détecté
 */
export function extractSectionName(header: string): string {
    return normalizeSectionName(header);
}
