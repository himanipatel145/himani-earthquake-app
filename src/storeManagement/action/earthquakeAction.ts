import type { Dispatch } from 'redux';
import { fetchEarthquakeData } from '../api/earthquakeAPI';
import type { Earthquake } from '../../types/earthquake';

/* ── Action type constants ─────────────────────────────────────────── */
export const FETCH_EARTHQUAKES_REQUEST = 'FETCH_EARTHQUAKES_REQUEST';
export const FETCH_EARTHQUAKES_SUCCESS = 'FETCH_EARTHQUAKES_SUCCESS';
export const FETCH_EARTHQUAKES_FAILURE = 'FETCH_EARTHQUAKES_FAILURE';
export const SELECT_EARTHQUAKE = 'SELECT_EARTHQUAKE';

/* Async thunk to fetch earthquake data */
export const fetchEarthquakes = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_EARTHQUAKES_REQUEST });
  try {
    const result: Earthquake[] = await fetchEarthquakeData();
    dispatch({ type: FETCH_EARTHQUAKES_SUCCESS, payload: result });
  } catch (error: any) {
    dispatch({ type: FETCH_EARTHQUAKES_FAILURE, payload: error.message });
  }
};

/* Action creator to select/deselect an earthquake */
export const selectEarthquake = (id: string | null) => ({
  type: SELECT_EARTHQUAKE,
  payload: id,
});
