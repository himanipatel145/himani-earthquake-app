import { configureStore } from '@reduxjs/toolkit';
import { earthquakeReducer } from '../reducer/earthquakeReducer';

export const store = configureStore({
  reducer: {
    earthquakes: earthquakeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
