import {
  FETCH_EARTHQUAKES_REQUEST,
  FETCH_EARTHQUAKES_SUCCESS,
  FETCH_EARTHQUAKES_FAILURE,
  SELECT_EARTHQUAKE,
} from '../action/earthquakeAction';
import type { Earthquake } from '../../types/earthquake';

interface State {
  data: Earthquake[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

const initialState: State = {
  data: [],
  loading: false,
  error: null,
  selectedId: null,
};

export function earthquakeReducer(state = initialState, action: any): State {
  switch (action.type) {
    case FETCH_EARTHQUAKES_REQUEST:
      return { ...state, loading: true };
    case FETCH_EARTHQUAKES_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_EARTHQUAKES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SELECT_EARTHQUAKE:
      return { ...state, selectedId: action.payload };
    default:
      return state;
  }
}
