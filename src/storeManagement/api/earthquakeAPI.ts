import axios from 'axios';
import type { Earthquake } from '../../types/earthquake';

export const fetchEarthquakeData = async (): Promise<Earthquake[]> => {
  const url =
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.csv';
  const { data } = await axios.get(url);
  const lines = data.split('\n').slice(1);

  const result: Earthquake[] = lines
    .map((line: string) => {
      const cols: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      cols.push(current);
      return {
        id: cols[11],
        place: cols[13],
        mag: parseFloat(cols[4]),
        time: cols[0],
        latitude: parseFloat(cols[1]),
        longitude: parseFloat(cols[2]),
        depth: parseFloat(cols[3]),
      };
    })
    .filter((e: Earthquake): e is Earthquake => !isNaN(e.mag) && !!e.id);

  return result;
};
