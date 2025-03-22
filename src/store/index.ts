import { configureStore } from '@reduxjs/toolkit';
import { clientsReducer } from './slices/clientsSlice';
import { contractsReducer } from './slices/contractsSlice';
import { authReducer } from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    contracts: contractsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 