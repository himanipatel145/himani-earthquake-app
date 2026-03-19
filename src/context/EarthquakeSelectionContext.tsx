import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

/* Context type */
interface EarthquakeSelectionContextType {
  hoveredQuakeId: string | null;
  handleHoverQuake: (id: string | null) => void;
}

/* Create context */
const EarthquakeSelectionContext = createContext<EarthquakeSelectionContextType | undefined>(
  undefined,
);

/* Provider component */
export function EarthquakeSelectionProvider({ children }: { children: ReactNode }) {
  const [hoveredQuakeId, setHoveredQuakeId] = useState<string | null>(null);

  const handleHoverQuake = useCallback((id: string | null) => {
    setHoveredQuakeId(id);
  }, []);

  return (
    <EarthquakeSelectionContext.Provider
      value={{
        hoveredQuakeId,
        handleHoverQuake,
      }}
    >
      {children}
    </EarthquakeSelectionContext.Provider>
  );
}

/* Custom hook to consume the context */

export function useEarthquakeSelection(): EarthquakeSelectionContextType {
  const ctx = useContext(EarthquakeSelectionContext);
  if (!ctx) {
    throw new Error(
      'useEarthquakeSelection must be used within an <EarthquakeSelectionProvider>',
    );
  }
  return ctx;
}
