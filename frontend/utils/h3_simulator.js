/**
 * ── H3 GEOSPATIAL SIMULATOR ──
 * Simulates Uber's H3 spatial indexing system at street-level granularity.
 * Returns valid-looking hex IDs like '8a2a1072b59ffff'.
 */

export const h3Index = {
  // Generate a realistic H3 index for a given zone/city
  getHexForLocation(zone, city) {
    const seed = (zone + city).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hexParts = [
      '8a2a', 
      (seed % 65535).toString(16).padStart(4, '0'),
      ((seed * 3) % 65535).toString(16).padStart(4, '0'),
      'ffff'
    ];
    return hexParts.join('');
  },

  // Get neighboring hexes to simulate peer verification
  getNeighbors(hexID) {
    return Array.from({ length: 6 }, (_, i) => {
      const parts = hexID.split('');
      parts[i + 5] = ((parseInt(parts[i + 5], 16) + 1) % 16).toString(16);
      return parts.join('');
    });
  }
};
