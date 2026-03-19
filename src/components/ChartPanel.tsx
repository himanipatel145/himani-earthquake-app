/**
 * ChartPanel.tsx — Interactive scatter chart for earthquake data.
 *
 * Demonstrates:
 * - Props → data + selection handler
 * - Context → hover state (shared with table)
 * - Redux → persistent selected state
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartEvent, ActiveElement } from 'chart.js';
import type { Earthquake } from '../types/earthquake';
import { useEarthquakeSelection } from '../context/EarthquakeSelectionContext';

// Required for scatter chart
ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

interface ChartPanelProps {
  data: Earthquake[];
  selectedId: string | null; // from Redux
  onSelectQuake: (id: string | null) => void; // dispatch action
}

// Map UI labels → data keys
const variableMap: Record<string, keyof Earthquake> = {
  Magnitude: 'mag',
  Depth: 'depth',
  Latitude: 'latitude',
  Longitude: 'longitude',
  RMS: 'rms',
  Gap: 'gap',
  Dmin: 'dmin',
  'Mag Error': 'magError',
  'Depth Error': 'depthError',
  'Horizontal Error': 'horizontalError',
  'Mag Nst': 'magNst',
};

// Selected point color
const SELECTED_BG = 'rgba(234, 88, 12, 0.9)';
const SELECTED_BORDER = 'rgba(194, 65, 12, 1)';

// Convert hex → rgb
function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

// Generate colors based on theme + user selection
function buildPalette(hex: string, dark: boolean) {
  const { r, g, b } = hexToRgb(hex);
  return {
    defaultBg: `rgba(${r}, ${g}, ${b}, ${dark ? 0.45 : 0.35})`,
    defaultBorder: `rgba(${r}, ${g}, ${b}, ${dark ? 0.7 : 0.65})`,
    dimmedBg: `rgba(${r}, ${g}, ${b}, ${dark ? 0.12 : 0.1})`,
    dimmedBorder: `rgba(${r}, ${g}, ${b}, ${dark ? 0.2 : 0.2})`,
  };
}

function ChartPanel({ data, selectedId, onSelectQuake }: ChartPanelProps) {
  // Context → hover state
  const { hoveredQuakeId, handleHoverQuake } = useEarthquakeSelection();

  // Hover overrides click
  const activeQuakeId = hoveredQuakeId ?? selectedId;

  const [xAxis, setXAxis] = useState('Magnitude');
  const [yAxis, setYAxis] = useState('Depth');
  const [pointColor, setPointColor] = useState('#7c3aed');

  // Track theme (light/dark)
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-bs-theme') === 'dark',
  );

  // Watch theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-bs-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });
    return () => observer.disconnect();
  }, []);

  const palette = useMemo(() => buildPalette(pointColor, isDark), [pointColor, isDark]);

  const lastHoveredIndex = useRef<number | null>(null);

  const variables = Object.keys(variableMap);
  const xKey = variableMap[xAxis];
  const yKey = variableMap[yAxis];

  // Remove invalid points
  const filteredData = useMemo(() => {
    return data.filter((eq) => {
      const xVal = eq[xKey];
      const yVal = eq[yKey];
      return xVal != null && yVal != null && !isNaN(Number(xVal)) && !isNaN(Number(yVal));
    });
  }, [data, xKey, yKey]);

  // Find active point index
  const activeFilteredIndex = useMemo(
    () => (activeQuakeId ? filteredData.findIndex((eq) => eq.id === activeQuakeId) : -1),
    [filteredData, activeQuakeId],
  );

  // Build dataset with dynamic styling
  const chartData = useMemo(() => {
    const hasSelection = activeFilteredIndex !== -1;

    return {
      datasets: [
        {
          label: `${yAxis} vs ${xAxis}`,
          data: filteredData.map((eq) => ({
            x: Number(eq[xKey]),
            y: Number(eq[yKey]),
          })),
          backgroundColor: filteredData.map((_, i) =>
            hasSelection ? (i === activeFilteredIndex ? SELECTED_BG : palette.dimmedBg) : palette.defaultBg
          ),
          borderColor: filteredData.map((_, i) =>
            hasSelection ? (i === activeFilteredIndex ? SELECTED_BORDER : palette.dimmedBorder) : palette.defaultBorder
          ),
          pointRadius: filteredData.map((_, i) =>
            hasSelection ? (i === activeFilteredIndex ? 10 : 3) : 4
          ),
          borderWidth: filteredData.map((_, i) =>
            hasSelection && i === activeFilteredIndex ? 2 : 1
          ),
        },
      ],
    };
  }, [filteredData, xKey, yKey, xAxis, yAxis, activeFilteredIndex, palette]);

  // Click → update Redux selection
  const handleChartClick = useCallback(
    (_event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        const quake = filteredData[elements[0].index];
        onSelectQuake(quake?.id === selectedId ? null : quake?.id ?? null);
      } else {
        onSelectQuake(null);
      }
    },
    [filteredData, selectedId, onSelectQuake],
  );

  // Hover → update Context (avoid duplicate updates)
  const handleChartHover = useCallback(
    (_event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        if (idx !== lastHoveredIndex.current) {
          lastHoveredIndex.current = idx;
          handleHoverQuake(filteredData[idx]?.id ?? null);
        }
      } else if (lastHoveredIndex.current !== null) {
        lastHoveredIndex.current = null;
        handleHoverQuake(null);
      }
    },
    [filteredData, handleHoverQuake],
  );

  // Theme-based styles
  const styles = getComputedStyle(document.documentElement);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    onHover: handleChartHover,
    plugins: {
      legend: {
        labels: { color: styles.getPropertyValue('--legend-color').trim() },
      },
      tooltip: {
        backgroundColor: styles.getPropertyValue('--tooltip-bg').trim(),
        titleColor: styles.getPropertyValue('--tooltip-title').trim(),
        bodyColor: styles.getPropertyValue('--tooltip-body').trim(),
        callbacks: {
          title: (items: any[]) =>
            items.length ? filteredData[items[0].dataIndex]?.place ?? '' : '',
          label: (ctx: any) =>
            `${xAxis}: ${ctx.parsed.x}, ${yAxis}: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: xAxis },
      },
      y: {
        title: { display: true, text: yAxis },
      },
    },
  };

  return (
    <div className="chart-panel">
      {/* Controls */}
      <div className="row mb-3 align-items-end">
        <div className="col">
          <Form.Select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
            {variables.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Form.Select>
        </div>

        <div className="col">
          <Form.Select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
            {variables.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Form.Select>
        </div>

        <div className="col-auto">
          <Form.Control
            type="color"
            value={pointColor}
            onChange={(e) => setPointColor(e.target.value)}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="chart-panel__canvas">
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  );
}

export default ChartPanel;