import axios from 'axios';
import type { Earthquake } from '../../types/earthquake';

export const fetchEarthquakeData = async (): Promise<Earthquake[]> => {
  const url =
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.csv';
  const { data } = await axios.get(url);

  // Split CSV into lines and skip the header
  const lines = data.split('\n').slice(1);

  const result: Earthquake[] = lines
    .map((line: string) => {
      // Quote-aware CSV parser to handle commas inside quoted strings
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
      // Map CSV columns to Earthquake fields
      return {
        id: cols[11],
        place: cols[13],
        mag: parseFloat(cols[4]),
        magType: cols[5],
        time: cols[0],
        latitude: parseFloat(cols[1]),
        longitude: parseFloat(cols[2]),
        depth: parseFloat(cols[3]),
        updated: cols[12],
        status: cols[19],
        type: cols[14],
        net: cols[10],
        locationSource: cols[20],
        magSource: cols[21],
        nst: cols[6] ? parseFloat(cols[6]) : null,
        magNst: cols[18] ? parseFloat(cols[18]) : null,
        gap: cols[7] ? parseFloat(cols[7]) : null,
        dmin: cols[8] ? parseFloat(cols[8]) : null,
        rms: cols[9] ? parseFloat(cols[9]) : null,
        horizontalError: cols[15] ? parseFloat(cols[15]) : null,
        depthError: cols[16] ? parseFloat(cols[16]) : null,
        magError: cols[17] ? parseFloat(cols[17]) : null,
      };
    })
     // Keep only rows with valid magnitude and id
    .filter((e: Earthquake): e is Earthquake => !isNaN(e.mag) && !!e.id);

  return result;
};
