/** Root application component */
import { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import './App.css';
import MainLayout from './components/MainLayout';
import { EarthquakeSelectionProvider } from './context/EarthquakeSelectionContext';

const App = () => {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-bs-theme') === 'dark',
  );

  // Sync the data-bs-theme attribute on <html> whenever isDark changes
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  return (
    <>
      {/* Gradient header bar & theme toggle */}
      <header className="app-header">
        <div className="app-header__content">
          <div>
            <h1 className="app-header__title">Earthquake Visualization Dashboard</h1>
            <p className="app-header__subtitle">
              Real-time USGS data
            </p>
          </div>
          <Button
            variant={isDark ? 'outline-light' : 'outline-dark'}
            size="sm"
            className="app-header__toggle"
            onClick={toggleTheme}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </header>

      <EarthquakeSelectionProvider>
        <MainLayout />
      </EarthquakeSelectionProvider>
    </>
  );
};

export default App;
