import { configureStore } from '@reduxjs/toolkit';
import meterReducer from '../store/slice/meterSlice';

export const store = configureStore({
  reducer: {
    meters: meterReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
