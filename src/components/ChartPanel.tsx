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
  const DEFAULT_BG = palette.defaultBg;
  const DEFAULT_BORDER = palette.defaultBorder;
  const DIMMED_BG = palette.dimmedBg;
  const DIMMED_BORDER = palette.dimmedBorder;

  // Ref to the Chart.js instance (for programmatic tooltip display)
  const chartRef = useRef<ChartJS<'scatter'>>(null);

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

    const backgroundColors = filteredData.map((_, i) =>
      hasSelection ? (i === activeFilteredIndex ? SELECTED_BG : DIMMED_BG) : DEFAULT_BG,
    );
    const borderColors = filteredData.map((_, i) =>
      hasSelection ? (i === activeFilteredIndex ? SELECTED_BORDER : DIMMED_BORDER) : DEFAULT_BORDER,
    );
    // Selected point is enlarged to 10 px; others shrink to 3 px when a selection exists
    const radii = filteredData.map((_, i) =>
      hasSelection ? (i === activeFilteredIndex ? 10 : 3) : 4,
    );

    return {
      datasets: [
        {
          label: `${yAxis} vs ${xAxis}`,
          data: filteredData.map((eq) => ({
            x: Number(eq[xKey]),
            y: Number(eq[yKey]),
          })),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          pointRadius: radii,
          borderWidth: filteredData.map((_, i) =>
            hasSelection && i === activeFilteredIndex ? 2 : 1,
          ),
        },
      ],
    };
  }, [filteredData, xKey, yKey, xAxis, yAxis, activeFilteredIndex, pointColor, isDark]);

  // Click → update Redux selection
  const handleChartClick = useCallback(
    (_event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        const quake = filteredData[idx];
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


  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (activeFilteredIndex !== -1) {
      const meta = chart.getDatasetMeta(0);
      const point = meta.data[activeFilteredIndex];
      if (point) {
        chart.tooltip?.setActiveElements(
          [{ datasetIndex: 0, index: activeFilteredIndex }],
          { x: point.x, y: point.y },
        );
        chart.setActiveElements([{ datasetIndex: 0, index: activeFilteredIndex }]);
        chart.update('none');
      }
    } else {
      chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
      chart.setActiveElements([]);
      chart.update('none');
    }
  }, [activeFilteredIndex]);

  /* -- Chart.js options — colours adapt to the active theme ------------ */

  // Theme-based styles
  const styles = getComputedStyle(document.documentElement);
  const labelColor = styles.getPropertyValue('--chart-label').trim();
  const tickColor = styles.getPropertyValue('--chart-tick').trim();
  const gridColor = styles.getPropertyValue('--chart-grid').trim();
  const tooltipBg = styles.getPropertyValue('--tooltip-bg').trim();
  const tooltipTitle = styles.getPropertyValue('--tooltip-title').trim();
  const tooltipBody = styles.getPropertyValue('--tooltip-body').trim();
  const tooltipBorder = styles.getPropertyValue('--tooltip-border').trim();
  const legendColor = styles.getPropertyValue('--legend-color').trim();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    onHover: handleChartHover,
    plugins: {
      legend: {
        display: true,
        labels: { color: legendColor },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        borderColor: tooltipBorder,
        borderWidth: 1,
        callbacks: {
          title: (items: any[]) => {
            if (!items.length) return '';
            const eq = filteredData[items[0].dataIndex];
            return eq?.place ?? '';
          },
          label: (ctx: any) => {
            const eq = filteredData[ctx.dataIndex];
            if (!eq) return `${xAxis}: ${ctx.parsed.x}, ${yAxis}: ${ctx.parsed.y}`;
            const lines = [
              `Magnitude: ${eq.mag} ${eq.magType}`,
              `Depth: ${eq.depth} km`,
              `Lat: ${eq.latitude}, Lng: ${eq.longitude}`,
              `Time: ${new Date(eq.time).toLocaleString()}`,
              `Status: ${eq.status}`,
              `Type: ${eq.type}`,
            ];
            if (eq.rms != null) lines.push(`RMS: ${eq.rms}`);
            if (eq.gap != null) lines.push(`Gap: ${eq.gap}°`);
            if (eq.dmin != null) lines.push(`Dmin: ${eq.dmin}`);
            if (eq.nst != null) lines.push(`NST: ${eq.nst}`);
            if (eq.magNst != null) lines.push(`Mag NST: ${eq.magNst}`);
            if (eq.magError != null) lines.push(`Mag Error: \u00b1${eq.magError}`);
            if (eq.depthError != null) lines.push(`Depth Error: \u00b1${eq.depthError} km`);
            if (eq.horizontalError != null) lines.push(`Horiz Error: \u00b1${eq.horizontalError} km`);
            return lines;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: xAxis, color: labelColor },
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
      y: {
        title: { display: true, text: yAxis, color: labelColor },
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
    },
  };

  return (
    <div className="chart-panel">
      {/* Controls */}
      <div className="row mb-3 align-items-end">
        <div className="col">
          <Form.Group controlId="xAxisSelect">
            <Form.Label><strong>X-Axis:</strong></Form.Label>
            <Form.Select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
              {variables.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <div className="col">
          <Form.Group controlId="yAxisSelect">
            <Form.Label><strong>Y-Axis:</strong></Form.Label>
            <Form.Select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
              {variables.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <div className="col-auto">
          <Form.Group controlId="pointColorPicker">
            <Form.Label><strong>Color:</strong></Form.Label>
            <Form.Control
              type="color"
              value={pointColor}
              onChange={(e) => setPointColor(e.target.value)}
              title="Pick point colour"
              style={{ width: 40, height: 38, padding: 2, cursor: 'pointer' }}
            />
          </Form.Group>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-panel__canvas">
        <Scatter ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}

export default ChartPanel;