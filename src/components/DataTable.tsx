/** Paginated earthquake data table */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pagination, Table } from 'react-bootstrap';
import type { Earthquake } from '../types/earthquake';
import { useEarthquakeSelection } from '../context/EarthquakeSelectionContext';

interface DataTableProps {
  data: Earthquake[];
  selectedId: string | null;
  onSelectQuake: (id: string | null) => void;
}

const ROWS_PER_PAGE = 20;
const MAX_PAGE_BUTTONS = 5;

const DataTable: React.FC<DataTableProps> = ({ data, selectedId, onSelectQuake }) => {
  const { hoveredQuakeId, handleHoverQuake } = useEarthquakeSelection();

  // Hover overrides click
  const activeQuakeId = hoveredQuakeId ?? selectedId;

  const [currentPage, setCurrentPage] = useState(1);

  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const pendingScrollId = useRef<string | null>(null);

  // Prevent auto-scroll when hover originates from table
  const isTableHover = useRef(false);

  const totalPages = Math.max(1, Math.ceil(data.length / ROWS_PER_PAGE));

  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) setCurrentPage(safePage);

  const startIdx = (safePage - 1) * ROWS_PER_PAGE;

  const pageData = useMemo(
    () => data.slice(startIdx, startIdx + ROWS_PER_PAGE),
    [data, startIdx],
  );

  useEffect(() => {
    if (!activeQuakeId) return;
    if (isTableHover.current) return;

    const globalIdx = data.findIndex((eq) => eq.id === activeQuakeId);
    if (globalIdx === -1) return;

    const targetPage = Math.floor(globalIdx / ROWS_PER_PAGE) + 1;

    if (targetPage !== currentPage) {
      pendingScrollId.current = activeQuakeId;
      setCurrentPage(targetPage);
    } else {
      const row = rowRefs.current.get(activeQuakeId);
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeQuakeId, data]);

  // After page change, scroll to selected row
  useEffect(() => {
    if (!pendingScrollId.current) return;

    const id = pendingScrollId.current;
    pendingScrollId.current = null;

    setTimeout(() => {
      const row = rowRefs.current.get(id);
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }, [pageData]);

  const paginationItems = useMemo(() => {
    const items: React.ReactNode[] = [];

    let startPage = Math.max(1, safePage - Math.floor(MAX_PAGE_BUTTONS / 2));
    const endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1);
    startPage = Math.max(1, endPage - MAX_PAGE_BUTTONS + 1);

    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => setCurrentPage(1)}>1</Pagination.Item>,
      );
      if (startPage > 2) items.push(<Pagination.Ellipsis key="start-dots" disabled />);
    }

    for (let p = startPage; p <= endPage; p++) {
      items.push(
        <Pagination.Item key={p} active={p === safePage} onClick={() => setCurrentPage(p)}>
          {p}
        </Pagination.Item>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<Pagination.Ellipsis key="end-dots" disabled />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </Pagination.Item>,
      );
    }

    return items;
  }, [safePage, totalPages]);

  if (!data || data.length === 0) {
    return <p className="text-muted text-center">No earthquake data available</p>;
  }

  return (
    <>
      <div className="table-responsive data-table-scroll">
        <Table hover size="sm" className="data-table">
          <thead className="data-table__head">
            <tr>
              <th>Time</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Depth (km)</th>
              <th>Mag</th>
              <th>Mag Type</th>
              <th>nst</th>
              <th>Gap</th>
              <th>dmin</th>
              <th>rms</th>
              <th>Net</th>
              <th>ID</th>
              <th>Updated</th>
              <th>Place</th>
              <th>Type</th>
              <th>Horizontal Error</th>
              <th>Depth Error</th>
              <th>Mag Error</th>
              <th>Mag nst</th>
              <th>Status</th>
              <th>Location Source</th>
              <th>Mag Source</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((quake) => (
              <tr
                key={quake.id}
                // Register/unregister row refs
                ref={(el) => {
                  if (el) rowRefs.current.set(quake.id, el);
                  else rowRefs.current.delete(quake.id);
                }}
                className={`${quake.id === activeQuakeId ? 'data-table__row--selected' : ''} ${quake.id === selectedId ? 'data-table__row--clicked' : ''}`}
                onClick={() => onSelectQuake(quake.id === selectedId ? null : quake.id)}
                onMouseEnter={() => {
                  isTableHover.current = true;
                  handleHoverQuake(quake.id);
                }}
                onMouseLeave={() => {
                  isTableHover.current = false;
                  handleHoverQuake(null);
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>{quake.time}</td>
                <td>{quake.latitude?.toFixed(6) ?? '—'}</td>
                <td>{quake.longitude?.toFixed(6) ?? '—'}</td>
                <td>{quake.depth?.toFixed(2) ?? '—'}</td>
                <td>{quake.mag?.toFixed(2) ?? '—'}</td>
                <td>{quake.magType ?? '—'}</td>
                <td>{quake.nst ?? '—'}</td>
                <td>{quake.gap ?? '—'}</td>
                <td>{quake.dmin?.toFixed(5) ?? '—'}</td>
                <td>{quake.rms?.toFixed(2) ?? '—'}</td>
                <td>{quake.net ?? '—'}</td>
                <td>{quake.id ?? '—'}</td>
                <td>{quake.updated ?? '—'}</td>
                <td>{quake.place ?? '—'}</td>
                <td>{quake.type ?? '—'}</td>
                <td>{quake.horizontalError?.toFixed(2) ?? '—'}</td>
                <td>{quake.depthError?.toFixed(2) ?? '—'}</td>
                <td>{quake.magError?.toFixed(3) ?? '—'}</td>
                <td>{quake.magNst ?? '—'}</td>
                <td>{quake.status ?? '—'}</td>
                <td>{quake.locationSource ?? '—'}</td>
                <td>{quake.magSource ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="data-table__footer">
        <Pagination size="sm" className="data-table__pagination mb-0">
          <Pagination.Prev
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          />
          {paginationItems}
          <Pagination.Next
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          />
        </Pagination>
        <small className="text-muted">
          {startIdx + 1}–{Math.min(startIdx + ROWS_PER_PAGE, data.length)} of {data.length.toLocaleString()} earthquakes
        </small>
      </div>
    </>
  );
};

export default DataTable;