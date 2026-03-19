/** Two-panel dashboard layout */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './components.css';
import ChartPanel from './ChartPanel';
import DataTable from './DataTable';
import { fetchEarthquakes, selectEarthquake } from '../storeManagement/action/earthquakeAction';
import type { RootState } from '../storeManagement/redux/store';

function MainLayout() {
  const dispatch = useDispatch();
  const { loading, error, data, selectedId } = useSelector(
    (state: RootState) => state.earthquakes,
  );

  // Fetch earthquake data 
  useEffect(() => {
    dispatch<any>(fetchEarthquakes());
  }, [dispatch]);

  // Dispatch selection to Redux
  const handleSelectQuake = useCallback(
    (id: string | null) => {
      dispatch(selectEarthquake(id));
    },
    [dispatch],
  );

  return (
    <div className="container-fluid py-3 main-layout">
      <div className="row main-layout__row">
        {/* Left panel — Scatter chart */}
        <div className="col-md-6 d-flex flex-column main-layout__panel">
          <div className="card flex-grow-1 shadow-sm main-layout__card">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title mb-3">Earthquake Chart</h5>

              {/* Show spinner while data is loading */}
              {loading && (
                <div className="loading-container">
                  <Spinner animation="border" variant="info" />
                  <span className="ms-2 text-muted">Loading chart data&hellip;</span>
                </div>
              )}

              {error && <p className="text-danger">Error: {error}</p>}

              {!loading && !error && (
                <div className="chart-panel__chart-wrapper">
                  <ChartPanel
                    data={data}
                    selectedId={selectedId}
                    onSelectQuake={handleSelectQuake}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel — Data table */}
        <div className="col-md-6 d-flex flex-column main-layout__panel">
          <div className="card flex-grow-1 shadow-sm main-layout__card">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title mb-3">Earthquake Data</h5>

              {/* Loading state — Bootstrap spinner */}
              {loading && (
                <div className="loading-container">
                  <Spinner animation="border" variant="info" />
                  <span className="ms-2 text-muted">Fetching earthquake data&hellip;</span>
                </div>
              )}

              {error && <p className="text-danger">Error: {error}</p>}

              {!loading && !error && (
                <div className="main-layout__table-wrapper">
                  <DataTable
                    data={data}
                    selectedId={selectedId}
                    onSelectQuake={handleSelectQuake}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
