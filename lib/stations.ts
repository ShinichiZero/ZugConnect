import stations from "@/data/major-db-stations.json";

export interface Station {
  id: string;
  evaId: string;
  name: string;
  aliases: string[];
  lat: number;
  lon: number;
}

export const MAJOR_DB_STATIONS = stations as Station[];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ä/g, "a")
    .replace(/Ä/g, "A")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .trim();

export function searchStations(query: string, limit = 8): Station[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return MAJOR_DB_STATIONS.slice(0, limit);
  }

  return MAJOR_DB_STATIONS.map((station) => {
    const names = [station.name, ...station.aliases];
    const bestScore = names.reduce((score, name) => {
      const normalizedName = normalize(name);

      if (normalizedName === normalizedQuery) return Math.max(score, 100);
      if (normalizedName.startsWith(normalizedQuery)) return Math.max(score, 75);
      if (normalizedName.includes(normalizedQuery)) return Math.max(score, 50);

      return score;
    }, 0);

    return { station, score: bestScore };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ station }) => station);
}
