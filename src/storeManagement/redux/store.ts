import { configureStore } from '@reduxjs/toolkit';
import { earthquakeReducer } from '../reducer/earthquakeReducer';

// Configure Redux store with the earthquake reducer
export const store = configureStore({
  reducer: {
    earthquakes: earthquakeReducer,
  },
});

// Export inferred types for type-safe usage
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;