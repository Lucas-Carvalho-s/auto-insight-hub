/**
 * Registry of realistic automotive part images
 * Keys are normalized part names (lowercase, underscores)
 * Values are high-quality image URLs
 */

export const partImageRegistry: Record<string, string> = {
  // Sistema Elétrico
  "bateria": "https://images.unsplash.com/photo-1624525572672-132313334974?q=80&w=800&auto=format&fit=crop",
  "alternador": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop",
  "motor_de_partida": "https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=800&auto=format&fit=crop",
  "velas": "https://images.unsplash.com/photo-1635786157887-173302149035?q=80&w=800&auto=format&fit=crop",
  "vela_ignicao": "https://images.unsplash.com/photo-1635786157887-173302149035?q=80&w=800&auto=format&fit=crop",
  "vela_de_ignicao": "https://images.unsplash.com/photo-1635786157887-173302149035?q=80&w=800&auto=format&fit=crop",
  
  // Motor e Arrefecimento
  "radiador": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop",
  "bomba_dagua": "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?q=80&w=800&auto=format&fit=crop",
  "bomba_de_agua": "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?q=80&w=800&auto=format&fit=crop",
  "correia_dentada": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop",
  "correia": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop",
  "motor": "https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=800&auto=format&fit=crop",
  "filtro_ar": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
  "filtro_de_ar": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
  "liquido_arrefecimento": "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=800&auto=format&fit=crop",
  "oleo_motor": "https://images.unsplash.com/photo-1635784623083-0db6c7e3f927?q=80&w=800&auto=format&fit=crop",
  "oleo_do_motor": "https://images.unsplash.com/photo-1635784623083-0db6c7e3f927?q=80&w=800&auto=format&fit=crop",
  
  // Suspensão e Freios
  "pneu": "https://images.unsplash.com/photo-1580441527853-c5701650a075?q=80&w=800&auto=format&fit=crop",
  "pneus": "https://images.unsplash.com/photo-1580441527853-c5701650a075?q=80&w=800&auto=format&fit=crop",
  "pastilha_freio": "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=800&auto=format&fit=crop",
  "pastilha_de_freio": "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=800&auto=format&fit=crop",
  "pastilhas_de_freio": "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=800&auto=format&fit=crop",
  "disco_freio": "https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=800&auto=format&fit=crop",
  "disco_de_freio": "https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=800&auto=format&fit=crop",
  "discos_de_freio": "https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=800&auto=format&fit=crop",
  "amortecedor": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
  "amortecedores": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
  "mola": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?q=80&w=800&auto=format&fit=crop",
  "mola_suspensao": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?q=80&w=800&auto=format&fit=crop",
  "fluido_freio": "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=800&auto=format&fit=crop",
  "fluido_de_freio": "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=800&auto=format&fit=crop",
  "caliper": "https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=800&auto=format&fit=crop",
  "bieleta": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?q=80&w=800&auto=format&fit=crop",
  "bucha_suspensao": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=800&auto=format&fit=crop",
  "terminal_direcao": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop",
  
  // Rodas
  "roda": "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?q=80&w=800&auto=format&fit=crop",
  "rodas": "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?q=80&w=800&auto=format&fit=crop",
  
  // Escapamento
  "escapamento": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
  "catalisador": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop",
  "silenciador": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop",
  "sensor_oxigenio": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop",
  "sonda_lambda": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop",
  
  // Transmissão
  "embreagem": "https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=800&auto=format&fit=crop",
  "cambio": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
  
  // Iluminação
  "farol": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800&auto=format&fit=crop",
  "farois": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800&auto=format&fit=crop",
  "lanterna": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
  "lanternas": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
};

// Default fallback image for unknown parts
export const FALLBACK_PART_IMAGE = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop";

/**
 * Normalize a part name for lookup
 * Handles accents, spaces, and case variations
 */
function normalizePartName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '_')           // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, '');    // Remove special characters
}

/**
 * Get the image URL for a specific part
 * Returns fallback if part not found
 */
export function getPartImageUrl(partName: string | null | undefined): string {
  if (!partName) return FALLBACK_PART_IMAGE;
  
  const normalized = normalizePartName(partName);
  
  // Direct match
  if (partImageRegistry[normalized]) {
    return partImageRegistry[normalized];
  }
  
  // Try partial match (if normalized contains a key or vice versa)
  for (const [key, url] of Object.entries(partImageRegistry)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return url;
    }
  }
  
  return FALLBACK_PART_IMAGE;
}

/**
 * Check if we have a specific image for a part
 */
export function hasPartImage(partName: string | null | undefined): boolean {
  if (!partName) return false;
  
  const normalized = normalizePartName(partName);
  
  if (partImageRegistry[normalized]) return true;
  
  for (const key of Object.keys(partImageRegistry)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return true;
    }
  }
  
  return false;
}
