# Earthquake Visualization Dashboard

An interactive **React + TypeScript** dashboard that visualizes real-time earthquake data from the USGS.  
It displays earthquake data using a scatter chart and a paginated table with synchronized interactions.

## Features

- **Scatter chart** with selectable X/Y axes — 11 numeric variables (Magnitude, Depth, Latitude, Longitude, RMS, Gap, Dmin, Mag Error, Depth Error, Horizontal Error, Mag Nst)
- **Paginated data table** displaying all 22 USGS fields (20 rows per page) with sticky column headers and page navigation
- **Bidirectional interaction** — hover or click a chart point to highlight the corresponding table row in green (and vice-versa); the table auto-navigates to the correct page and scrolls into view
- **Green selection highlight** — selected rows display a solid green background with a green left-border accent (allocation-page style)
- **Light / Dark mode toggle** — switch between light and dark themes via a button in the header; all components (chart, table, pagination, cards) adapt to the selected theme
- **Responsive design** — side-by-side panels on desktop, vertically stacked on mobile with appropriate scrolling behaviour
- **Three state management patterns** demonstrated side-by-side (see Architecture below)

## Dependencies

| Package            | Version  | Purpose                                |
| ------------------ | -------- | -------------------------------------- |
| `react`            | ^19.2.4  | UI library                             |
| `react-dom`        | ^19.2.4  | DOM rendering                          |
| `react-redux`      | ^9.2.0   | React bindings for Redux               |
| `@reduxjs/toolkit` | ^2.11.2  | Redux store configuration & utilities  |
| `redux`            | ^5.0.1   | Predictable state container            |
| `redux-thunk`      | ^3.1.0   | Middleware for async Redux actions     |
| `axios`            | ^1.13.6  | HTTP client for fetching USGS CSV data |
| `chart.js`         | ^4.5.1   | Canvas-based charting library          |
| `react-chartjs-2`  | ^5.3.1   | React wrapper for Chart.js             |
| `bootstrap`        | ^5.3.8   | CSS framework (light/dark mode)        |
| `react-bootstrap`  | ^2.10.10 | Bootstrap components for React         |
| `typescript`       | ~5.9.3   | Static type checking                   |
| `vite`             | ^8.0.0   | Development server & build tool        |

## Project Structure

```
src/
├── main.tsx                          # Entry point — Redux Provider + StrictMode
├── App.tsx                           # Root component — header, theme toggle + Context Provider
├── App.css                           # Header gradient & theme toggle styles
├── index.css                         # Global CSS variables (light & dark) + base styles
├── types/
│   └── earthquake.ts                 # Earthquake interface (23 fields)
├── context/
│   └── EarthquakeSelectionContext.tsx # React Context for transient hover state
├── components/
│   ├── MainLayout.tsx                # Two-panel responsive layout (chart + table)
│   ├── ChartPanel.tsx                # Interactive scatter chart (11 axis options)
│   ├── DataTable.tsx                 # Paginated data table with green highlight
│   └── components.css                # Component-level styles (light & dark themes)
└── storeManagement/
    ├── api/
    │   └── earthquakeAPI.ts          # USGS CSV fetch & quote-aware parser
    ├── action/
    │   └── earthquakeAction.ts       # Redux action types & async thunk
    ├── reducer/
    │   └── earthquakeReducer.ts      # Reducer handling fetch lifecycle + selection
    └── redux/
        └── store.ts                  # Redux store configuration & type exports
```

## Setup Instructions

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Install & Run

```bash
# Clone the repository
git clone git@github.com:himanipatel145/himani-earthquake-app.git
cd himani-earthquake-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173) in your browser.

### Production Build

```bash
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview the production build locally
```

## State Management Architecture

This project intentionally demonstrates **three distinct state management patterns**, each handling a different concern:

### 1. Props (Parent to Child)

The earthquake `data` array, the `selectedId`, and the `onSelectQuake` event handler are all **passed as props** from `MainLayout` to both `<ChartPanel>` and `<DataTable>`. This demonstrates transferring both data and event handlers from parent to child.

```
MainLayout  ──data, selectedId, onSelectQuake──►  ChartPanel
            ──data, selectedId, onSelectQuake──►  DataTable
```

### 2. React Context (Shared UI State)

Transient **hover state** (which earthquake is currently under the cursor) is managed in `EarthquakeSelectionContext`. Both `ChartPanel` and `DataTable` consume this context directly via the `useEarthquakeSelection()` hook — no prop drilling required. Hover state is intentionally kept in Context rather than Redux because it changes rapidly on every mouse-move.

```
EarthquakeSelectionProvider
  ├── ChartPanel   ◄──► useEarthquakeSelection() → hoveredQuakeId
  └── DataTable    ◄──► useEarthquakeSelection() → hoveredQuakeId
```

### 3. Redux (External Library)

The global earthquake dataset **and the clicked selection** are stored in a Redux store. Data is fetched via an async thunk action (`fetchEarthquakes`), and the clicked earthquake is managed via the `selectEarthquake` action. `MainLayout` reads both `data` and `selectedId` from the store with `useSelector`, then passes them as props to children.

```
Component  ──dispatch(fetchEarthquakes())──►  Thunk  ──►  API  ──►  Reducer  ──►  Store
Component  ──dispatch(selectEarthquake(id))──────────────────────►  Reducer  ──►  Store
                                                                                   │
Component  ◄──useSelector(state.earthquakes.data / selectedId)─────────────────────┘
```

Each component combines all three patterns: it receives data and handlers via **Props**, reads hover state from **Context**, and the handler it calls dispatches to the **Redux** store.

## Additional Features

- **11 axis options** — Dropdown menus let the user pick any combination of Magnitude, Depth, Latitude, Longitude, RMS, Gap, Dmin, Mag Error, Depth Error, Horizontal Error, and Mag Nst for the chart's X and Y axes. Null values are filtered automatically.
- **Pagination** — The data table renders 20 rows per page with a full pagination bar (Prev/Next, page numbers, ellipsis). When a chart point is selected, the table auto-navigates to the correct page.
- **Bidirectional interaction** — Hovering or clicking in either the chart or the table highlights the same earthquake in both views with a solid green row highlight and green left-border accent.
- **Light / Dark mode** — A toggle button in the header switches between light and dark themes. All UI components (chart colours, table, cards, pagination, form controls) adapt via CSS custom properties.
- **Responsive layout** — Bootstrap grid (`col-md-6`) provides side-by-side panels on desktop and vertically stacked panels on mobile, with appropriate scroll behaviour.
- **Loading spinner** — Bootstrap `<Spinner>` component shown while data is being fetched from the USGS API.
